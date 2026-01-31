import { Link } from "react-router-dom";
import { Button, Select, Card, Tag } from 'antd';
import { Sparkles, MessageSquare, FileText, TrendingUp, Filter, Code } from "lucide-react";
import { useState, useEffect } from 'react';
import { questions, Question } from './questionsData';

export default function HomePage() {
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);

  useEffect(() => {
    // Get 6 random questions initially
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setRandomQuestions(shuffled.slice(0, 6));
    setFilteredQuestions(shuffled.slice(0, 6));
  }, []);

  useEffect(() => {
    let filtered = [...questions];
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(q => q.level === selectedLevel);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType);
    }
    
    // Get up to 6 random questions from filtered results
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setFilteredQuestions(shuffled.slice(0, 6));
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">InterviewPrep</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Practice Interviews with Confidence
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty leading-relaxed">
              Prepare for your next job interview in a judgment-free environment. Get personalized feedback and improve
              your skills with AI-powered practice sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button type="primary" size="large">
                <Link to="/setup" style={{ color: 'inherit', textDecoration: 'none' }}>Start Practice Session</Link>
              </Button>
              <Button type="default" size="large">
                <Link to="/coding" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code className="w-4 h-4" />
                  Coding Interview
                </Link>
              </Button>
              <Button>
                <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 text-balance">
              Everything You Need to Succeed
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Text & Voice Practice</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose your preferred practice mode. Switch between text and voice to build confidence in any format.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <FileText className="size-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Personalized Sessions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Select your industry and job level. Upload your resume for tailored questions that match your
                  experience.
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <div className="size-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="size-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Detailed Feedback</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Receive comprehensive reports after each session with actionable insights to improve your performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12 text-balance">
              Simple Steps to Success
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Set Your Preferences</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Choose your industry, job level, and optionally upload your resume for more relevant questions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Start Your Interview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Practice with realistic interview questions via text or voice in a comfortable, pressure-free
                    environment.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Review Your Report</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Get detailed feedback on your responses, communication style, and areas for improvement.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button type="primary" size="large">
                <Link to="/setup" style={{ color: 'inherit', textDecoration: 'none' }}>Get Started Now</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Question Bank Section */}
        <section id="question-bank" className="container mx-auto px-4 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
                Question Bank
              </h2>
              <Button type="primary">
                <Link to="/question-bank" style={{ color: 'inherit', textDecoration: 'none' }}>See More</Link>
              </Button>
            </div>

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

            {/* Questions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="h-full">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 flex-wrap">
                      <Tag color={getLevelColor(question.level)}>{question.level}</Tag>
                      <Tag color={getTypeColor(question.type)}>{question.type}</Tag>
                    </div>
                    <p className="text-foreground leading-relaxed">{question.question}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 InterviewPrep. Practice with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
