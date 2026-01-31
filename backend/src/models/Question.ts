export interface Question {
  id: number;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestionRequest {
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export interface UpdateQuestionRequest {
  question?: string;
  level?: 'easy' | 'medium' | 'hard';
  type?: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation?: string;
  examples?: string[];
}

export interface QuestionFilter {
  level?: 'easy' | 'medium' | 'hard';
  type?: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  limit?: number;
  offset?: number;
}