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
      "easy": "Easy",
      "medium": "Medium",
      "hard": "Hard"
    }

    topic_map = {
      "array": "Array",
      "string": "String",
      "linkedlist": "Linked List",
      "tree": "Tree",
      "dp": "Dynamic Programming",
      "graph": "Graph",
      "sorting": "Sorting",
      "search": "Search"
    }

    difficulty_en = difficulty_map.get(payload.difficulty, "Easy")
    topic_en = topic_map.get(payload.topic, "") if payload.topic else ""

    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""You are a professional algorithm interviewer. Please generate an algorithm question with {difficulty_en} difficulty.

Requirements:
1. Clear and concise problem description
2. Include example input and output
3. Include hints for solving the problem
4. Provide test cases (at least 3)
5. Return in JSON format with these fields:
   - title: question title
   - description: problem description
   - difficulty: difficulty level (easy/medium/hard)
   - topic: question topic
   - examples: array of examples, each with input and output
   - hints: array of hints
   - test_cases: array of test cases, each with input and expected_output

Respond ONLY with valid JSON."""),
      HumanMessage(content=f"Please generate an {difficulty_en} difficulty {topic_en} algorithm question. Return only valid JSON.")
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
        test_cases_str = "Test Cases:\n"
        for i, tc in enumerate(payload.test_cases):
            test_cases_str += f"{i+1}. Input: {tc.get('input')}, Expected Output: {tc.get('expected_output')}\n"

    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""You are a professional code reviewer. Please evaluate the following code:

Question: {payload.question}
Programming Language: {payload.language}

{test_cases_str}

Evaluate the code on these aspects:
1. Correctness: Does the code correctly solve the problem?
2. Time Complexity: Analyze the time complexity
3. Space Complexity: Analyze the space complexity
4. Code Quality: Readability, conciseness
5. Edge Cases: Does it handle edge cases?

Return in JSON format with these fields:
- score: overall score (0-100)
- correctness: correctness score (0-100)
- time_complexity: time complexity analysis
- space_complexity: space complexity analysis
- code_quality: code quality score (0-100)
- feedback: detailed feedback and suggestions
- is_correct: boolean, whether the code is correct

Respond ONLY with valid JSON."""),
      HumanMessage(content=f"Please evaluate this code:\n\n{payload.code}")
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

