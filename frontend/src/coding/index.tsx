import { useState, useEffect } from 'react';
import { Button, Select, Card, Spin, message, Space, Typography, Divider } from 'antd';
import { ArrowLeft, Play, Save, CheckCircle, Clock, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
}

interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback: string;
  testResults: Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual?: string;
    error?: string;
  }>;
}

export default function CodingPage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'java'>('javascript');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);

  const generateProblem = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/coding/generate', { difficulty });
      setProblem(response.data);
      setCode(response.data.starterCode[language]);
      setEvaluationResult(null);
    } catch (error) {
      console.error('Error generating problem:', error);
      message.error('Failed to generate problem. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const evaluateCode = async () => {
    if (!problem) {
      message.error('Please generate a problem first');
      return;
    }

    setEvaluating(true);
    try {
      const response = await axios.post('/api/coding/evaluate', {
        problemId: problem.id,
        code,
        language,
        testCases: problem.testCases
      });
      setEvaluationResult(response.data);
      
      if (response.data.passed) {
        message.success('All test cases passed! Great job!');
      } else {
        message.warning(`Some test cases failed. Score: ${response.data.score}%`);
      }
    } catch (error) {
      console.error('Error evaluating code:', error);
      message.error('Failed to evaluate code. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button type="text" icon={<ArrowLeft className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-600" />
              <span className="font-semibold text-lg">Coding Interview</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Problem Description */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <Title level={3}>Problem Settings</Title>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Text strong>Difficulty Level:</Text>
                  <Select
                    value={difficulty}
                    onChange={setDifficulty}
                    className="w-full mt-2"
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' }
                    ]}
                  />
                </div>
                
                <Button
                  type="primary"
                  icon={<Play className="w-4 h-4" />}
                  onClick={generateProblem}
                  loading={loading}
                  className="w-full"
                >
                  Generate Problem
                </Button>
              </div>
            </Card>

            {problem && (
              <Card>
                <div className="flex items-center gap-2 mb-4">
                  <Title level={3}>{problem.title}</Title>
                  <span 
                    style={{ 
                      backgroundColor: getDifficultyColor(problem.difficulty),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {problem.difficulty.toUpperCase()}
                  </span>
                </div>
                
                <Paragraph>{problem.description}</Paragraph>
                
                <Divider>Examples</Divider>
                {problem.examples.map((example, index) => (
                  <div key={index} className="mb-4">
                    <Text strong>Example {index + 1}:</Text>
                    <div className="bg-gray-100 p-3 rounded mt-2">
                      <div>
                        <Text strong>Input:</Text>
                        <code className="ml-2">{example.input}</code>
                      </div>
                      <div className="mt-2">
                        <Text strong>Output:</Text>
                        <code className="ml-2">{example.output}</code>
                      </div>
                      {example.explanation && (
                        <div className="mt-2">
                          <Text strong>Explanation:</Text>
                          <Text className="ml-2">{example.explanation}</Text>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <Divider>Constraints</Divider>
                <ul>
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="mb-1">
                      <Text>{constraint}</Text>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {evaluationResult && (
              <Card>
                <Title level={4}>Evaluation Results</Title>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {evaluationResult.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500" />
                    )}
                    <Text strong>Score: {evaluationResult.score}%</Text>
                  </div>
                  
                  <div>
                    <Text strong>Feedback:</Text>
                    <Paragraph className="mt-1">{evaluationResult.feedback}</Paragraph>
                  </div>
                  
                  <div>
                    <Text strong>Test Results:</Text>
                    <div className="mt-2 space-y-2">
                      {evaluationResult.testResults.map((result, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded ${result.passed ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-red-500" />
                            )}
                            <Text strong>Test Case {index + 1}</Text>
                          </div>
                          <div className="mt-1 text-sm">
                            <div>Input: <code>{result.input}</code></div>
                            <div>Expected: <code>{result.expected}</code></div>
                            {!result.passed && result.actual && (
                              <div>Actual: <code className="text-red-600">{result.actual}</code></div>
                            )}
                            {!result.passed && result.error && (
                              <div className="text-red-600 mt-1">Error: {result.error}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            {problem && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <Title level={4}>Code Editor</Title>
                  <Space>
                    <Select
                      value={language}
                      onChange={(lang) => {
                        setLanguage(lang);
                        setCode(problem.starterCode[lang]);
                      }}
                      style={{ width: 120 }}
                      options={[
                        { value: 'javascript', label: 'JavaScript' },
                        { value: 'python', label: 'Python' },
                        { value: 'java', label: 'Java' }
                      ]}
                    />
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={evaluateCode}
                      loading={evaluating}
                      disabled={!code.trim()}
                    >
                      Submit Code
                    </Button>
                  </Space>
                </div>
                
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={language}
                  height="500px"
                />
              </Card>
            )}
            
            {!problem && (
              <Card className="text-center py-12">
                <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <Title level={4} type="secondary">Ready to Code?</Title>
                <Text type="secondary">
                  Select a difficulty level and click "Generate Problem" to start your coding interview practice.
                </Text>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}