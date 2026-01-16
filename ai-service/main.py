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
  difficulty: str = 'easy'


class CodingEvaluateRequest(BaseModel):
  questionId: str
  code: str
  language: str = 'javascript'


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


# Coding interview questions database
CODING_QUESTIONS = {
    'easy': [
        {
            'id': 'easy-1',
            'title': 'Two Sum',
            'description': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input has exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
            'examples': [
                {
                    'input': 'nums = [2,7,11,15], target = 9',
                    'output': '[0,1]',
                    'explanation': 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                    'input': 'nums = [3,2,4], target = 6',
                    'output': '[1,2]'
                }
            ],
            'constraints': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
            'starterCode': 'function twoSum(nums, target) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(twoSum([2,7,11,15], 9)); // Should output [0,1]\nconsole.log(twoSum([3,2,4], 6)); // Should output [1,2]',
            'testCases': [
                {'input': {'nums': [2,7,11,15], 'target': 9}, 'expectedOutput': '[0,1]'},
                {'input': {'nums': [3,2,4], 'target': 6}, 'expectedOutput': '[1,2]'},
                {'input': {'nums': [3,3], 'target': 6}, 'expectedOutput': '[0,1]'}
            ]
        },
        {
            'id': 'easy-2',
            'title': 'Reverse String',
            'description': 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
            'examples': [
                {
                    'input': 's = ["h","e","l","l","o"]',
                    'output': '["o","l","l","e","h"]'
                },
                {
                    'input': 's = ["H","a","n","n","a","h"]',
                    'output': '["h","a","n","n","a","H"]'
                }
            ],
            'constraints': '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
            'starterCode': 'function reverseString(s) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(reverseString(["h","e","l","l","o"])); // Should output ["o","l","l","e","h"]',
            'testCases': [
                {'input': {'s': ['h','e','l','l','o']}, 'expectedOutput': '["o","l","l","e","h"]'},
                {'input': {'s': ['H','a','n','n','a','h']}, 'expectedOutput': '["h","a","n","n","a","H"]'},
                {'input': {'s': ['a']}, 'expectedOutput': '["a"]'}
            ]
        },
        {
            'id': 'easy-3',
            'title': 'Palindrome Number',
            'description': 'Given an integer x, return true if x is palindrome integer.\n\nAn integer is a palindrome when it reads the same backward as forward.\n\nFor example, 121 is a palindrome while 123 is not.',
            'examples': [
                {
                    'input': 'x = 121',
                    'output': 'true'
                },
                {
                    'input': 'x = -121',
                    'output': 'false'
                },
                {
                    'input': 'x = 10',
                    'output': 'false'
                }
            ],
            'constraints': '-2^31 <= x <= 2^31 - 1',
            'starterCode': 'function isPalindrome(x) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(isPalindrome(121)); // Should output true\nconsole.log(isPalindrome(-121)); // Should output false',
            'testCases': [
                {'input': {'x': 121}, 'expectedOutput': 'true'},
                {'input': {'x': -121}, 'expectedOutput': 'false'},
                {'input': {'x': 10}, 'expectedOutput': 'false'},
                {'input': {'x': 0}, 'expectedOutput': 'true'}
            ]
        }
    ],
    'medium': [
        {
            'id': 'medium-1',
            'title': 'Longest Substring Without Repeating Characters',
            'description': 'Given a string s, find the length of the longest substring without repeating characters.',
            'examples': [
                {
                    'input': 's = "abcabcbb"',
                    'output': '3',
                    'explanation': 'The answer is "abc", with the length of 3.'
                },
                {
                    'input': 's = "bbbbb"',
                    'output': '1',
                    'explanation': 'The answer is "b", with the length of 1.'
                },
                {
                    'input': 's = "pwwkew"',
                    'output': '3',
                    'explanation': 'The answer is "wke", with the length of 3. Notice that the answer must be a substring, "pwke" is a subsequence and not a substring.'
                }
            ],
            'constraints': '0 <= s.length <= 5 * 10^4\n\ns consists of English letters, digits, symbols and spaces.',
            'starterCode': 'function lengthOfLongestSubstring(s) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(lengthOfLongestSubstring("abcabcbb")); // Should output 3\nconsole.log(lengthOfLongestSubstring("bbbbb")); // Should output 1',
            'testCases': [
                {'input': {'s': 'abcabcbb'}, 'expectedOutput': '3'},
                {'input': {'s': 'bbbbb'}, 'expectedOutput': '1'},
                {'input': {'s': 'pwwkew'}, 'expectedOutput': '3'},
                {'input': {'s': ''}, 'expectedOutput': '0'}
            ]
        },
        {
            'id': 'medium-2',
            'title': '3Sum',
            'description': 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.\n\nNotice that the solution set must not contain duplicate triplets.',
            'examples': [
                {
                    'input': 'nums = [-1,0,1,2,-1,-4]',
                    'output': '[[-1,-1,2],[-1,0,1]]'
                },
                {
                    'input': 'nums = []',
                    'output': '[]'
                }
            ],
            'constraints': '0 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5',
            'starterCode': 'function threeSum(nums) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(threeSum([-1,0,1,2,-1,-4])); // Should output [[-1,-1,2],[-1,0,1]]',
            'testCases': [
                {'input': {'nums': [-1,0,1,2,-1,-4]}, 'expectedOutput': '[[-1,-1,2],[-1,0,1]]'},
                {'input': {'nums': []}, 'expectedOutput': '[]'},
                {'input': {'nums': [0]}, 'expectedOutput': '[]'}
            ]
        }
    ],
    'hard': [
        {
            'id': 'hard-1',
            'title': 'Median of Two Sorted Arrays',
            'description': 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be O(log (m+n)).',
            'examples': [
                {
                    'input': 'nums1 = [1,3], nums2 = [2]',
                    'output': '2.00000',
                    'explanation': 'merged array = [1,2,3] and median is 2.'
                },
                {
                    'input': 'nums1 = [1,2], nums2 = [3,4]',
                    'output': '2.50000',
                    'explanation': 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.'
                }
            ],
            'constraints': 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
            'starterCode': 'function findMedianSortedArrays(nums1, nums2) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(findMedianSortedArrays([1,3], [2])); // Should output 2.0\nconsole.log(findMedianSortedArrays([1,2], [3,4])); // Should output 2.5',
            'testCases': [
                {'input': {'nums1': [1,3], 'nums2': [2]}, 'expectedOutput': '2.0'},
                {'input': {'nums1': [1,2], 'nums2': [3,4]}, 'expectedOutput': '2.5'},
                {'input': {'nums1': [], 'nums2': [1]}, 'expectedOutput': '1.0'}
            ]
        },
        {
            'id': 'hard-2',
            'title': 'Regular Expression Matching',
            'description': 'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*".\n\n"." Matches any single character.\n"*" Matches zero or more of the preceding element.\n\nThe matching should cover the entire input string (not partial).',
            'examples': [
                {
                    'input': 's = "aa", p = "a"',
                    'output': 'false',
                    'explanation': '"a" does not match the entire string "aa".'
                },
                {
                    'input': 's = "aa", p = "a*"',
                    'output': 'true',
                    'explanation': '* means zero or more of the preceding element, a. Therefore, by repeating a once, it becomes "aa".'
                },
                {
                    'input': 's = "ab", p = ".*"',
                    'output': 'true',
                    'explanation': '.* means "zero or more (*) of any character (.)."'
                }
            ],
            'constraints': '1 <= s.length <= 20\n1 <= p.length <= 30\ns contains only lowercase English letters.\np contains only lowercase English letters, ".", and "*".\nIt is guaranteed for each appearance of the character "*", there will be a previous valid character to match.',
            'starterCode': 'function isMatch(s, p) {\n  // Write your code here\n}\n\n// Example usage:\nconsole.log(isMatch("aa", "a")); // Should output false\nconsole.log(isMatch("aa", "a*")); // Should output true',
            'testCases': [
                {'input': {'s': 'aa', 'p': 'a'}, 'expectedOutput': 'false'},
                {'input': {'s': 'aa', 'p': 'a*'}, 'expectedOutput': 'true'},
                {'input': {'s': 'ab', 'p': '.*'}, 'expectedOutput': 'true'}
            ]
        }
    ]
}


