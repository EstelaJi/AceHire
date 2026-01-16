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


class CodingGenerateRequest(BaseModel):
  difficulty: str


class CodingEvaluateRequest(BaseModel):
  question: str
  code: str
  difficulty: str


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


@app.post("/coding/generate")
async def coding_generate(payload: CodingGenerateRequest):
  """Generate a coding question based on difficulty"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY not configured")
    
    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.8,
      max_tokens=1000,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )
    
    difficulty = payload.difficulty or "medium"
    
    # Build prompt for generating coding question
    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""你是一位专业的算法面试官，擅长生成编程面试题目。

请根据指定的难度生成一道算法题，难度分为：easy、medium、hard。

返回格式必须是严格的JSON格式，包含以下字段：
{{
  "title": "题目标题",
  "description": "题目详细描述",
  "difficulty": "难度（easy/medium/hard）",
  "examples": [
    {{
      "input": "示例输入",
      "output": "示例输出",
      "explanation": "示例解释"
    }}
  ],
  "constraints": ["约束条件1", "约束条件2"]
}}

要求：
1. 题目描述清晰易懂
2. 至少提供2个示例
3. 列出3-5个约束条件
4. 难度要符合指定级别
5. 题目类型可以是：数组、字符串、链表、树、动态规划、贪心算法等"""),
      HumanMessage(content=f"请生成一道{difficulty}难度的算法题，返回JSON格式。")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    # Extract JSON from response
    import json
    import re
    
    response_text = response.content if hasattr(response, 'content') else str(response)
    
    # Try to extract JSON from the response
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
      json_str = json_match.group()
      try:
        question_data = json.loads(json_str)
        return question_data
      except json.JSONDecodeError:
        pass
    
    # If JSON parsing fails, return a default question
    default_questions = {
      "easy": {
        "title": "两数之和",
        "description": "给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回他们的数组下标。\n\n你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。",
        "difficulty": "easy",
        "examples": [
          {
            "input": "nums = [2, 7, 11, 15], target = 9",
            "output": "[0, 1]",
            "explanation": "因为 nums[0] + nums[1] = 2 + 7 = 9，所以返回 [0, 1]"
          }
        ],
        "constraints": [
          "2 <= nums.length <= 10^4",
          "-10^9 <= nums[i] <= 10^9",
          "-10^9 <= target <= 10^9",
          "只会存在一个有效答案"
        ]
      },
      "medium": {
        "title": "无重复字符的最长子串",
        "description": "给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度。",
        "difficulty": "medium",
        "examples": [
          {
            "input": "s = \"abcabcbb\"",
            "output": "3",
            "explanation": "因为无重复字符的最长子串是 \"abc\"，所以其长度为 3"
          },
          {
            "input": "s = \"bbbbb\"",
            "output": "1",
            "explanation": "因为无重复字符的最长子串是 \"b\"，所以其长度为 1"
          }
        ],
        "constraints": [
          "0 <= s.length <= 5 * 10^4",
          "s 由英文字母、数字、符号和空格组成"
        ]
      },
      "hard": {
        "title": "正则表达式匹配",
        "description": "给你一个字符串 s 和一个字符规律 p，请你来实现一个支持 '.' 和 '*' 的正则表达式匹配。\n\n'.' 匹配任意单个字符\n'*' 匹配零个或多个前面的那一个元素\n\n所谓匹配，是要涵盖整个字符串 s 的，而不是部分字符串。",
        "difficulty": "hard",
        "examples": [
          {
            "input": "s = \"aa\", p = \"a\"",
            "output": "false",
            "explanation": "\"a\" 无法匹配 \"aa\" 整个字符串"
          },
          {
            "input": "s = \"aa\", p = \"a*\"",
            "output": "true",
            "explanation": "因为 '*' 代表可以匹配零个或多个前面的元素，在这里前面的元素就是 'a'。因此，字符串 \"aa\" 可被视为 'a' 重复了一次"
          }
        ],
        "constraints": [
          "1 <= s.length <= 20",
          "1 <= p.length <= 20",
          "s 只包含小写英文字母",
          "p 只包含小写英文字母、'.' 和 '*'",
          "保证每次出现字符 '*' 时，前面都匹配到有效的字符"
        ]
      }
    }
    
    return default_questions.get(difficulty, default_questions["medium"])
    
  except Exception as e:
    import traceback
    error_msg = f"Error generating coding question: {str(e)}"
    print(error_msg)
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=error_msg)


@app.post("/coding/evaluate")
async def coding_evaluate(payload: CodingEvaluateRequest):
  """Evaluate the submitted code for the coding question"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      raise HTTPException(status_code=500, detail="DEEPSEEK_API_KEY not configured")
    
    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.3,
      max_tokens=1000,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )
    
    # Build prompt for evaluating code
    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=f"""你是一位专业的代码评估专家，擅长评估算法题的解答。

你的任务是评估用户提交的代码，判断其是否正确，并给出详细的反馈。

返回格式必须是严格的JSON格式，包含以下字段：
{{
  "is_correct": true/false,
  "feedback": "详细的反馈意见",
  "score": 0-100的分数（可选）,
  "time_complexity": "时间复杂度分析（可选）",
  "space_complexity": "空间复杂度分析（可选）"
}}

评估标准：
1. 代码逻辑是否正确
2. 边界条件是否处理
3. 时间复杂度和空间复杂度是否合理
4. 代码风格和可读性
5. 是否有更优的解决方案

难度参考：
- easy: 期望时间复杂度 O(n) 或 O(n log n)
- medium: 期望时间复杂度 O(n) 或 O(n log n)
- hard: 期望时间复杂度 O(n) 或 O(n log n)，可能需要动态规划等高级算法"""),
      HumanMessage(content=f"""题目：{payload.question}
难度：{payload.difficulty}

用户提交的代码：
```python
{payload.code}
```

请评估这段代码，返回JSON格式的评估结果。""")
    ])
    
    chain = prompt | llm
    response = chain.invoke({})
    
    # Extract JSON from response
    import json
    import re
    
    response_text = response.content if hasattr(response, 'content') else str(response)
    
    # Try to extract JSON from the response
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if json_match:
      json_str = json_match.group()
      try:
        evaluation_data = json.loads(json_str)
        return evaluation_data
      except json.JSONDecodeError:
        pass
    
    # If JSON parsing fails, return a default evaluation
    return {
      "is_correct": False,
      "feedback": "无法解析评估结果，请检查代码格式或联系管理员",
      "score": 0
    }
    
  except Exception as e:
    import traceback
    error_msg = f"Error evaluating code: {str(e)}"
    print(error_msg)
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=error_msg)

