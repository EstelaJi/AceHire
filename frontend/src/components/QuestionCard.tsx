import { Card, Tag } from 'antd';
import { MessageSquare } from 'lucide-react';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
}

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

const levelColors = {
  easy: 'green',
  medium: 'orange', 
  hard: 'red'
};

const typeColors = {
  behavior: 'blue',
  technical: 'purple',
  product: 'cyan',
  'system design': 'magenta'
};

export default function QuestionCard({ question, onClick }: QuestionCardProps) {
  return (
    <Card 
      hoverable
      onClick={onClick}
      className="h-full transition-all duration-200 hover:shadow-lg"
      bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800 font-medium leading-relaxed">{question.question}</p>
        </div>
      </div>
      
      <div className="mt-auto flex flex-wrap gap-2">
        <Tag color={levelColors[question.level]} className="text-xs">
          {question.level.toUpperCase()}
        </Tag>
        <Tag color={typeColors[question.type]} className="text-xs">
          {question.type.toUpperCase()}
        </Tag>
        {question.industry && (
          <Tag color="default" className="text-xs">
            {question.industry}
          </Tag>
        )}
      </div>
    </Card>
  );
}