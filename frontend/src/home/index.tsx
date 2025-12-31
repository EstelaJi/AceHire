import { Link } from "react-router-dom";
import { Button, Select, Row, Col, Space } from 'antd';
import { Sparkles, MessageSquare, FileText, TrendingUp, Shuffle, ArrowRight, Filter } from "lucide-react";
import { useState, useEffect } from 'react';
import QuestionCard, { Question } from '../components/QuestionCard';
import { questionBankAPI, QuestionFilters } from '../api/questionBank';

export default function HomePage() {
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const { Option } = Select;
  const mockQuestions: Question[] = [
    {
      id: '1',
      question: 'Tell me about a time when you had to deal with a difficult team member. How did you handle it?',
      level: 'medium',
      type: 'behavior',
      industry: 'Software'
    },
    {
      id: '2',
      question: 'Explain the difference between a stack and a queue data structure.',
      level: 'easy',
      type: 'technical',
      industry: 'Software'
    },
    {
      id: '3',
      question: 'How would you design a scalable notification system for a social media platform?',
      level: 'hard',
      type: 'system design',
      industry: 'Software'
    },
    {
      id: '4',
      question: 'What metrics would you track to measure the success of a new feature launch?',
      level: 'medium',
      type: 'product',
      industry: 'Product'
    },
    {
      id: '5',
      question: 'Describe a situation where you had to learn a new technology quickly to complete a project.',
      level: 'medium',
      type: 'behavior',
      industry: 'Technology'
    },
    {
      id: '6',
      question: 'How would you implement a rate limiting algorithm for an API?',
      level: 'hard',
      type: 'technical',
      industry: 'Software'
    },
    {
      id: '7',
      question: 'Design a URL shortening service like bit.ly.',
      level: 'medium',
      type: 'system design',
      industry: 'Software'
    },
    {
      id: '8',
      question: 'What would you do if your product usage suddenly dropped by 50%?',
      level: 'hard',
      type: 'product',
      industry: 'Product'
    }
  ];

  useEffect(() => {
    const fetchRandomQuestions = async () => {
      try {
        const filters: QuestionFilters = {};
        if (levelFilter !== 'all') filters.level = levelFilter;
        if (typeFilter !== 'all') filters.type = typeFilter;
        
        const questions = await questionBankAPI.getQuestions({ ...filters, limit: 6 });
        setRandomQuestions(questions);
      } catch (error) {
        console.error('Failed to fetch random questions:', error);
        // Fallback to mock data if API fails
        const filteredQuestions = mockQuestions.filter(q => {
          const levelMatch = levelFilter === 'all' || q.level === levelFilter;
          const typeMatch = typeFilter === 'all' || q.type === typeFilter;
          return levelMatch && typeMatch;
        });
        const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
        setRandomQuestions(shuffled.slice(0, 6));
      } finally {
        setLoading(false);
      }
    };

    fetchRandomQuestions();
  }, [levelFilter, typeFilter]);

  const refreshQuestions = async () => {
    setLoading(true);
    try {
      const filters: QuestionFilters = {};
      if (levelFilter !== 'all') filters.level = levelFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      
      const questions = await questionBankAPI.getQuestions({ ...filters, limit: 6 });
      setRandomQuestions(questions);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
      const filteredQuestions = mockQuestions.filter(q => {
        const levelMatch = levelFilter === 'all' || q.level === levelFilter;
        const typeMatch = typeFilter === 'all' || q.type === typeFilter;
        return levelMatch && typeMatch;
      });
      const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
      setRandomQuestions(shuffled.slice(0, 6));
    } finally {
      setLoading(false);
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
            <Link to="/question-bank" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Question Bank
            </Link>
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
              <Button>
                <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>Learn More</a>
              </Button>
            </div>
          </div>
        </section>

        {/* Question Bank Preview Section */}
        <section className="container mx-auto px-4 py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Practice with Question Bank
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Explore our curated collection of interview questions across different industries and difficulty levels
              </p>
              
              {/* Filters */}
              <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Filter size={20} className="text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-0">Filter Questions</h3>
                </div>
                
                <Row gutter={[16, 16]} align="middle" justify="center">
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <Select
                        value={levelFilter}
                        onChange={setLevelFilter}
                        className="w-full"
                        placeholder="Select level"
                      >
                        <Option value="all">All Levels</Option>
                        <Option value="easy">Easy</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="hard">Hard</Option>
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                      <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        className="w-full"
                        placeholder="Select type"
                      >
                        <Option value="all">All Types</Option>
                        <Option value="behavior">Behavior</Option>
                        <Option value="technical">Technical</Option>
                        <Option value="product">Product</Option>
                        <Option value="system design">System Design</Option>
                      </Select>
                    </div>
                  </Col>
                  <Col xs={24} sm={24} md={6}>
                    <div className="pt-6">
                      <Space>
                        <Button icon={<Shuffle size={16}/>} onClick={refreshQuestions}>
                          Refresh
                        </Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={`/question-bank/all?level=${levelFilter}&type=${typeFilter}`}>
                  <Button type="primary" icon={<ArrowRight size={16}/>}>
                    Browse All Questions
                  </Button>
                </Link>
              </div>
            </div>
            
            <Row gutter={[16, 16]}>
              {randomQuestions.map((question) => (
                <Col xs={24} sm={12} lg={8} key={question.id}>
                  <QuestionCard question={question} />
                </Col>
              ))}
            </Row>
            
            <div className="text-center mt-8">
              <Link to={`/question-bank/all?level=${levelFilter}&type=${typeFilter}`}>
                <Button size="large" type="primary" icon={<ArrowRight size={16}/>}>
                  See More Questions
                </Button>
              </Link>
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
      </main>

      <footer className="border-t border-border bg-card/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 InterviewPrep. Practice with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
