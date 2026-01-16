import { useState } from 'react';
import { Button, Select, Card, Space, Typography, Alert } from 'antd';
import { Code, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { editor as monacoEditor, languages } from 'monaco-editor';
import MonacoEditor from '@monaco-editor/react';

const { Title, Text, Paragraph } = Typography;

interface CodingQuestion {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  constraints: string;
}

interface EvaluationResult {
  isCorrect: boolean;
  message: string;
  testCases: Array<{
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
  }>;
}

export default function CodingPage() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [question, setQuestion] = useState<CodingQuestion | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const generateQuestion = async () => {
    try {
      setGenerating(true);
      setResult(null);
      
      const response = await fetch('http://localhost:4000/api/coding/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Backend error:', data);
        throw new Error(data.error || 'Failed to generate question');
      }

      if (data.question) {
        setQuestion(data.question);
        setCode(getTemplateCode(data.question));
      } else {
        console.error('Question is null:', data);
        alert('Failed to generate question: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating question:', error);
      alert('Failed to generate question: ' + (error as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const getTemplateCode = (q: CodingQuestion): string => {
    return `# ${q.title}\n\n# Constraints:\n# ${q.constraints}\n\ndef solution():\n    # Write your code here\n    pass\n\n# Test your solution\n# You can add test cases here\n`;
  };

  const submitCode = async () => {
    if (!question || !code) return;

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('http://localhost:4000/api/coding/evaluate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          code,
          language: 'python',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate code');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error evaluating code:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
              <Code className="size-6 text-primary-foreground" />
            </div>
            <div>
              <Title level={2} className="mb-0">Coding Interview</Title>
              <Text type="secondary">Practice your coding skills with AI-generated questions</Text>
            </div>
          </div>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - Question */}
          <div className="space-y-6">
            <Card>
              <Space direction="vertical" className="w-full" size="large">
                <div className="flex items-center justify-between">
                  <Title level={3} className="mb-0">Select Difficulty</Title>
                  <Button
                    type="primary"
                    onClick={generateQuestion}
                    loading={generating}
                    icon={<PlayCircle className="size-4" />}
                  >
                    Generate Question
                  </Button>
                </div>
                <Select
                  value={difficulty}
                  onChange={setDifficulty}
                  style={{ width: '100%' }}
                  options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' },
                  ]}
                />
              </Space>
            </Card>

            {question && (
              <Card title={<Title level={4} className="mb-0">{question.title}</Title>}>
                <Space direction="vertical" className="w-full" size="large">
                  <div>
                    <Title level={5} className="mb-2">Description</Title>
                    <Paragraph>{question.description}</Paragraph>
                  </div>

                  <div>
                    <Title level={5} className="mb-2">Examples</Title>
                    {question.examples.map((example, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <Text strong>Example {index + 1}:</Text>
                        <div className="bg-gray-50 p-3 rounded mt-2">
                          <div className="mb-2">
                            <Text strong>Input:</Text>
                            <pre className="mt-1 p-2 bg-white rounded border border-gray-200">
                              {example.input}
                            </pre>
                          </div>
                          <div className="mb-2">
                            <Text strong>Output:</Text>
                            <pre className="mt-1 p-2 bg-white rounded border border-gray-200">
                              {example.output}
                            </pre>
                          </div>
                          <div>
                            <Text strong>Explanation:</Text>
                            <Paragraph className="mt-1 mb-0">{example.explanation}</Paragraph>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Title level={5} className="mb-2">Constraints</Title>
                    <Paragraph>{question.constraints}</Paragraph>
                  </div>
                </Space>
              </Card>
            )}

            {result && (
              <Card
                title={<div className="flex items-center gap-2">
                  {result.isCorrect ? (
                    <CheckCircle className="size-5 text-green-500" />
                  ) : (
                    <XCircle className="size-5 text-red-500" />
                  )}
                  <Title level={5} className="mb-0">
                    {result.isCorrect ? 'Success!' : 'Try Again'}
                  </Title>
                </div>}
              >
                <Alert
                  message={result.message}
                  type={result.isCorrect ? 'success' : 'error'}
                  showIcon
                  className="mb-4"
                />

                <Title level={5} className="mb-2">Test Results</Title>
                {result.testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded mb-3 border ${
                      testCase.passed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Text strong>Test Case {index + 1}:</Text>
                      {testCase.passed ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : (
                        <XCircle className="size-4 text-red-500" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Text strong>Input:</Text>
                        <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <Text strong>Expected:</Text>
                        <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
                          {testCase.expected}
                        </pre>
                      </div>
                      {!testCase.passed && (
                        <div>
                          <Text strong>Actual:</Text>
                          <pre className="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
                            {testCase.actual}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Right side - Code Editor */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="mb-0">Code Editor</Title>
                <Button
                  type="primary"
                  onClick={submitCode}
                  loading={loading}
                  disabled={!question || !code}
                >
                  Submit Code
                </Button>
              </div>
              <MonacoEditor
                height="600"
                language="python"
                value={code}
                onChange={(value) => value && setCode(value)}
                theme="vs-light"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
