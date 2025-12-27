from datetime import datetime, timedelta
import json
import os
from typing import Dict

# Use absolute imports to avoid package context issues when running uvicorn main:app
from whisperASR import WhisperASR
from interviewQuestionGenerator import InterviewQuestionGenerator
from answerEvaluator import AnswerEvaluator
from voiceAnalysis import VoiceAnalysis
from skillMatcher import SkillMatcher

class AIInterviewEngine:
    def __init__(self, job_description: str, candidate_info: Dict):
        self.job_desc = job_description
        self.candidate_info = candidate_info
        
        # 初始化所有组件
        self.asr = WhisperASR(model_size="base")
        api_key = os.getenv("DEEPSEEK_API_KEY", candidate_info.get("api_key", ""))
        self.question_generator = InterviewQuestionGenerator(
            api_key=api_key,
            job_description=job_description
        )
        self.evaluator = AnswerEvaluator()
        self.voice_analyzer = VoiceAnalysis()
        self.skill_matcher = SkillMatcher()
        
        # 面试状态
        self.interview_state = {
            "current_question": None,
            "questions_asked": [],
            "answers": [],
            "scores": [],
            "start_time": datetime.now(),
            "status": "in_progress"
        }
        
    async def conduct_interview(self, audio_stream):
        """主面试流程"""
        
        # 1. 转录语音
        transcript = await self.asr.transcribe_realtime(audio_stream)
        
        # 如果是第一个问题
        if not self.interview_state["questions_asked"]:
            from interviewQuestionGenerator import InterviewPhase
            question_result = self.question_generator.generate_question(
                job_description=self.job_desc,
                candidate_info=self.candidate_info,
                phase=InterviewPhase.INTRODUCTION,
                difficulty="easy",
                question_type="general"
            )
            question = question_result.get("question", "请介绍一下你自己。")
            self.interview_state["current_question"] = question
            return {"action": "ask_question", "question": question}
        
        # 2. 评估回答
        current_question = self.interview_state["current_question"]
        evaluation = self.evaluator.evaluate_answer(
            question=current_question,
            answer=transcript["text"],
            expected_points=self._get_expected_points(current_question)
        )
        
        # 3. 保存回答和评分
        self.interview_state["answers"].append({
            "question": current_question,
            "answer": transcript["text"],
            "evaluation": evaluation,
            "timestamp": datetime.now().isoformat()
        })
        self.interview_state["scores"].append(evaluation["total_score"])
        
        # 4. 决定下一步
        if self._should_continue_interview():
            # 生成下一个问题或追问
            if evaluation["total_score"] < 6.0:
                # 分数较低，追问
                strengths = []
                weaknesses = []
                if "feedback" in evaluation:
                    # 从 feedback 中提取优势与不足（简化处理）
                    feedback = evaluation["feedback"]
                    if "较好" in feedback or "不错" in feedback:
                        strengths = ["回答基本相关"]
                    if "需要" in feedback or "不足" in feedback:
                        weaknesses = ["需要更多细节"]
                follow_up_result = self.question_generator.generate_follow_up(
                    original_question=current_question,
                    candidate_answer=transcript["text"],
                    strengths=strengths,
                    weaknesses=weaknesses
                )
                next_question = follow_up_result.get("follow_up_question", "请详细说明一下。")
            else:
                # 生成新问题
                from interviewQuestionGenerator import InterviewPhase
                next_result = self.question_generator.generate_question(
                    job_description=self.job_desc,
                    candidate_info=self.candidate_info,
                    phase=InterviewPhase.TECHNICAL,
                    difficulty="medium",
                    question_type="technical",
                    history=f"Previous answer: {transcript['text']}"
                )
                next_question = next_result.get("question", "请继续回答下一个问题。")
            
            self.interview_state["current_question"] = next_question
            self.interview_state["questions_asked"].append(next_question)
            
            return {
                "action": "ask_question",
                "question": next_question,
                "previous_score": evaluation["total_score"]
            }
        else:
            # 结束面试
            self.interview_state["status"] = "completed"
            return await self._generate_final_report()
    
    def _should_continue_interview(self) -> bool:
        """判断是否继续面试"""
        # 基于问题数量、时间、分数等因素
        questions_asked = len(self.interview_state["questions_asked"])
        avg_score = sum(self.interview_state["scores"]) / len(self.interview_state["scores"])
        
        if questions_asked >= 10:  # 最多10个问题
            return False
        elif avg_score < 4.0 and questions_asked >= 5:  # 表现太差
            return False
        elif datetime.now() - self.interview_state["start_time"] > timedelta(minutes=30):
            return False
        
        return True
    
    async def _generate_final_report(self) -> Dict:
        """生成最终面试报告"""
        # 分析语音特征
        audio_features = self.voice_analyzer.analyze_speech_patterns(
            self.interview_state.get("audio_file"),
            " ".join([a["answer"] for a in self.interview_state["answers"]])
        )
        
        # 技能匹配
        resume_text = self.candidate_info.get("resume", "")
        skill_match = self.skill_matcher.match_skills(resume_text, self.job_desc)
        
        # 综合评分
        technical_score = sum(self.interview_state["scores"]) / len(self.interview_state["scores"])
        communication_score = audio_features["confidence_indicator"] / 10  # 转换为10分制
        overall_score = technical_score * 0.7 + communication_score * 0.3
        
        return {
            "action": "end_interview",
            "report": {
                "candidate_info": self.candidate_info,
                "technical_assessment": {
                    "overall_score": round(overall_score, 1),
                    "technical_score": round(technical_score, 1),
                    "communication_score": round(communication_score, 1),
                    "detailed_scores": [a["evaluation"] for a in self.interview_state["answers"]]
                },
                "skill_match": skill_match,
                "voice_analysis": audio_features,
                "interview_summary": {
                    "total_questions": len(self.interview_state["questions_asked"]),
                    "duration_minutes": (datetime.now() - self.interview_state["start_time"]).seconds / 60,
                    "strengths": self._identify_strengths(),
                    "weaknesses": self._identify_weaknesses()
                },
                "recommendation": self._generate_recommendation(overall_score),
                "suggested_questions": self._suggest_followup_questions()
            }
        }