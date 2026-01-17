const API_BASE_URL = '/api';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export async function getQuestions(filters?: {
  level?: 'easy' | 'medium' | 'hard';
  type?: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
}): Promise<Question[]> {
  const params = new URLSearchParams();
  if (filters?.level) params.append('level', filters.level);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.industry) params.append('industry', filters.industry);

  const response = await fetch(`${API_BASE_URL}/questions?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch question');
  }
  return response.json();
}
