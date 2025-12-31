import { useState, useEffect } from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Shuffle, ArrowRight } from 'lucide-react';
import QuestionCard, { Question } from '../components/QuestionCard';
import { questionBankAPI } from '../api/questionBank';

const { Title, Paragraph } = Typography;

// Mock data for now - will be replaced with API call
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
  }
];

export default function QuestionBankHomePage() {
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const getRandomQuestions = () => {
    const shuffled = [...mockQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  useEffect(() => {
    const fetchRandomQuestions = async () => {
      try {
        const questions = await questionBankAPI.getRandomQuestions(6);
        setRandomQuestions(questions);
      } catch (error) {
        console.error('Failed to fetch random questions:', error);
        // Fallback to mock data if API fails
        setRandomQuestions(getRandomQuestions());
      } finally {
        setLoading(false);
      }
    };

    fetchRandomQuestions();
  }, []);

  const refreshQuestions = async () => {
    setLoading(true);
    try {
      const questions = await questionBankAPI.getRandomQuestions(6);
      setRandomQuestions(questions);
    } catch (error) {
      console.error('Failed to fetch random questions:', error);
      setRandomQuestions(getRandomQuestions());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Title level={2}>Question Bank</Title>
          <Paragraph className="text-lg text-gray-600">
            Practice with curated interview questions
          </Paragraph>
        </div>
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Title level={2}>Question Bank</Title>
        <Paragraph className="text-lg text-gray-600 mb-6">
          Practice with curated interview questions from various industries and difficulty levels
        </Paragraph>
        <Button 
          icon={<Shuffle size={16} />} 
          onClick={refreshQuestions}
          className="mr-4"
        >
          Refresh Questions
        </Button>
        <Link to="/question-bank/all">
          <Button type="primary" icon={<ArrowRight size={16}/>}>
            See More Questions
          </Button>
        </Link>
      </div>

      <Row gutter={[16, 16]}>
        {randomQuestions.map((question) => (
          <Col xs={24} sm={12} lg={8} key={question.id}>
            <QuestionCard question={question} />
          </Col>
        ))}
      </Row>

      <div className="text-center mt-12">
        <Link to="/question-bank/all">
          <Button size="large" type="primary" icon={<ArrowRight size={16}/>}>
            Browse All Questions
          </Button>
        </Link>
      </div>
    </div>
  );
}