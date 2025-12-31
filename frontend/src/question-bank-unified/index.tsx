import { useState, useEffect } from 'react';
import { Row, Col, Button, Typography, Select, Space } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { Shuffle, ArrowRight, Filter } from 'lucide-react';
import QuestionCard, { Question } from '../components/QuestionCard';
import { questionBankAPI, QuestionFilters } from '../api/questionBank';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function QuestionBankPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>(searchParams.get('level') || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || 'all');
  const [isHomepage, setIsHomepage] = useState<boolean>(window.location.pathname === '/question-bank');
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const filters: QuestionFilters = {};
      if (levelFilter !== 'all') filters.level = levelFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      
      const limit = isHomepage ? 6 : 50; // Show 6 on homepage, 50 on full page
      const fetchedQuestions = await questionBankAPI.getQuestions({ ...filters, limit });
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      // Fallback to random questions if API fails
      const fallbackQuestions = await questionBankAPI.getRandomQuestions(isHomepage ? 6 : 50);
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  const refreshQuestions = async () => {
    setLoading(true);
    try {
      const randomQuestions = await questionBankAPI.getRandomQuestions(isHomepage ? 6 : 50);
      setQuestions(randomQuestions);
    } catch (error) {
      console.error('Failed to refresh questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsHomepage(window.location.pathname === '/question-bank');
    fetchQuestions();
  }, [levelFilter, typeFilter]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    setSearchParams(params);
  }, [levelFilter, typeFilter, setSearchParams]);

  const FilterSection = () => (
    <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-gray-600" />
        <Title level={4} className="!mb-0">Filters</Title>
      </div>
      
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
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
        <Col xs={24} sm={12} md={8}>
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
        <Col xs={24} sm={24} md={8}>
          <div className="pt-6">
            <Space>
              <Button icon={<Shuffle size={16}/>} onClick={refreshQuestions}>
                Refresh
              </Button>
              <Button onClick={() => { setLevelFilter('all'); setTypeFilter('all'); }}>
                Reset Filters
              </Button>
            </Space>
          </div>
        </Col>
      </Row>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                <Shuffle className="size-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg text-foreground">Question Bank</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
            </nav>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Shuffle className="size-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Question Bank</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Title level={2}>Question Bank</Title>
          <Paragraph className="text-lg text-gray-600">
            {isHomepage 
              ? "Practice with curated interview questions from various industries and difficulty levels"
              : "Browse and filter through our comprehensive collection of interview questions"
            }
          </Paragraph>
        </div>

        {/* Show filters on both homepage and full page */}
        <FilterSection />

        {/* Results count */}
        <div className="mb-6">
          <Paragraph className="text-gray-600">
            Showing {questions.length} questions
          </Paragraph>
        </div>

        {/* Questions Grid */}
        <Row gutter={[16, 16]}>
          {questions.map((question) => (
            <Col xs={24} sm={12} lg={isHomepage ? 8 : 8} key={question.id}>
              <QuestionCard question={question} />
            </Col>
          ))}
        </Row>

        {/* Show "See More" button only on homepage */}
        {isHomepage && (
          <div className="text-center mt-12">
            <Link to={`/question-bank/all?level=${levelFilter}&type=${typeFilter}`}>
              <Button size="large" type="primary" icon={<ArrowRight size={16}/>}>
                See More Questions
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}