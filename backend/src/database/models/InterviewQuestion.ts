export interface InterviewQuestion {
  id: number;
  question_text: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
  created_at: Date;
  updated_at: Date;
}

export interface QuestionFilters {
  level?: string;
  type?: string;
  industry?: string;
  search?: string;
}
