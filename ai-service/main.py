import os
from pathlib import Path
from tempfile import NamedTemporaryFile
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from faster_whisper import WhisperModel
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from interviewEngine import AIInterviewEngine  # type: ignore
from interviewQuestionGenerator import InterviewPhase  # type: ignore


class AnalyzeRequest(BaseModel):
  text: str
  industry: str | None = None
  level: str | None = None

class QuestionRequest(BaseModel):
  industry: str | None = None
  level: str | None = None


class EngineStartRequest(BaseModel):
  job_description: str | None = None
  candidate_info: dict | None = None


class EngineNextRequest(BaseModel):
  session_id: str
  text: str | None = None

class AlgorithmQuestionRequest(BaseModel):
  difficulty: str = "easy"
  topic: str | None = None

class CodeEvaluationRequest(BaseModel):
  code: str
  language: str = "javascript"
  question: str
  test_cases: list | None = None


app = FastAPI(title="AI Interview Service", version="0.1.0")

ASR_MODEL_NAME = os.getenv("ASR_MODEL", "small")
ASR_DEVICE = os.getenv("ASR_DEVICE", "cpu")  # "cuda" if GPU available
ASR_COMPUTE_TYPE = os.getenv("ASR_COMPUTE_TYPE", "int8")  # int8_float16 for GPU

_whisper_model: WhisperModel | None = None
_engines: dict[str, AIInterviewEngine] = {}


def get_asr_model() -> WhisperModel:
  global _whisper_model
  if _whisper_model is None:
    _whisper_model = WhisperModel(
      ASR_MODEL_NAME,
      device=ASR_DEVICE,
      compute_type=ASR_COMPUTE_TYPE
    )
  return _whisper_model


@app.get("/health")
async def health():
  return {"status": "ok"}


@app.post("/analyze")
async def analyze(payload: AnalyzeRequest):
  """Analyze candidate's answer and generate interviewer's reply"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      return {"reply": "API key not configured. Please set DEEPSEEK_API_KEY environment variable."}
    
    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.7,
      max_tokens=300,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )
    
    # Build prompt
    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""你是一位专业的AI面试官，正在面试一位{payload.level or '中级'}级别的{payload.industry or '全栈'}开发工程师。

你的任务：
1. 对候选人的回答给出简短、专业的反馈
2. 可以追问细节或提出下一个相关问题
3. 保持友好但专业的语调
4. 回复要简洁，控制在2-3句话内"""),
      HumanMessage(content=f"候选人的回答：{payload.text}\n\n请给出你的回复（可以是反馈、追问或下一个问题）：")
    ])
    
    # 调用 LLM
    chain = prompt | llm
    response = chain.invoke({})
    
    # 提取回复文本
    reply_text = response.content if hasattr(response, 'content') else str(response)
    
    return {"reply": reply_text}
    
  except Exception as e:
    print(f"Error in /analyze: {e}")
    return {"reply": f"抱歉，处理您的回答时出现错误。请重试。错误信息：{str(e)}"}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
  if file.content_type and not file.content_type.startswith("audio/"):
    raise HTTPException(status_code=400, detail="Invalid file type, please upload audio.")

  with NamedTemporaryFile(delete=True, suffix=".tmp") as tmp:
    tmp.write(await file.read())
    tmp.flush()
    model = get_asr_model()
    segments, _info = model.transcribe(tmp.name, beam_size=1)
    transcript_parts = [seg.text.strip() for seg in segments]
    text = " ".join([p for p in transcript_parts if p])
  return {"text": text or "Transcription empty."}


@app.post("/question")
async def question(payload: QuestionRequest):
  industry = payload.industry or "General"
  level = payload.level or "General"
  return {
    "question": f"For a {industry} {level} role, please tell me about yourself and one recent project you led."
  }


@app.post("/engine/start")
async def engine_start(payload: EngineStartRequest):
  try:
    session_id = os.urandom(16).hex()
    candidate_info = payload.candidate_info or {}
    
    # Ensure API key is set
    api_key = candidate_info.get("api_key") or os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      raise ValueError("DEEPSEEK_API_KEY is required. Please set it in environment variables or candidate_info.")
    candidate_info["api_key"] = api_key
    
    # Create engine
    engine = AIInterviewEngine(
      job_description=payload.job_description or "General full-stack role",
      candidate_info=candidate_info
    )
    _engines[session_id] = engine
    
    # Generate first question
    first_result = engine.question_generator.generate_question(
      job_description=engine.job_desc,
      candidate_info=engine.candidate_info,
      phase=InterviewPhase.INTRODUCTION,
      difficulty="easy",
      question_type="general"
    )
    first_question = first_result.get("question", "Please introduce yourself.")
    engine.interview_state["current_question"] = first_question
    engine.interview_state["questions_asked"].append(first_question)
    
    return {"session_id": session_id, "question": first_question}
  except Exception as e:
    import traceback
    error_msg = f"Error starting interview engine: {str(e)}"
    print(error_msg)
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=error_msg)


