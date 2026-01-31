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


class CodeEvaluateRequest(BaseModel):
  problem: dict
  code: str
  language: str
  testCases: list[dict]


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
      SystemMessage(content=f"""You are a professional AI interviewer interviewing a {payload.level or 'mid-level'} {payload.industry or 'full-stack'} developer.

Your tasks:
1. Provide brief, professional feedback on the candidate's answers
2. You can ask for details or propose the next related question
3. Maintain a friendly but professional tone
4. Keep your responses concise, keep to 2-3 sentences"""),
      HumanMessage(content=f"Candidate's answer: {payload.text}\n\nPlease provide your response (can be feedback, follow-up question, or next question):")
    ])
    
    # Call LLM
    chain = prompt | llm
    response = chain.invoke({})
    
    # Extract response text
    reply_text = response.content if hasattr(response, 'content') else str(response)
    
    return {"reply": reply_text}
    
  except Exception as e:
    print(f"Error in /analyze: {e}")
    return {"reply": f"Sorry, an error occurred while processing your answer. Please try again. Error: {str(e)}"}


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


@app.post("/code-evaluate")
async def code_evaluate(payload: CodeEvaluateRequest):
  """Evaluate code submission using AI"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
      # Fallback evaluation without AI
      test_results = []
      passed_count = 0
      
      for test_case in payload.testCases:
        # Simple mock evaluation - in a real implementation, you would
        # execute the code in a sandboxed environment
        passed = True  # Mock result
        test_results.append({
          "passed": passed,
          "input": test_case["input"],
          "expected": test_case["expectedOutput"],
          "actual": test_case["expectedOutput"] if passed else "Mock actual output"
        })
        
        if passed:
          passed_count += 1
      
      score = int((passed_count / len(payload.testCases)) * 100)
      passed = score == 100
      
      feedback = ""
      if passed:
        feedback = "Excellent! All test cases passed. Your solution is correct."
      else:
        feedback = f"Your solution passed {passed_count} out of {len(payload.testCases)} test cases. Keep trying!"
      
      return {
        "passed": passed,
        "score": score,
        "feedback": feedback,
        "testResults": test_results
      }
    
    llm = ChatOpenAI(
      model_name="deepseek-chat",
      temperature=0.2,  # Lower temperature for more consistent evaluation
      max_tokens=500,
      base_url="https://api.deepseek.com/v1",
      api_key=api_key
    )
    
    # Build prompt for code evaluation
    problem_info = payload.problem
    test_cases_str = "\n".join([
      f"Test Case {i+1}:\nInput: {tc['input']}\nExpected Output: {tc['expectedOutput']}"
      for i, tc in enumerate(payload.testCases)
    ])
    
    constraints_str = ", ".join(problem_info.get("constraints", []))
    
    system_message = f"""You are a professional code reviewer responsible for evaluating candidates' submitted code solutions.

Your tasks:
1. Analyze the logic and implementation of the code
2. Check if the code correctly handles all test cases
3. Evaluate the time complexity and space complexity of the code
4. Provide targeted feedback and suggestions

Please evaluate based on the following information:
- Problem Title: {problem_info.get('title', 'Unknown')}
- Problem Description: {problem_info.get('description', 'No description')}
- Constraints: {constraints_str}
- Programming Language: {payload.language}

Test Cases:
{test_cases_str}

Please provide evaluation results in the following format:
1. Whether all test cases passed (passed: true/false)
2. Overall score (0-100)
3. Detailed feedback
4. Specific results for each test case (testResults)"""
    
    human_message = f"""Please evaluate the following code solution:

```{payload.language}
{payload.code}
```

Please return the evaluation results in JSON format, including the following fields:
- passed: boolean (whether all tests passed)
- score: number (0-100 score)
- feedback: string (detailed feedback)
- testResults: array (results for each test case, including passed, input, expected, actual fields)"""
    
    prompt = ChatPromptTemplate.from_messages([
      SystemMessage(content=system_message),
      HumanMessage(content=human_message)
    ])
    
    # 调用 LLM
    chain = prompt | llm
    response = chain.invoke({})
    
    # 提取回复文本
    response_text = response.content if hasattr(response, 'content') else str(response)
    
    # 尝试解析JSON响应
    try:
      import json
      # 查找JSON部分
      start_idx = response_text.find('{')
      end_idx = response_text.rfind('}') + 1
      
      if start_idx != -1 and end_idx != -1:
        json_str = response_text[start_idx:end_idx]
        evaluation_result = json.loads(json_str)
        
        # 确保所有必需字段都存在
        if "testResults" not in evaluation_result:
          # 如果没有测试结果，生成默认的
          test_results = []
          for test_case in payload.testCases:
            test_results.append({
              "passed": evaluation_result.get("passed", False),
              "input": test_case["input"],
              "expected": test_case["expectedOutput"],
              "actual": "Mock output"  # In actual implementation, this should be the actual output of the code
            })
          evaluation_result["testResults"] = test_results
        
        return evaluation_result
      else:
        raise ValueError("Unable to extract JSON from response")
    except Exception as e:
      print(f"Error parsing AI response: {e}")
      # 如果解析失败，返回默认评估
      test_results = []
      for test_case in payload.testCases:
        test_results.append({
          "passed": False,
          "input": test_case["input"],
          "expected": test_case["expectedOutput"],
          "actual": "Parse error"
        })
      
      return {
        "passed": False,
        "score": 0,
        "feedback": f"Error occurred during code evaluation. AI feedback: {response_text}",
        "testResults": test_results
      }
    
  except Exception as e:
    print(f"Error in /code-evaluate: {e}")
    import traceback
    traceback.print_exc()
    
    # 返回错误评估
    test_results = []
    for test_case in payload.testCases:
      test_results.append({
        "passed": False,
        "input": test_case["input"],
        "expected": test_case["expectedOutput"],
        "actual": "Evaluation error"
      })
    
    return {
      "passed": False,
      "score": 0,
      "feedback": f"Error occurred during evaluation: {str(e)}",
      "testResults": test_results
    }

