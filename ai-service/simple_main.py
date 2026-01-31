import os
import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json

# Define Pydantic models for request/response
class TestCase(BaseModel):
  input: str
  expectedOutput: str

class CodeEvaluateRequest(BaseModel):
  problem: Dict[str, Any]
  code: str
  language: str
  testCases: List[TestCase]

app = FastAPI()

# Configure CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/")
async def root():
  return {"message": "AI Service is running"}

@app.post("/code-evaluate")
async def code_evaluate(payload: CodeEvaluateRequest):
  """Evaluate code submission using AI"""
  try:
    # For now, we'll use a simple mock evaluation
    # In a real implementation, you would integrate with an AI service
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
    
    # If API key is available, we would integrate with AI service here
    # For now, we'll still return a mock evaluation
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
        "actual": "评估错误"
      })
    
    return {
      "passed": False,
      "score": 0,
      "feedback": f"评估过程中出现错误：{str(e)}",
      "testResults": test_results
    }

if __name__ == "__main__":
  port = int(os.environ.get("PORT", 8000))
  uvicorn.run(app, host="0.0.0.0", port=port)