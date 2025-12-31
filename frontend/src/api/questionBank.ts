const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
}

export interface QuestionFilters {
  level?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export const questionBankAPI = {
  async getRandomQuestions(count: number = 6): Promise<Question[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/random?count=${count}`);
      if (!response.ok) throw new Error('Failed to fetch random questions');
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      return [];
    }
  },

  async getQuestions(filters: QuestionFilters = {}): Promise<Question[]> {
    try {
      const params = new URLSearchParams();
      if (filters.level) params.append('level', filters.level);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${API_BASE_URL}/api/questions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  },

  async getQuestionById(id: string): Promise<Question | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${id}`);
      if (!response.ok) throw new Error('Failed to fetch question');
      const data = await response.json();
      return data.question;
    } catch (error) {
      console.error('Error fetching question:', error);
      return null;
    }
  }
};