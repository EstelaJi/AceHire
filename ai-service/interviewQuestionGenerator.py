"""
AI Voice Interview System
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging

from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data model
@dataclass
class CandidateInfo:
    name: str
    years_experience: int
    skills: List[str]
    target_position: str
    current_company: Optional[str] = None
    education: Optional[str] = None

@dataclass
class Question:
    text: str
    type: str  # technical, behavioral, scenario, follow_up
    difficulty: str  # easy, medium, hard
    round_number: int
    timestamp: datetime

@dataclass
class Answer:
    question: Question
    text: str
    audio_duration: Optional[int] = None
    evaluation: Optional[Dict] = None

class InterviewPhase(Enum):
    INTRODUCTION = "introduction"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SCENARIO = "scenario"
    CLOSING = "closing"

# Interview question generator
class InterviewQuestionGenerator:
    """Interview question generator"""
    
    def __init__(self, api_key: str, model_name: str = "deepseek-chat"):
        """Initialize generator"""
        os.environ["DEEPSEEK_API_KEY"] = api_key
        
        # Use ChatOpenAI compatible with DeepSeek API
        self.llm = ChatOpenAI(
            model_name=model_name,
            temperature=0.7,
            max_tokens=500,
            streaming=False,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        )
        
        # Define output parser
        self.output_parser = JsonOutputParser()
        
        # Define prompt template for generating questions
        self.question_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""
            你是一位专业的面试官，擅长根据职位要求和候选人背景生成精准的面试问题。
            你的任务是生成高质量、有深度的面试问题。
            """),
            HumanMessagePromptTemplate.from_template("""
            请根据以下信息生成一个面试问题：
            
            **职位描述**：
            {job_description}
            
            **候选人背景**：
            {candidate_info}
            
            **当前面试阶段**：{phase}
            **问题难度**：{difficulty}
            **问题类型**：{question_type}
            
            **之前的对话历史**：
            {history}
            
            **生成要求**：
            1. 问题要具体、可衡量
            2. 针对候选人的经验级别
            3. 能有效评估相关能力
            4. 避免过于宽泛的问题
            
            请以JSON格式返回：
            {{
                "question": "生成的问题文本",
                "reasoning": "为什么问这个问题",
                "expected_skills": ["期望考察的技能列表"],
                "evaluation_criteria": ["评估标准列表"]
            }}
            """)
        ])
        
        # Define prompt template for generating follow-up questions
        self.follow_up_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""
            你是一位敏锐的面试官，擅长通过追问深入挖掘候选人的能力。
            """),
            HumanMessagePromptTemplate.from_template("""
            基于以下信息生成一个跟进问题：
            
            **原始问题**：{original_question}
            
            **候选人回答**：{candidate_answer}
            
            **回答质量分析**：
            优势：{strengths}
            不足：{weaknesses}
            
            **生成要求**：
            1. 针对回答中的不足或模糊点
            2. 帮助澄清技术细节
            3. 验证实际经验深度
            4. 鼓励候选人提供具体例子
            
            请以JSON格式返回：
            {{
                "follow_up_question": "跟进问题",
                "focus_area": "重点关注领域",
                "purpose": "追问的目的"
            }}
            """)
        ])
    
    def generate_question(
        self,
        job_description: str,
        candidate_info: Dict,
        phase: InterviewPhase = InterviewPhase.TECHNICAL,
        difficulty: str = "medium",
        question_type: str = "technical",
        history: str = ""
    ) -> Dict:
        """生成面试问题"""
        try:
            # Create chain
            chain = self.question_prompt | self.llm | self.output_parser
            
            # Prepare input
            input_data = {
                "job_description": job_description,
                "candidate_info": json.dumps(candidate_info, ensure_ascii=False),
                "phase": phase.value,
                "difficulty": difficulty,
                "question_type": question_type,
                "history": history or "这是第一个问题"
            }
            
            # Call chain
            result = chain.invoke(input_data)
            
            # Add metadata
            result["metadata"] = {
                "phase": phase.value,
                "difficulty": difficulty,
                "type": question_type,
                "generated_at": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"生成问题时出错: {e}")
            # Return default question
            return {
                "question": "请介绍一下你最近参与的一个有挑战性的项目？",
                "reasoning": "考察项目经验和问题解决能力",
                "expected_skills": ["项目管理", "技术实施", "问题解决"],
                "evaluation_criteria": ["项目复杂度", "个人贡献", "成果影响"],
                "metadata": {
                    "phase": phase.value,
                    "difficulty": difficulty,
                    "type": question_type,
                    "generated_at": datetime.now().isoformat(),
                    "error": str(e)
                }
            }
    
    def generate_follow_up(
        self,
        original_question: str,
        candidate_answer: str,
        strengths: List[str],
        weaknesses: List[str]
    ) -> Dict:
        """Generate follow-up question"""
        try:
            chain = self.follow_up_prompt | self.llm | self.output_parser
            
            input_data = {
                "original_question": original_question,
                "candidate_answer": candidate_answer,
                "strengths": ", ".join(strengths) if strengths else "回答比较全面",
                "weaknesses": ", ".join(weaknesses) if weaknesses else "可以更深入"
            }
            
            result = chain.invoke(input_data)
            return result
            
        except Exception as e:
            logger.error(f"Error generating follow-up question: {e}")
            return {
                "follow_up_question": "你能更详细地说明一下具体的实现细节吗？",
                "focus_area": "技术细节",
                "purpose": "深入了解实现方案"
            }

# Answer evaluation system
class AnswerEvaluator:
    """Answer evaluation system"""
    
    def __init__(self, api_key: str):
        os.environ["DEEPSEEK_API_KEY"] = api_key
        
        self.llm = ChatOpenAI(
            model_name="deepseek-chat",
            temperature=0.3,  # Lower temperature to get more consistent evaluation
            max_tokens=300,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        )
        
        # Create evaluation prompt
        self.evaluation_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""
            你是一位专业的面试评估专家。请严格按照评分标准进行评估。
            
            评分维度：
            1. 相关性 (0-10分)：回答是否直接针对问题
            2. 完整性 (0-10分)：是否全面覆盖问题要点
            3. 深度 (0-10分)：技术深度和思考深度
            4. 清晰度 (0-10分)：表达是否清晰有条理
            5. 具体性 (0-10分)：是否提供具体例子和细节
            
            评估步骤：
            1. 分析回答内容
            2. 对照每个维度评分
            3. 提供具体理由
            4. 给出改进建议
            """),
            HumanMessagePromptTemplate.from_template("""
            请评估以下面试回答：
            
            **问题**：{question}
            
            **回答**：{answer}
            
            **期望考察的技能**：{expected_skills}
            
            **请以JSON格式返回评估结果**：
            {{
                "scores": {{
                    "relevance": 分数,
                    "completeness": 分数,
                    "depth": 分数,
                    "clarity": 分数,
                    "specificity": 分数
                }},
                "total_score": 总分（50分制）,
                "strengths": ["优势1", "优势2"],
                "weaknesses": ["不足1", "不足2"],
                "detailed_feedback": "详细的反馈和建议",
                "follow_up_suggestions": ["建议的追问方向1", "建议的追问方向2"]
            }}
            """)
        ])
        
        # 创建链
        self.chain = self.evaluation_prompt | self.llm | JsonOutputParser()
    
    def evaluate(
        self,
        question: str,
        answer: str,
        expected_skills: List[str] = None
    ) -> Dict:
        """Evaluate answer quality"""
        try:
            result = self.chain.invoke({
                "question": question,
                "answer": answer,
                "expected_skills": expected_skills or ["通用技能"]
            })
            
            # Calculate weighted total score (convert to 10-point scale)
            scores = result.get("scores", {})
            if scores:
                total = sum(scores.values()) / len(scores) / 5  # 转换为10分制
                result["weighted_score"] = round(total, 2)
            
            # Add evaluation timestamp
            result["evaluated_at"] = datetime.now().isoformat()
            
            return result
            
        except Exception as e:
            logger.error(f"Error evaluating answer: {e}")
            return self._get_default_evaluation()
    
    def _get_default_evaluation(self) -> Dict:
        """Get default evaluation result"""
        return {
            "scores": {
                "relevance": 5,
                "completeness": 5,
                "depth": 5,
                "clarity": 5,
                "specificity": 5
            },
            "total_score": 25,
            "weighted_score": 5.0,
            "strengths": ["回答基本相关"],
            "weaknesses": ["需要更多具体细节"],
            "detailed_feedback": "由于技术问题，无法进行详细评估。请确保回答具体且有结构。",
            "follow_up_suggestions": ["请提供更具体的例子"],
            "evaluated_at": datetime.now().isoformat(),
            "error": True
        }

