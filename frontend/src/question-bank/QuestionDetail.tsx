import { useParams, Link } from 'react-router-dom';
import { Card, Tag, Button, Typography, Divider, Spin } from 'antd';
import { ArrowLeft, Lightbulb, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getQuestionById, Question } from '../api/questions';

const { Title, Paragraph } = Typography;

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadQuestion() {
      try {
        setLoading(true);
        const data = await getQuestionById(id!);
        setQuestion(data);
      } catch (error) {
        console.error('Failed to load question:', error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadQuestion();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Title level={2}>Question not found</Title>
          <Link to="/question-bank" className="text-primary">
            Back to Question Bank
          </Link>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'green';
      case 'medium': return 'gold';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavior': return 'blue';
      case 'technical': return 'purple';
      case 'product': return 'orange';
      case 'system design': return 'cyan';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button type="text" icon={<ArrowLeft />}>
            <Link to="/question-bank" style={{ color: 'inherit', textDecoration: 'none' }}>
              Back to Question Bank
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Question Header */}
          <Card className="mb-6 shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                <Tag color={getLevelColor(question.level)} className="text-sm font-medium">
                  {question.level}
                </Tag>
                <Tag color={getTypeColor(question.type)} className="text-sm font-medium">
                  {question.type}
                </Tag>
                {question.industry && (
                  <Tag color="gray" className="text-sm font-medium">
                    {question.industry}
                  </Tag>
                )}
              </div>
              <Title level={2} className="!mb-0 text-foreground">
                {question.question}
              </Title>
            </div>
          </Card>

          {/* Explanation Section */}
          <Card className="mb-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="size-5 text-amber-500" />
              <Title level={4} className="!mb-0 text-foreground">
                Question Explanation
              </Title>
            </div>
            <Paragraph className="text-lg text-foreground leading-relaxed">
              {question.explanation}
            </Paragraph>
          </Card>

          {/* Examples Section */}
          <Card className="shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="size-5 text-blue-500" />
              <Title level={4} className="!mb-0 text-foreground">
                Answer Examples
              </Title>
            </div>
            
            <div className="space-y-6">
              {question.examples.map((example, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag color="primary" className="text-sm font-medium">
                      Example {index + 1}
                    </Tag>
                  </div>
                  <Paragraph className="text-foreground leading-relaxed m-0">
                    {example}
                  </Paragraph>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
