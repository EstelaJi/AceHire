import { useState } from 'react';
import { Select, Button, Card, Typography, Space, Divider, message, Tag } from 'antd';
import { Code, PlayCircle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import AceEditor from 'react-ace';

(window as any).ace = ace;

const { Title, Text, Paragraph } = Typography;

interface CodingQuestion {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string;
  starterCode: string;
  testCasesCount?: number;
}

interface TestResult {
  passed: boolean;
  testCase: string;
  expectedOutput: string;
  actualOutput: string;
  error?: string;
}

const getStarterCode = (questionId: string): string => {
  const starterCodes: Record<string, string> = {
    'two-sum': `function twoSum(nums, target) {
  // Write your code here
  // Example: return indices of the two numbers such that they add up to target
  
}`,
    'reverse-string': `function reverseString(s) {
  // Write your code here
  // The input string is given as an array of characters s
  
}`,
    'palindrome-number': `function isPalindrome(x) {
  // Write your code here
  // Return true if x is a palindrome, and false otherwise
  
}`,
    'longest-substring': `function lengthOfLongestSubstring(s) {
  // Write your code here
  // Return the length of the longest substring without repeating characters
  
}`,
    '3sum': `function threeSum(nums) {
  // Write your code here
  // Return all the triplets [nums[i], nums[j], nums[k]] such that they add up to 0
  
}`,
    'median-of-two-sorted-arrays': `function findMedianSortedArrays(nums1, nums2) {
  // Write your code here
  // Return the median of the two sorted arrays
  
}`,
    'regular-expression-matching': `function isMatch(s, p) {
  // Write your code here
  // Implement regular expression matching with support for "." and "*"
  
}`
  };
  return starterCodes[questionId] || '// Write your code here';
};

export default function CodingPage() {
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'green';
      case 'medium': return 'gold';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const generateQuestion = async () => {
    setIsGenerating(true);
    setTestResults(null);
    setAiFeedback('');
    try {
      const response = await fetch('http://localhost:3001/api/coding/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate question');
      }
      
      const data = await response.json();
      setQuestion({
        id: data.questionId,
        title: data.title,
        difficulty: data.difficulty as 'easy' | 'medium' | 'hard',
        description: data.description,
        examples: data.examples,
        constraints: data.constraints || '',
        starterCode: getStarterCode(data.questionId)
      });
      setCode(getStarterCode(data.questionId));
      message.success('Question generated successfully!');
    } catch (error) {
      console.error('Error generating question:', error);
      message.error('Failed to generate question. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const submitCode = async () => {
    if (!question || !code.trim()) {
      message.warning('Please generate a question and write some code first.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3001/api/coding/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language: 'javascript',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate code');
      }
      
      const data = await response.json();
      setTestResults(data.testResults);
      setAiFeedback(data.aiFeedback);
      
      const allPassed = data.testResults.every((r: TestResult) => r.passed);
      if (allPassed) {
        message.success('All tests passed! Great job!');
      } else {
        message.warning('Some tests failed. Please check your code.');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      message.error('Failed to submit code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Code className="size-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-white">Coding Interview</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm text-purple-300 hover:text-white transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls Section */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-5 text-yellow-400" />
              <Text className="text-white font-medium">Select Difficulty:</Text>
            </div>
            <Select
              value={difficulty}
              onChange={setDifficulty}
              style={{ width: 180 }}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              className="bg-white/10 border-white/20"
            />
            <Button
              type="primary"
              size="large"
              onClick={generateQuestion}
              loading={isGenerating}
              icon={<PlayCircle className="size-5" />}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Generate Question
            </Button>
          </div>
        </div>

        {/* Question and Editor Section */}
        {question ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Question Panel */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Title level={3} className="!text-white !mb-0">{question.title}</Title>
                  <Tag color={getDifficultyColor(question.difficulty)} className="text-sm">
                    {question.difficulty.toUpperCase()}
                  </Tag>
                </div>
                <Paragraph className="!text-gray-300 !mb-4">{question.description}</Paragraph>
                
                <Divider className="!border-white/10" />
                
                <div className="space-y-4">
                  <div>
                    <Text className="text-purple-300 font-semibold block mb-2">Examples:</Text>
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-3 mb-2">
                        <Text className="text-gray-400 text-sm">Input:</Text>
                        <Text className="text-white block font-mono text-sm bg-black/30 p-2 rounded my-1">
                          {example.input}
                        </Text>
                        <Text className="text-gray-400 text-sm">Output:</Text>
                        <Text className="text-green-400 block font-mono text-sm bg-black/30 p-2 rounded my-1">
                          {example.output}
                        </Text>
                        {example.explanation && (
                          <Text className="text-gray-500 text-xs mt-1 block">
                            Explanation: {example.explanation}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Text className="text-purple-300 font-semibold block mb-2">Constraints:</Text>
                    <Text className="text-gray-300 text-sm bg-black/20 rounded-lg p-3 block">
                      {question.constraints}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* Code Editor Panel */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Text className="text-white font-semibold">Code Editor</Text>
                  <Button
                    type="primary"
                    onClick={submitCode}
                    loading={isSubmitting}
                    icon={<CheckCircle className="size-5" />}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Submit Code
                  </Button>
                </div>
                
                <div className="flex-1 min-h-[400px]">
                  <AceEditor
                    mode="javascript"
                    theme="monokai"
                    value={code}
                    onChange={setCode}
                    name="code-editor"
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                      enableBasicAutocompletion: true,
                      enableLiveAutocompletion: true,
                      enableSnippets: true,
                      showLineNumbers: true,
                      tabSize: 2,
                      fontSize: 14,
                    }}
                    placeholder="Write your code here..."
                    className="w-full h-full rounded-lg"
                  />
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <Code className="size-16 text-purple-400 mx-auto mb-4" />
            <Title level={2} className="!text-white !mb-4">Ready to Code?</Title>
            <Paragraph className="!text-gray-300 !mb-6">
              Select a difficulty level and click "Generate Question" to start your coding interview practice.
            </Paragraph>
          </div>
        )}

        {/* Results Section */}
        {testResults && (
          <Card className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10">
            <Title level={4} className="!text-white !mb-4">Test Results</Title>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 ${result.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {result.passed ? (
                      <CheckCircle className="size-5 text-green-400" />
                    ) : (
                      <XCircle className="size-5 text-red-400" />
                    )}
                    <Text className="text-white font-medium">Test Case {index + 1}</Text>
                  </div>
                  <Text className="text-gray-400 text-sm">Input: {result.testCase}</Text>
                  <Text className="text-gray-400 text-sm">Expected: {result.expectedOutput}</Text>
                  <Text className={`text-sm ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                    Actual: {result.actualOutput}
                  </Text>
                  {result.error && (
                    <Text className="text-red-300 text-sm mt-2 block">Error: {result.error}</Text>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Feedback Section */}
        {aiFeedback && (
          <Card className="mt-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <Title level={4} className="!text-white !mb-4">
              <Lightbulb className="inline-block size-5 mr-2 text-yellow-400" />
              AI Feedback
            </Title>
            <Paragraph className="!text-gray-300 !mb-0 whitespace-pre-wrap">
              {aiFeedback}
            </Paragraph>
          </Card>
        )}
      </main>

      <footer className="border-t border-white/10 bg-black/20 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>© 2025 Coding Interview Practice. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
