import { useState } from 'react';
import { Button, Select, Card, Spin, Alert, App } from 'antd';
import { ArrowLeft, Play, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Option } = Select;

interface CodeQuestion {
  title: string;
  description: string;
  difficulty: string;
  examples?: Array<{ input: string; output: string; explanation: string }>;
  constraints?: string[];
}

interface EvaluationResult {
  is_correct: boolean;
  feedback: string;
  score?: number;
  time_complexity?: string;
  space_complexity?: string;
}

export default function CodingPage() {
  const { message } = App.useApp();
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [question, setQuestion] = useState<CodeQuestion | null>(null);
  const [code, setCode] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const generateQuestion = async () => {
    setLoading(true);
    setQuestion(null);
    setCode('');
    setEvaluation(null);

    try {
      const response = await axios.post<CodeQuestion>(
        'http://localhost:4000/api/coding/generate',
        { difficulty }
      );
      setQuestion(response.data);
      message.success('题目生成成功！');
    } catch (error) {
      console.error('生成题目失败:', error);
      message.error('生成题目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async () => {
    if (!question) {
      message.warning('请先生成题目');
      return;
    }

    if (!code.trim()) {
      message.warning('请输入代码');
      return;
    }

    setSubmitting(true);
    setEvaluation(null);

    try {
      const response = await axios.post<EvaluationResult>(
        'http://localhost:4000/api/coding/evaluate',
        {
          question: question.title,
          code,
          difficulty
        }
      );
      setEvaluation(response.data);
      if (response.data.is_correct) {
        message.success('代码评估完成！');
      } else {
        message.info('代码评估完成，请查看反馈');
      }
    } catch (error) {
      console.error('提交代码失败:', error);
      message.error('提交代码失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button type="text" icon={<ArrowLeft className="size-5" />}>
                返回首页
              </Button>
            </Link>
            <h1 className="text-xl font-semibold text-foreground">Coding Interview</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">难度选择：</span>
                <Select
                  value={difficulty}
                  onChange={setDifficulty}
                  style={{ width: 150 }}
                  options={[
                    { value: 'easy', label: 'Easy' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'hard', label: 'Hard' }
                  ]}
                />
              </div>
              <Button
                type="primary"
                icon={<Play className="size-4" />}
                onClick={generateQuestion}
                loading={loading}
              >
                Generate Question
              </Button>
            </div>
          </Card>

          {loading && (
            <div className="flex flex-col justify-center items-center py-20">
              <Spin size="large" />
              <p className="mt-4 text-muted-foreground">正在生成题目...</p>
            </div>
          )}

          {question && !loading && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{question.title}</h2>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty.toUpperCase()}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">题目描述</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                      {question.description}
                    </p>
                  </div>

                  {question.constraints && question.constraints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">约束条件</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {question.constraints.map((constraint, idx) => (
                          <li key={idx}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {question.examples && question.examples.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">示例</h3>
                      <div className="space-y-3">
                        {question.examples.map((example, idx) => (
                          <div key={idx} className="bg-muted/30 rounded-lg p-4">
                            <div className="mb-2">
                              <span className="font-medium text-foreground">输入：</span>
                              <code className="ml-2 text-sm bg-background px-2 py-1 rounded">
                                {example.input}
                              </code>
                            </div>
                            <div className="mb-2">
                              <span className="font-medium text-foreground">输出：</span>
                              <code className="ml-2 text-sm bg-background px-2 py-1 rounded">
                                {example.output}
                              </code>
                            </div>
                            {example.explanation && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">解释：</span>
                                {example.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {evaluation && (
                  <Card
                    className={`${
                      evaluation.is_correct ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      {evaluation.is_correct ? (
                        <CheckCircle2 className="size-6 text-green-500 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="size-6 text-red-500 flex-shrink-0 mt-1" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {evaluation.is_correct ? '代码正确！' : '代码需要改进'}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {evaluation.feedback}
                        </p>
                      </div>
                    </div>

                    {evaluation.score !== undefined && (
                      <div className="mb-3">
                        <span className="font-medium text-foreground">得分：</span>
                        <span className="text-2xl font-bold text-primary ml-2">
                          {evaluation.score}/100
                        </span>
                      </div>
                    )}

                    {evaluation.time_complexity && (
                      <div className="mb-2">
                        <span className="font-medium text-foreground">时间复杂度：</span>
                        <code className="ml-2 text-sm bg-background px-2 py-1 rounded">
                          {evaluation.time_complexity}
                        </code>
                      </div>
                    )}

                    {evaluation.space_complexity && (
                      <div>
                        <span className="font-medium text-foreground">空间复杂度：</span>
                        <code className="ml-2 text-sm bg-background px-2 py-1 rounded">
                          {evaluation.space_complexity}
                        </code>
                      </div>
                    )}
                  </Card>
                )}
              </div>

              <div className="space-y-4">
                <Card className="h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">代码编辑器</h3>
                    <p className="text-sm text-muted-foreground">
                      请编写 Python 代码来解决上述问题
                    </p>
                  </div>

                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 p-4 font-mono text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="在此输入你的代码..."
                    spellCheck={false}
                  />

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircle2 className="size-4" />}
                      onClick={submitCode}
                      loading={submitting}
                    >
                      提交代码
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {!question && !loading && (
            <Card>
              <div className="text-center py-20">
                <div className="mb-4">
                  <Play className="size-16 text-muted-foreground mx-auto" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  准备好开始编程面试了吗？
                </h2>
                <p className="text-muted-foreground mb-6">
                  选择难度并点击"Generate Question"开始练习
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