@app.post("/engine/next")
async def engine_next(payload: EngineNextRequest):
  engine = _engines.get(payload.session_id)
  if not engine:
    raise HTTPException(status_code=404, detail="engine session not found")

  # Assume transcription is done, directly use text to drive
  class DummyStream:
    def __aiter__(self):
      yield payload.text

  # Reuse existing logic: if no question, generate one; here directly call evaluate process
  result = await engine.conduct_interview({"text": payload.text or ""})
  return result

@app.post("/algorithm/question")
async def generate_algorithm_question(payload: AlgorithmQuestionRequest):
  """根据难度生成算法题目"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    import json

    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      raise HTTPException(status_code=500, detail="API key not configured")

    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.7,
      max_tokens=800,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )

    difficulty_map = {
      "easy": "简单",
      "medium": "中等",
      "hard": "困难"
    }

    topic_map = {
      "array": "数组",
      "string": "字符串",
      "linkedlist": "链表",
      "tree": "树",
      "dp": "动态规划",
      "graph": "图",
      "sorting": "排序",
      "search": "搜索"
    }

    difficulty_cn = difficulty_map.get(payload.difficulty, "简单")
    topic_cn = topic_map.get(payload.topic, "") if payload.topic else ""

    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""你是一位专业的算法面试官。请生成一个{difficulty_cn}难度的算法题目。
要求：
1. 题目描述清晰简洁
2. 包含示例输入输出
3. 包含解题提示
4. 提供测试用例（至少3个）
5. 用JSON格式返回，包含以下字段：
   - title: 题目标题
   - description: 题目描述
   - difficulty: 难度 (easy/medium/hard)
   - topic: 题目类型
   - examples: 示例数组，每个包含input和output
   - hints: 提示数组
   - test_cases: 测试用例数组，每个包含input和expected_output"""),
      HumanMessage(content=f"请生成一个{difficulty_cn}难度的{topic_cn}算法题目，返回JSON格式。")
    ])

    chain = prompt | llm
    response = chain.invoke({})
    response_text = response.content if hasattr(response, "content") else str(response)

    try:
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return result
        raise HTTPException(status_code=500, detail="Failed to parse question")

  except Exception as e:
    print(f"Error generating algorithm question: {e}")
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/algorithm/evaluate")
async def evaluate_code(payload: CodeEvaluationRequest):
  """评估用户提交的代码"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    import json

    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      raise HTTPException(status_code=500, detail="API key not configured")

    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.3,
      max_tokens=1000,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )

    test_cases_str = ""
    if payload.test_cases:
        test_cases_str = "测试用例:\n"
        for i, tc in enumerate(payload.test_cases):
            test_cases_str += f"{i+1}. 输入: {tc.get('input')}, 期望输出: {tc.get('expected_output')}\n"

    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""你是一位专业的代码评审员。请评估以下代码：

题目：{payload.question}
编程语言：{payload.language}

{test_cases_str}

请从以下方面评估代码：
1. 正确性：代码是否正确解决问题
2. 时间复杂度：分析时间复杂度
3. 空间复杂度：分析空间复杂度
4. 代码质量：可读性、简洁性
5. 边界情况：是否处理了边界条件

用JSON格式返回，包含以下字段：
- score: 总分 (0-100)
- correctness: 正确性得分 (0-100)
- time_complexity: 时间复杂度分析
- space_complexity: 空间复杂度分析
- code_quality: 代码质量得分 (0-100)
- feedback: 详细的反馈和建议
- is_correct: 布尔值，代码是否正确"""),
      HumanMessage(content=f"请评估以下代码：\n\n{payload.code}")
    ])

    chain = prompt | llm
    response = chain.invoke({})
    response_text = response.content if hasattr(response, "content") else str(response)

    try:
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        import re
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            return result
        raise HTTPException(status_code=500, detail="Failed to parse evaluation")

  except Exception as e:
    print(f"Error evaluating code: {e}")
    raise HTTPException(status_code=500, detail=str(e))