# Voice analysis module
class VoiceAnalyzer:
    """Voice feature analysis (simplified version, actual need to integrate voice processing library)"""
    
    def analyze(self, audio_features: Dict) -> Dict:
        """Analyze voice features"""
        # Here should integrate actual voice processing library
        # Like librosa, pyAudioAnalysis, or third-party API
        
        return {
            "speech_rate": audio_features.get("speech_rate", 120),  # Words per minute
            "pause_frequency": audio_features.get("pause_frequency", 0.5),
            "confidence_score": self._calculate_confidence(audio_features),
            "emotion_analysis": {
                "confidence": 0.7,
                "engagement": 0.8,
                "nervousness": 0.3
            }
        }
    
    def _calculate_confidence(self, features: Dict) -> float:
        """Calculate confidence score"""
        # Simplified algorithm
        score = 0.5
        
        # Based on speech rate
        speech_rate = features.get("speech_rate", 120)
        if 100 <= speech_rate <= 150:
            score += 0.2
        elif speech_rate > 180:
            score -= 0.1
        elif speech_rate < 80:
            score -= 0.1
            
        return min(max(score, 0), 1)

# Core interview engine
class AIInterviewEngine:
    """AI interview engine - Main controller"""
    
    def __init__(
        self,
        job_description: str,
        candidate_info: CandidateInfo,
        api_key: str,
        config: Optional[Dict] = None
    ):
        """Initialize engine"""
        self.job_description = job_description
        self.candidate_info = candidate_info
        self.api_key = api_key
        
        # Configuration
        self.config = config or {
            "max_questions_per_phase": 3,
            "min_score_to_proceed": 6.0,
            "max_follow_ups": 2,
            "time_limit_minutes": 45
        }
        
        # Initialize components
        self.question_generator = InterviewQuestionGenerator(api_key)
        self.evaluator = AnswerEvaluator(api_key)
        self.voice_analyzer = VoiceAnalyzer()
        
        # Interview state
        self.state = {
            "current_phase": InterviewPhase.INTRODUCTION,
            "current_question_index": 0,
            "questions": [],
            "answers": [],
            "phase_history": [],
            "start_time": datetime.now(),
            "status": "not_started",
            "scores": []
        }
        
        # Define interview process
        self.phases = [
            (InterviewPhase.INTRODUCTION, "easy", 1),
            (InterviewPhase.TECHNICAL, "medium", 2),
            (InterviewPhase.TECHNICAL, "hard", 2),
            (InterviewPhase.BEHAVIORAL, "medium", 2),
            (InterviewPhase.SCENARIO, "hard", 1),
            (InterviewPhase.CLOSING, "easy", 1)
        ]
        
        logger.info(f"AI interview engine initialized, candidate: {candidate_info.name}")
    
    def start_interview(self) -> Dict:
        """Start interview"""
        self.state["status"] = "in_progress"
        
        # Generate first question
        first_question = self._generate_next_question()
        
        return {
            "status": "started",
            "question": first_question["question"],
            "phase": self.state["current_phase"].value,
            "question_number": 1,
            "total_phases": len(self.phases),
            "instructions": "请用2-3分钟时间详细回答这个问题"
        }
    
    def submit_answer(
        self,
        answer_text: str,
        audio_features: Optional[Dict] = None
    ) -> Dict:
        """Submit answer and get next step"""
        if self.state["status"] != "in_progress":
            return {"error": "Interview not started or already ended"}
        
        # Get current question
        if not self.state["questions"]:
            return {"error": "No current question"}
        
        current_question = self.state["questions"][-1]
        
        # Evaluate answer
        expected_skills = current_question.get("expected_skills", [])
        evaluation = self.evaluator.evaluate(
            question=current_question["question"],
            answer=answer_text,
            expected_skills=expected_skills
        )
        
        # Analyze voice features (if provided)
        voice_analysis = {}
        if audio_features:
            voice_analysis = self.voice_analyzer.analyze(audio_features)
        
        # Save answer record
        answer_record = {
            "question": current_question,
            "text": answer_text,
            "evaluation": evaluation,
            "voice_analysis": voice_analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        self.state["answers"].append(answer_record)
        self.state["scores"].append(evaluation.get("weighted_score", 5.0))
        
        # Determine next action
        action = self._determine_next_action(evaluation)
        
        if action == "follow_up":
            # Generate follow-up question
            follow_up = self._generate_follow_up_question(
                current_question["question"],
                answer_text,
                evaluation
            )
            
            response = {
                "action": "follow_up",
                "next_question": follow_up["follow_up_question"],
                "previous_score": evaluation["weighted_score"],
                "feedback": evaluation.get("detailed_feedback", ""),
                "suggestions": evaluation.get("follow_up_suggestions", []),
                "phase": self.state["current_phase"].value,
                "question_number": len(self.state["questions"]) + 1
            }
            
        elif action == "next_phase":
            # Move to next phase
            next_phase_result = self._move_to_next_phase()
            
            if next_phase_result["status"] == "interview_completed":
                # Interview ended
                final_report = self._generate_final_report()
                self.state["status"] = "completed"
                
                response = {
                    "action": "complete",
                    "report": final_report,
                    "summary": {
                        "total_questions": len(self.state["questions"]),
                        "average_score": sum(self.state["scores"]) / len(self.state["scores"]),
                        "phases_completed": len(self.state["phase_history"])
                    }
                }
            else:
                # Generate next phase question
                next_question = self._generate_next_question()
                
                response = {
                    "action": "next_phase",
                    "next_question": next_question["question"],
                    "phase": self.state["current_phase"].value,
                    "phase_progress": f"{len(self.state['phase_history'])}/{len(self.phases)}",
                    "message": f"Enter {self.state['current_phase'].value} phase"
                }
        else:
            # Continue current phase
            next_question = self._generate_next_question()
            
            response = {
                "action": "continue",
                "next_question": next_question["question"],
                "previous_score": evaluation["weighted_score"],
                "phase": self.state["current_phase"].value,
                "question_number": len(self.state["questions"]) + 1
            }
        
        return response
    
    def _generate_next_question(self) -> Dict:
        """Generate next question"""
        # Get current phase information
        phase_info = self._get_current_phase_info()
        
        # Build conversation history
        history = self._build_conversation_history()
        
        # Generate question
        question = self.question_generator.generate_question(
            job_description=self.job_description,
            candidate_info=self.candidate_info.__dict__,
            phase=self.state["current_phase"],
            difficulty=phase_info["difficulty"],
            question_type=phase_info["type"],
            history=history
        )
        
        # Save question
        question["phase"] = self.state["current_phase"].value
        question["question_number"] = len(self.state["questions"]) + 1
        question["generated_at"] = datetime.now().isoformat()
        
        self.state["questions"].append(question)
        self.state["current_question_index"] += 1
        
        return question
    
    def _generate_follow_up_question(
        self,
        original_question: str,
        answer: str,
        evaluation: Dict
    ) -> Dict:
        """Generate follow-up question"""
        strengths = evaluation.get("strengths", [])
        weaknesses = evaluation.get("weaknesses", [])
        
        follow_up = self.question_generator.generate_follow_up(
            original_question=original_question,
            candidate_answer=answer,
            strengths=strengths,
            weaknesses=weaknesses
        )
        
        # Add metadata
        follow_up["is_follow_up"] = True
        follow_up["original_question"] = original_question
        follow_up["phase"] = self.state["current_phase"].value
        
        self.state["questions"].append(follow_up)
        
        return follow_up
    
    def _determine_next_action(self, evaluation: Dict) -> str:
        """Determine next action based on evaluation result"""
        score = evaluation.get("weighted_score", 5.0)
        
        # Check if should follow up
        current_phase_questions = [
            q for q in self.state["questions"] 
            if q.get("phase") == self.state["current_phase"].value
        ]
        
        # Calculate follow-up count in current phase
        follow_up_count = sum(1 for q in current_phase_questions if q.get("is_follow_up", False))
        
        # If score is low and follow-up count is not exceeded, follow up
        if score < self.config["min_score_to_proceed"] and follow_up_count < self.config["max_follow_ups"]:
            return "follow_up"
        
        # Check if should move to next phase
        questions_in_current_phase = len([
            q for q in self.state["questions"] 
            if q.get("phase") == self.state["current_phase"].value and not q.get("is_follow_up", False)
        ])
        
        if questions_in_current_phase >= self._get_current_phase_info()["question_count"]:
            return "next_phase"
        
        # Otherwise continue current phase
        return "continue"
    
    def _move_to_next_phase(self) -> Dict:
        """Move to next phase"""
        # Record current phase completion
        self.state["phase_history"].append({
            "phase": self.state["current_phase"].value,
            "questions_count": len([q for q in self.state["questions"] if q.get("phase") == self.state["current_phase"].value]),
            "average_score": self._calculate_phase_average_score(),
            "completed_at": datetime.now().isoformat()
        })
        
        # Find next phase
        current_index = next(
            (i for i, (phase, _, _) in enumerate(self.phases) 
             if phase == self.state["current_phase"]),
            -1
        )
        
        if current_index == -1 or current_index >= len(self.phases) - 1:
            # All phases completed
            return {"status": "interview_completed"}
        
        # Set next phase
        next_phase, next_difficulty, next_count = self.phases[current_index + 1]
        self.state["current_phase"] = next_phase
        self.state["current_question_index"] = 0
        
        return {
            "status": "phase_changed",
            "new_phase": next_phase.value,
            "difficulty": next_difficulty,
            "question_count": next_count
        }
    
    def _get_current_phase_info(self) -> Dict:
        """Get current phase information"""
        for phase, difficulty, count in self.phases:
            if phase == self.state["current_phase"]:
                return {
                    "phase": phase.value,
                    "difficulty": difficulty,
                    "question_count": count,
                    "type": "technical" if phase in [InterviewPhase.TECHNICAL, InterviewPhase.SCENARIO] 
                            else "behavioral" if phase == InterviewPhase.BEHAVIORAL 
                            else "general"
                }
        return {"phase": "technical", "difficulty": "medium", "question_count": 2, "type": "technical"}
    
    def _build_conversation_history(self) -> str:
        """Build conversation history"""
        if not self.state["answers"]:
            return "This is the first question"
        
        history_lines = []
        for i, (question, answer) in enumerate(zip(self.state["questions"], self.state["answers"])):
            history_lines.append(f"Q{i+1}: {question['question']}")
            history_lines.append(f"A{i+1}: {answer['text'][:100]}...")
        
        return "\n".join(history_lines)
    
    def _calculate_phase_average_score(self) -> float:
        """Calculate average score in current phase"""
        phase_answers = [
            a for a, q in zip(self.state["answers"], self.state["questions"]) 
            if q.get("phase") == self.state["current_phase"].value
        ]
        
        if not phase_answers:
            return 0.0
        
        scores = [a["evaluation"].get("weighted_score", 5.0) for a in phase_answers]
        return sum(scores) / len(scores)
    
    def _generate_final_report(self) -> Dict:
        """Generate final interview report"""
        # Use LLM to generate comprehensive report
        report_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""
            你是一位资深的人力资源专家和面试评估官。
            请基于以下面试数据生成专业的面试评估报告。
            
            报告应包括：
            1. 总体评价和推荐等级
            2. 技术能力分析
            3. 软技能评估
            4. 优势与亮点
            5. 改进建议
            6. 是否推荐及理由
            """),
            HumanMessagePromptTemplate.from_template("""
            **候选人信息**：
            {candidate_info}
            
            **职位要求**：
            {job_description}
            
            **面试表现数据**：
            总问题数：{total_questions}
            平均得分：{average_score}/10
            各阶段表现：{phase_performance}
            
            **关键回答摘要**：
            {answer_summaries}
            
            **请生成详细的面试评估报告**。
            """)
        ])
        
        # Prepare data
        candidate_info_str = json.dumps(self.candidate_info.__dict__, ensure_ascii=False, indent=2)
        
        # Summarize performance of each phase
        phase_performance = []
        for phase_record in self.state["phase_history"]:
            phase_performance.append(
                f"{phase_record['phase']}: {phase_record['average_score']:.1f}/10"
            )
        
        # Key answer summaries
        answer_summaries = []
        for i, (q, a) in enumerate(zip(self.state["questions"][:3], self.state["answers"][:3])):
            answer_summaries.append(
                f"问题{i+1}: {q['question'][:50]}...\n"
                f"回答摘要: {a['text'][:100]}...\n"
                f"得分: {a['evaluation'].get('weighted_score', 5.0):.1f}/10"
            )
        
        # Create report chain
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        report_chain = report_prompt | ChatOpenAI(
            model_name="deepseek-chat",
            temperature=0.5,
            max_tokens=800,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        ) | StrOutputParser()
        
        try:
            report = report_chain.invoke({
                "candidate_info": candidate_info_str,
                "job_description": self.job_description,
                "total_questions": len(self.state["questions"]),
                "average_score": sum(self.state["scores"]) / len(self.state["scores"]) if self.state["scores"] else 0,
                "phase_performance": "; ".join(phase_performance),
                "answer_summaries": "\n\n".join(answer_summaries)
            })
            
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            report = f"Report generation failed: {str(e)}"
        
        # Calculate overall score
        overall_score = self._calculate_overall_score()
        
        return {
            "candidate_name": self.candidate_info.name,
            "target_position": self.candidate_info.target_position,
            "interview_date": self.state["start_time"].strftime("%Y-%m-%d"),
            "duration_minutes": (datetime.now() - self.state["start_time"]).seconds / 60,
            "overall_score": overall_score,
            "recommendation_level": self._get_recommendation_level(overall_score),
            "detailed_report": report,
            "key_metrics": {
                "questions_answered": len(self.state["questions"]),
                "average_question_score": sum(self.state["scores"]) / len(self.state["scores"]) if self.state["scores"] else 0,
                "phases_completed": len(self.state["phase_history"]),
                "follow_up_questions": sum(1 for q in self.state["questions"] if q.get("is_follow_up", False))
            },
            "generated_at": datetime.now().isoformat()
        }
    
    def _calculate_overall_score(self) -> float:
        """计算总体分数"""
        if not self.state["scores"]:
            return 0.0
        
        # Can weight different phases scores
        phase_weights = {
            InterviewPhase.INTRODUCTION.value: 0.1,
            InterviewPhase.TECHNICAL.value: 0.5,
            InterviewPhase.BEHAVIORAL.value: 0.3,
            InterviewPhase.SCENARIO.value: 0.8,  # Scenario questions have higher weight
            InterviewPhase.CLOSING.value: 0.1
        }
        
        weighted_sum = 0
        total_weight = 0
        
        for phase_record in self.state["phase_history"]:
            weight = phase_weights.get(phase_record["phase"], 0.5)
            weighted_sum += phase_record["average_score"] * weight
            total_weight += weight
        
        if total_weight == 0:
            return sum(self.state["scores"]) / len(self.state["scores"])
        
        return weighted_sum / total_weight
    
    def _get_recommendation_level(self, score: float) -> str:
        """Get recommendation level based on score"""
        if score >= 8.5:
            return "Strongly recommend"
        elif score >= 7.0:
            return "Recommend"
        elif score >= 5.5:
            return "Consider"
        elif score >= 4.0:
            return "Reserved recommend"
        else:
            return "Not recommend"

# ============ 使用示例 ============
def main():
    """Example usage"""
    
    # Configure API key (should be read from environment variable in production)
    API_KEY = os.getenv("DEEPSEEK_API_KEY", "your-api-key-here")
    
    # Job description
    JOB_DESCRIPTION = """
    职位：高级Python后端开发工程师
    
    职责：
    1. 设计和实现高性能、可扩展的后端系统
    2. 开发和维护微服务架构
    3. 与前端团队协作定义API接口
    4. 优化系统性能，确保高可用性
    5. 编写高质量、可维护的代码
    
    要求：
    1. 5年以上Python开发经验
    2. 精通Django/Flask框架
    3. 熟悉Docker和Kubernetes
    4. 有云平台(AWS/Azure/GCP)经验
    5. 良好的数据库设计和优化能力
    6. 熟悉分布式系统设计
    7. 良好的沟通和团队协作能力
    """
    
    # Candidate information
    candidate = CandidateInfo(
        name="张三",
        years_experience=6,
        skills=["Python", "Django", "Docker", "AWS", "MySQL", "Redis"],
        target_position="高级Python后端开发工程师",
        current_company="ABC科技有限公司",
        education="计算机科学硕士"
    )
    
    # Create interview engine
    print("Initializing AI interview engine...")
    interview = AIInterviewEngine(
        job_description=JOB_DESCRIPTION,
        candidate_info=candidate,
        api_key=API_KEY,
        config={
            "max_questions_per_phase": 3,
            "min_score_to_proceed": 6.0,
            "max_follow_ups": 2,
            "time_limit_minutes": 45
        }
    )
    
    # Start interview
    print("\n=== AI voice interview started ===")
    start_result = interview.start_interview()
    print(f"Phase: {start_result['phase']}")
    print(f"Question: {start_result['question']}")
    
    # Simulate candidate answer
    print("\nSimulating candidate answer...")
    answer = """
    我在上一家公司主要负责电商平台的后端架构设计。我们使用Django作为主要框架，
    部署在AWS上，使用Docker容器化。我设计了订单处理微服务，将原来单体应用中的
    订单模块拆分为独立的服务，提高了系统的可扩展性和容错能力。
    
    具体来说，我实现了：
    1. 基于RabbitMQ的异步消息队列处理订单
    2. 使用Redis缓存热点商品数据
    3. 设计分库分表方案解决MySQL性能瓶颈
    4. 实现灰度发布和回滚机制
    
    这个重构使系统TPS从原来的100提升到了500，同时降低了服务器成本约30%。
    """
    
    # Submit answer
    response = interview.submit_answer(answer)
    
    print(f"\nAI response:")
    print(f"Action: {response['action']}")
    if response['action'] == 'follow_up':
        print(f"Follow-up question: {response['next_question']}")
        print(f"Previous question score: {response['previous_score']}/10")
        print(f"Feedback: {response['feedback'][:100]}...")
    elif response['action'] == 'next_phase':
        print(f"New phase: {response['phase']}")
        print(f"New question: {response['next_question']}")
    elif response['action'] == 'continue':
        print(f"Continue current phase")
        print(f"New question: {response['next_question']}")
    
    # Simulate end interview and generate report
    print("\n=== Interview ended ===")
    # Here you can continue to simulate more questions...
    
    # Manually trigger report generation (should be done automatically after all phases are completed)
    # final_report = interview._generate_final_report()
    # print(f"Final report summary:")
    # print(f"Overall score: {final_report['overall_score']}/10")
    # print(f"Recommendation level: {final_report['recommendation_level']}")

if __name__ == "__main__":
    # Configure environment variable (for demonstration, should be read from secure location in production)
    os.environ["DEEPSEEK_API_KEY"] = "your-actual-api-key"
    
    main()