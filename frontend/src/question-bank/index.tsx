import { useState, useEffect } from 'react';
import { Row, Col, Select, Button, Typography, Empty, Spin } from 'antd';
import { Filter, RotateCcw } from 'lucide-react';
import QuestionCard, { Question } from '../components/QuestionCard';
import { questionBankAPI, QuestionFilters } from '../api/questionBank';

const { Title, Paragraph } = Typography;
const { Option } = Select;

// Mock data - will be replaced with API call
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
  },
  {
    id: '9',
    question: 'Tell me about a time you failed at something. What did you learn?',
    level: 'easy',
    type: 'behavior',
    industry: 'General'
  },
  {
    id: '10',
    question: 'Explain how garbage collection works in your preferred programming language.',
    level: 'medium',
    type: 'technical',
    industry: 'Software'
  },
  {
    id: '11',
    question: 'How would you design a chat application that supports millions of users?',
    level: 'hard',
    type: 'system design',
    industry: 'Software'
  },
  {
    id: '12',
    question: 'Describe your approach to prioritizing features in a product roadmap.',
    level: 'medium',
    type: 'product',
    industry: 'Product'
  },
  {
    id: '13',
    question: 'Give an example of when you had to work with a difficult stakeholder. How did you manage the relationship?',
    level: 'medium',
    type: 'behavior',
    industry: 'General'
  },
  {
    id: '14',
    question: 'What is the difference between SQL and NoSQL databases? When would you use each?',
    level: 'easy',
    type: 'technical',
    industry: 'Software'
  },
  {
    id: '15',
    question: 'Design a recommendation system for an e-commerce platform.',
    level: 'hard',
    type: 'system design',
    industry: 'Software'
  }
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const filters: QuestionFilters = {};
        if (levelFilter !== 'all') filters.level = levelFilter;
        if (typeFilter !== 'all') filters.type = typeFilter;
        
        const questions = await questionBankAPI.getQuestions(filters);
        setQuestions(questions);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        // Fallback to mock data if API fails
        setQuestions(mockQuestions);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [levelFilter, typeFilter]);

  useEffect(() => {
    let filtered = questions;

    if (levelFilter !== 'all') {
      filtered = filtered.filter(q => q.level === levelFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(q => q.type === typeFilter);
    }

    setFilteredQuestions(filtered);
  }, [questions, levelFilter, typeFilter]);

  const resetFilters = () => {
    setLevelFilter('all');
    setTypeFilter('all');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Spin size="large" />
          <Paragraph className="mt-4">Loading questions...</Paragraph>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Title level={2}>Question Bank</Title>
        <Paragraph className="text-lg text-gray-600">
          Browse and filter through our comprehensive collection of interview questions
        </Paragraph>
      </div>

      {/* Filters */}
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
              <Button
                icon={<RotateCcw size={16}/>}
                onClick={resetFilters}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <Paragraph className="text-gray-600">
          Showing {filteredQuestions.length} of {questions.length} questions
        </Paragraph>
      </div>

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <Empty
            description="No questions found matching your filters"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredQuestions.map((question) => (
            <Col xs={24} sm={12} lg={8} key={question.id}>
              <QuestionCard question={question} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}