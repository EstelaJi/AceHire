import random
import os
import subprocess
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Coding Interview AI Service", version="1.0.0")

CODING_QUESTIONS = {
    'easy': [
        {
            'id': 'two-sum',
            'title': 'Two Sum',
            'description': 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            'difficulty': 'easy',
            'constraints': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
            'examples': [
                {
                    'input': 'nums = [2,7,11,15], target = 9',
                    'output': '[0,1]',
                    'explanation': 'Because nums[0] + nums[1] == 9, we return [0, 1]'
                }
            ],
            'testCases': [
                {'input': {'nums': [2, 7, 11, 15], 'target': 9}, 'expectedOutput': [0, 1]},
                {'input': {'nums': [3, 2, 4], 'target': 6}, 'expectedOutput': [1, 2]},
                {'input': {'nums': [3, 3], 'target': 6}, 'expectedOutput': [0, 1]}
            ]
        },
        {
            'id': 'reverse-string',
            'title': 'Reverse String',
            'description': 'Write a function that reverses a string. The input string is given as an array of characters s.',
            'difficulty': 'easy',
            'constraints': '1 <= s.length <= 10^5\nThe characters are ASCII printable characters.',
            'examples': [
                {
                    'input': 's = ["h","e","l","l","o"]',
                    'output': '["o","l","l","e","h"]',
                    'explanation': ''
                }
            ],
            'testCases': [
                {'input': {'s': ['h', 'e', 'l', 'l', 'o']}, 'expectedOutput': ['o', 'l', 'l', 'e', 'h']},
                {'input': {'s': ['H', 'a', 'n', 'n', 'a', 'h']}, 'expectedOutput': ['h', 'a', 'n', 'n', 'a', 'H']}
            ]
        },
        {
            'id': 'palindrome-number',
            'title': 'Palindrome Number',
            'description': 'Given an integer x, return true if x is a palindrome, and false otherwise.',
            'difficulty': 'easy',
            'constraints': '-2^31 <= x <= 2^31 - 1',
            'examples': [
                {
                    'input': 'x = 121',
                    'output': 'true',
                    'explanation': '121 reads as 121 from left to right and from right to left.'
                }
            ],
            'testCases': [
                {'input': {'x': 121}, 'expectedOutput': True},
                {'input': {'x': -121}, 'expectedOutput': False},
                {'input': {'x': 10}, 'expectedOutput': False}
            ]
        }
    ],
    'medium': [
        {
            'id': 'longest-substring',
            'title': 'Longest Substring Without Repeating Characters',
            'description': 'Given a string s, find the length of the longest substring without repeating characters.',
            'difficulty': 'medium',
            'constraints': '0 <= s.length <= 5 * 10^4\n s consists of English letters, digits, symbols and spaces.',
            'examples': [
                {
                    'input': 's = "abcabcbb"',
                    'output': '3',
                    'explanation': 'The answer is "abc", with the length of 3.'
                }
            ],
            'testCases': [
                {'input': {'s': 'abcabcbb'}, 'expectedOutput': 3},
                {'input': {'s': 'bbbbb'}, 'expectedOutput': 1},
                {'input': {'s': 'pwwkew'}, 'expectedOutput': 3}
            ]
        },
        {
            'id': '3sum',
            'title': '3Sum',
            'description': 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
            'difficulty': 'medium',
            'constraints': '0 <= nums.length <= 3000\n-10^5 <= nums[i] <= 10^5',
            'examples': [
                {
                    'input': 'nums = [-1,0,1,2,-1,-4]',
                    'output': '[[-1,-1,2],[-1,0,1]]',
                    'explanation': ''
                }
            ],
            'testCases': [
                {'input': {'nums': [-1, 0, 1, 2, -1, -4]}, 'expectedOutput': [[-1, -1, 2], [-1, 0, 1]]},
                {'input': {'nums': [0, 0, 0]}, 'expectedOutput': [[0, 0, 0]]}
            ]
        }
    ],
    'hard': [
        {
            'id': 'median-of-two-sorted-arrays',
            'title': 'Median of Two Sorted Arrays',
            'description': 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.',
            'difficulty': 'hard',
            'constraints': 'nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6',
            'examples': [
                {
                    'input': 'nums1 = [1,3], nums2 = [2]',
                    'output': '2.0',
                    'explanation': 'The median is 2.0'
                }
            ],
            'testCases': [
                {'input': {'nums1': [1, 3], 'nums2': [2]}, 'expectedOutput': 2.0},
                {'input': {'nums1': [1, 2], 'nums2': [3, 4]}, 'expectedOutput': 2.5}
            ]
        },
        {
            'id': 'regular-expression-matching',
            'title': 'Regular Expression Matching',
            'description': 'Given an input string s and a pattern p, implement regular expression matching with support for "." and "*".',
            'difficulty': 'hard',
            'constraints': '1 <= s.length <= 20\n1 <= p.length <= 30\ns contains only lowercase English letters.\np contains only lowercase English letters, ".", and "*".\nIt is guaranteed for each appearance of the character "*", there will be a previous valid character to match.',
            'examples': [
                {
                    'input': 's = "aa", p = "a"',
                    'output': 'false',
                    'explanation': '"a" does not match the entire string "aa".'
                }
            ],
            'testCases': [
                {'input': {'s': 'aa', 'p': 'a'}, 'expectedOutput': False},
                {'input': {'s': 'aa', 'p': 'a*'}, 'expectedOutput': True},
                {'input': {'s': 'ab', 'p': '.*'}, 'expectedOutput': True}
            ]
        }
    ]
}