@app.post("/coding/generate")
async def generate_coding_question(payload: CodingQuestionRequest):
  """Generate a coding question based on difficulty level"""
  import random
  
  difficulty = payload.difficulty.lower()
  if difficulty not in CODING_QUESTIONS:
    raise HTTPException(status_code=400, detail=f"Invalid difficulty: {difficulty}. Must be 'easy', 'medium', or 'hard'.")
  
  questions = CODING_QUESTIONS[difficulty]
  question = random.choice(questions)
  
  return {
    'question': {
      'id': question['id'],
      'title': question['title'],
      'difficulty': difficulty,
      'description': question['description'],
      'examples': question['examples'],
      'constraints': question['constraints'],
      'starterCode': question['starterCode']
    }
  }


@app.post("/coding/evaluate")
async def evaluate_coding_solution(payload: CodingEvaluateRequest):
  """Evaluate coding solution and provide AI feedback"""
  try:
    from langchain_openai import ChatOpenAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.messages import SystemMessage, HumanMessage
    import json
    
    # Find the question
    question = None
    for difficulty in CODING_QUESTIONS.values():
        for q in difficulty:
            if q['id'] == payload.questionId:
                question = q
                break
        if question:
            break
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Execute the code and get test results
    test_results = []
    
    # We'll use Python's exec to simulate JavaScript execution
    # In a real production environment, you would use a proper JavaScript engine like Node.js
    
    for test_case in question['testCases']:
        try:
            # For JavaScript code, we need to extract the function and execute it
            # This is a simplified version - in production, use Node.js
            code = payload.code
            
            # Extract function name from starter code
            import re
            function_match = re.search(r'function\s+(\w+)\s*\(', code)
            if not function_match:
                test_results.append({
                    'passed': False,
                    'testCase': str(test_case['input']),
                    'expectedOutput': test_case['expectedOutput'],
                    'actualOutput': 'N/A',
                    'error': 'No function found in code'
                })
                continue
            
            function_name = function_match.group(1)
            
            # Try to evaluate using Python (for simple cases)
            # This is limited - for full JS support, use Node.js
            actual_output = 'N/A'
            error = None
            
            # For the purpose of this demo, we'll skip actual execution
            # In production, use a proper sandbox
            test_results.append({
                'passed': False,
                'testCase': str(test_case['input']),
                'expectedOutput': test_case['expectedOutput'],
                'actualOutput': actual_output,
                'error': error or 'Code execution requires Node.js environment'
            })
            
        except Exception as e:
            test_results.append({
                'passed': False,
                'testCase': str(test_case['input']),
                'expectedOutput': test_case['expectedOutput'],
                'actualOutput': 'Error',
                'error': str(e)
            })
    
    # Get AI feedback
    api_key = os.getenv("DEEPSEEK_API_KEY", "")
    if not api_key:
        ai_feedback = "AI feedback requires DEEPSEEK_API_KEY environment variable."
    else:
        llm = ChatOpenAI(
            model_name="deepseek-chat",
            temperature=0.3,
            max_tokens=500,
            base_url="https://api.deepseek.com/v1",
            api_key=api_key
        )
        
        prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content="""You are an experienced software engineer and coding interview evaluator. 

Your task:
1. Analyze the candidate's code solution
2. Provide constructive feedback on correctness, efficiency, and code quality
3. Point out any bugs or issues
4. Suggest improvements if needed
5. Keep the feedback professional and helpful

Be specific and detailed in your feedback."""),
            HumanMessage(content=f"""Question: {question['title']}

Question Description: {question['description']}

Candidate's Code:
{payload.code}

Please provide a detailed code review and feedback:""")
        ])
        
        chain = prompt | llm
        response = chain.invoke({})
        ai_feedback = response.content if hasattr(response, 'content') else str(response)
    
    return {
        'testResults': test_results,
        'aiFeedback': ai_feedback
    }
    
  except Exception as e:
    import traceback
    error_msg = f"Error evaluating coding solution: {str(e)}"
    print(error_msg)
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=error_msg)

