import { useState, useEffect } from 'react';
import { Select, Card, Tag, Button, Spin } from 'antd';
import { Filter, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { questionApi, Question } from '../services/api';

export default function QuestionBankPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = {
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
        };
        const data = await questionApi.getAll(filters);
        setFilteredQuestions(data);
      } catch (err) {
        setError('Failed to load questions');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedLevel, selectedType]);

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
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-balance">
            Question Bank
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            <Select
              placeholder="Select Level"
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'All Levels' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
            />
            <Select
              placeholder="Select Type"
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'behavior', label: 'Behavior' },
                { value: 'technical', label: 'Technical' },
                { value: 'product', label: 'Product' },
                { value: 'system design', label: 'System Design' }
              ]}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <Spin size="large" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">{error}</p>
            </div>
          )}

          {/* Questions Grid */}
          {!loading && !error && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuestions.map((question) => (
                  <Link key={question.id} to={`/question-bank/${question.id}`} style={{ textDecoration: 'none' }}>
                    <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-2 flex-wrap">
                          <Tag color={getLevelColor(question.level)}>{question.level}</Tag>
                          <Tag color={getTypeColor(question.type)}>{question.type}</Tag>
                        </div>
                        <p className="text-foreground leading-relaxed">{question.question}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {filteredQuestions.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">No questions found matching your filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}