import { useState } from 'react';
import { Button, Select, Card, Space, Typography, Alert, Spin, Tag, Divider } from 'antd';
import { Code2, Play, RefreshCw, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

interface AlgorithmQuestion {
  title?: string;
  description?: string;
  difficulty?: string;
  topic?: string;
  examples?: Array<{ input: string; output: string }>;
  hints?: string[];
  test_cases?: Array<{ input: string; expected_output: string }>;
}

interface CodeEvaluationResult {
  score?: number;
  correctness?: number;
  time_complexity?: string;
  space_complexity?: string;
  code_quality?: number;
  feedback?: string;
  is_correct?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CodingPage() {
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [topic, setTopic] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [question, setQuestion] = useState<AlgorithmQuestion | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<CodeEvaluationResult | null>(null);
  const [error, setError] = useState<string>('');

  const generateQuestion = async () => {
    setLoading(true);
    setError('');
    setEvaluationResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/algorithm/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, topic: topic || undefined })
      });
      if (!response.ok) throw new Error('Failed to generate question');
      const data = await response.json();
      setQuestion(data);
      setCode('');
    } catch (err) {
      setError('生成题目失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!code.trim()) {
      setError('请先编写代码');
      return;
    }
    if (!question) {
      setError('请先生成题目');
      return;
    }
    setEvaluating(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/algorithm/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          question: question.description,
          test_cases: question.test_cases
        })
      });
      if (!response.ok) throw new Error('Failed to evaluate code');
      const data = await response.json();
      setEvaluationResult(data);
    } catch (err) {
      setError('代码评估失败，请重试');
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'green';
      case 'medium': return 'gold';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="size-5" />
              <span>返回首页</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Coding Interview</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <Title level={4}>题目设置</Title>
              <Space.Compact style={{ width: '100%' }} className="gap-2">
                <Select
                  value={difficulty}
                  onChange={setDifficulty}
                  style={{ width: 150 }}
                  options={[
                    { value: 'easy', label: '简单' },
                    { value: 'medium', label: '中等' },
                    { value: 'hard', label: '困难' }
                  ]}
                />
                <Select
                  value={topic}
                  onChange={setTopic}
                  style={{ width: 180 }}
                  placeholder="选择类型"
                  allowClear
                  options={[
                    { value: 'array', label: '数组' },
                    { value: 'string', label: '字符串' },
                    { value: 'linkedlist', label: '链表' },
                    { value: 'tree', label: '树' },
                    { value: 'dp', label: '动态规划' },
                    { value: 'graph', label: '图' },
                    { value: 'sorting', label: '排序' },
                    { value: 'search', label: '搜索' }
                  ]}
                />
                <Select
                  value={language}
                  onChange={setLanguage}
                  style={{ width: 150 }}
                  options={[
                    { value: 'javascript', label: 'JavaScript' },
                    { value: 'python', label: 'Python' },
                    { value: 'java', label: 'Java' },
                    { value: 'cpp', label: 'C++' }
                  ]}
                />
                <Button
                  type="primary"
                  onClick={generateQuestion}
                  loading={loading}
                  icon={<RefreshCw className="size-4" />}
                >
                  生成题目
                </Button>
              </Space.Compact>
            </Card>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
              />
            )}

            {question && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <Title level={4}>{question.title}</Title>
                  <Tag color={getDifficultyColor(question.difficulty || '')}>
                    {question.difficulty}
                  </Tag>
                </div>
                <Paragraph className="text-lg leading-relaxed">
                  {question.description}
                </Paragraph>

                {question.examples && question.examples.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>示例</Title>
                    {question.examples.map((example, index) => (
                      <div key={index} className="bg-muted p-4 rounded-lg mb-2">
                        <Text strong>输入: </Text>
                        <code className="bg-background px-2 py-1 rounded">{example.input}</code>
                        <br />
                        <Text strong>输出: </Text>
                        <code className="bg-background px-2 py-1 rounded">{example.output}</code>
                      </div>
                    ))}
                  </>
                )}

                {question.hints && question.hints.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>提示</Title>
                    <ul className="list-disc list-inside space-y-1">
                      {question.hints.map((hint, index) => (
                        <li key={index} className="text-muted-foreground">{hint}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <Title level={4}>代码编辑器</Title>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="在这里编写你的代码..."
                className="w-full h-80 p-4 font-mono text-sm bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                spellCheck={false}
              />
              <div className="mt-4 flex justify-end">
                <Button
                  type="primary"
                  size="large"
                  onClick={submitCode}
                  loading={evaluating}
                  disabled={!code.trim() || !question}
                  icon={<Play className="size-4" />}
                >
                  提交代码
                </Button>
              </div>
            </Card>

            {evaluationResult && (
              <Card>
                <div className="flex items-center gap-3 mb-4">
                  {evaluationResult.is_correct ? (
                    <CheckCircle className="size-8 text-green-500" />
                  ) : (
                    <XCircle className="size-8 text-red-500" />
                  )}
                  <Title level={4}>
                    评估结果 - {evaluationResult.score}分
                  </Title>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted p-3 rounded">
                    <Text type="secondary">正确性</Text>
                    <div className="text-2xl font-bold">{evaluationResult.correctness}</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <Text type="secondary">代码质量</Text>
                    <div className="text-2xl font-bold">{evaluationResult.code_quality}</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <Text type="secondary">时间复杂度</Text>
                    <div className="text-lg font-semibold">{evaluationResult.time_complexity}</div>
                  </div>
                  <div className="bg-muted p-3 rounded">
                    <Text type="secondary">空间复杂度</Text>
                    <div className="text-lg font-semibold">{evaluationResult.space_complexity}</div>
                  </div>
                </div>

                <Divider />
                <Title level={5}>反馈建议</Title>
                <Paragraph className="text-muted-foreground">
                  {evaluationResult.feedback}
                </Paragraph>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
