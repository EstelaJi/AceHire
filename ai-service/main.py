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


class CodingQuestionRequest(BaseModel):
  difficulty: str


class CodingEvaluationRequest(BaseModel):
  questionId: str
  code: str
  language: str


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
  session_id = os.urandom(16).hex()
  candidate_info = payload.candidate_info or {}
  if "api_key" not in candidate_info:
    candidate_info["api_key"] = os.getenv("DEEPSEEK_API_KEY", "")
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
  first_question = first_result.get("question", "请介绍一下你自己。")
  engine.interview_state["current_question"] = first_question
  engine.interview_state["questions_asked"].append(first_question)
  return {"session_id": session_id, "question": first_question}


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


@app.post("/coding/generate-question")
async def generate_coding_question(payload: CodingQuestionRequest):
    """Generate a coding interview question based on difficulty level"""
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.messages import SystemMessage, HumanMessage
        import uuid
        
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            return {"question": None, "error": "API key not configured"}
        
        llm = ChatOpenAI(
            model_name="deepseek-chat",
            temperature=0.7,
            max_tokens=1000,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        )
        
        difficulty = payload.difficulty.lower()
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""你是一位专业的算法面试官，需要生成高质量的编程面试题。

要求：
1. 根据难度级别生成合适的算法题
2. 题目必须包含：
   - 清晰的问题描述
   - 至少2个示例（输入、输出、解释）
   - 明确的约束条件
3. 返回格式必须是JSON格式，包含以下字段：
   - id: 唯一标识符
   - title: 题目标题
   - difficulty: 难度级别（easy/medium/hard）
   - description: 问题描述
   - examples: 示例数组，每个示例包含input、output、explanation
   - constraints: 约束条件
4. 只返回JSON，不要有其他任何文本

难度要求：
- easy: 简单算法，如数组遍历、字符串操作、简单排序
- medium: 中等难度，如动态规划、树、图、滑动窗口
- hard: 困难算法，如复杂动态规划、贪心算法、高级数据结构"""),
            HumanMessage(content=f"请生成一个{difficulty}难度的编程面试题，返回JSON格式")
        ])
        
        chain = prompt | llm
        response = chain.invoke({})
        
        print(f"LLM Response: {response.content}")
        
        import json
        try:
            result = json.loads(response.content)
            result["id"] = str(uuid.uuid4())
            return {"question": result}
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if json_match:
                try:
                    result = json.loads(json_match.group())
                    result["id"] = str(uuid.uuid4())
                    return {"question": result}
                except:
                    pass
            return {"question": None, "error": f"Failed to parse JSON response: {e}"}
        
    except Exception as e:
        print(f"Error generating coding question: {e}")
        return {"question": None, "error": str(e)}


@app.post("/coding/evaluate-code")
async def evaluate_code(payload: CodingEvaluationRequest):
    """Evaluate the candidate's code against the coding question"""
    try:
        from langchain_openai import ChatOpenAI
        from langchain_core.prompts import ChatPromptTemplate
        from langchain_core.messages import SystemMessage, HumanMessage
        
        api_key = os.getenv("DEEPSEEK_API_KEY", "")
        if not api_key:
            return {"result": None, "error": "API key not configured"}
        
        llm = ChatOpenAI(
            model_name="deepseek-chat",
            temperature=0.3,
            max_tokens=1500,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        )
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""你是一位专业的代码评审专家，需要评估候选人的代码是否正确解决了编程问题。

任务：
1. 仔细阅读问题描述（通过questionId识别）
2. 分析候选人的代码逻辑
3. 执行代码并验证是否通过所有测试用例
4. 返回评估结果，格式为JSON，包含：
   - isCorrect: 是否正确（true/false）
   - message: 评估总结
   - testCases: 测试用例数组，每个包含input、expected、actual、passed

要求：
- 必须生成自己的测试用例来验证代码
- 要检查边界情况
- 必须返回有效的JSON格式
- 只返回JSON，不要有其他文本"""),
            HumanMessage(content=f"""
            Question ID: {payload.questionId}
            
            候选人代码：
            ```python
            {payload.code}
            ```
            
            请评估这段代码并返回JSON格式的结果
            """)
        ])
        
        chain = prompt | llm
        response = chain.invoke({})
        
        import json
        result = json.loads(response.content)
        
        return {"result": result}
        
    except Exception as e:
        print(f"Error evaluating code: {e}")
        return {"result": None, "error": str(e)}