class CodingQuestionRequest(BaseModel):
    difficulty: str

class CodingEvaluateRequest(BaseModel):
    questionId: str
    code: str
    language: str = 'javascript'

def execute_javascript_code(code: str, test_case_input: dict, function_name: str) -> tuple:
    try:
        input_values = list(test_case_input.values())
        
        js_code = f"""
{code}

const result = {function_name}({', '.join(map(json.dumps, input_values))});
console.log(JSON.stringify(result));
"""
        
        result = subprocess.run(
            ['node', '-e', js_code],
            capture_output=True,
            text=True,
            timeout=5
        )
        
        if result.returncode != 0:
            return None, result.stderr.strip()
        
        output = result.stdout.strip()
        if not output:
            return None, 'No output returned'
        
        try:
            actual_output = json.loads(output)
            return actual_output, None
        except json.JSONDecodeError:
            return output.strip(), None
            
    except subprocess.TimeoutExpired:
        return None, 'Execution timeout'
    except Exception as e:
        return None, str(e)

def get_function_name(question_id: str) -> str:
    function_names = {
        'two-sum': 'twoSum',
        'reverse-string': 'reverseString',
        'palindrome-number': 'isPalindrome',
        'longest-substring': 'lengthOfLongestSubstring',
        '3sum': 'threeSum',
        'median-of-two-sorted-arrays': 'findMedianSortedArrays',
        'regular-expression-matching': 'isMatch'
    }
    return function_names.get(question_id, 'solution')

def are_outputs_equal(actual, expected) -> bool:
    if type(actual) != type(expected):
        if isinstance(actual, list) and isinstance(expected, list):
            return sorted(actual) == sorted(expected)
        return False
    
    if isinstance(actual, list) and isinstance(expected, list):
        if len(actual) != len(expected):
            return False
        for i in range(len(actual)):
            if not are_outputs_equal(actual[i], expected[i]):
                return False
        return True
    
    if isinstance(actual, float) and isinstance(expected, float):
        return abs(actual - expected) < 0.0001
    
    return actual == expected

@app.post("/coding/generate")
def generate_coding_question(payload: CodingQuestionRequest):
    try:
        difficulty = payload.difficulty.lower()
        if difficulty not in CODING_QUESTIONS:
            raise HTTPException(status_code=400, detail=f"Invalid difficulty: {difficulty}")
        
        questions = CODING_QUESTIONS[difficulty]
        question = random.choice(questions)
        
        return {
            'questionId': question['id'],
            'title': question['title'],
            'description': question['description'],
            'difficulty': question['difficulty'],
            'examples': question['examples'],
            'constraints': question.get('constraints', ''),
            'testCasesCount': len(question['testCases'])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating coding question: {str(e)}")

@app.post("/coding/evaluate")
def evaluate_coding_solution(payload: CodingEvaluateRequest):
    try:
        question_id = payload.questionId
        code = payload.code
        
        question = None
        for difficulty_level in CODING_QUESTIONS.values():
            for q in difficulty_level:
                if q['id'] == question_id:
                    question = q
                    break
            if question:
                break
        
        if not question:
            raise HTTPException(status_code=404, detail=f"Question not found: {question_id}")
        
        function_name = get_function_name(question_id)
        test_results = []
        
        for test_case in question['testCases']:
            try:
                actual_output, error = execute_javascript_code(code, test_case['input'], function_name)
                
                if error:
                    test_results.append({
                        'passed': False,
                        'testCase': str(test_case['input']),
                        'expectedOutput': test_case['expectedOutput'],
                        'actualOutput': 'N/A',
                        'error': error
                    })
                else:
                    passed = are_outputs_equal(actual_output, test_case['expectedOutput'])
                    test_results.append({
                        'passed': passed,
                        'testCase': str(test_case['input']),
                        'expectedOutput': test_case['expectedOutput'],
                        'actualOutput': actual_output,
                        'error': None if passed else f"Expected {test_case['expectedOutput']} but got {actual_output}"
                    })
                    
            except Exception as e:
                test_results.append({
                    'passed': False,
                    'testCase': str(test_case['input']),
                    'expectedOutput': test_case['expectedOutput'],
                    'actualOutput': 'Error',
                    'error': str(e)
                })
        
        all_passed = all(result['passed'] for result in test_results)
        ai_feedback = f"Great! Your code passed {sum(1 for r in test_results if r['passed'])}/{len(test_results)} test cases." if all_passed else f"Your code passed {sum(1 for r in test_results if r['passed'])}/{len(test_results)} test cases. Please check the errors and try again."
        
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
