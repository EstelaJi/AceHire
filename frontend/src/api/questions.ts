const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string | null;
  explanation: string;
  examples: string[];
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateQuestionInput {
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export async function getQuestions(params?: { level?: string; type?: string }): Promise<Question[]> {
  const queryParams = new URLSearchParams();
  if (params?.level) queryParams.append('level', params.level);
  if (params?.type) queryParams.append('type', params.type);

  const response = await fetch(`${API_BASE_URL}/api/questions?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch questions');
  }
  return response.json();
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const questions = await getQuestions();
  return questions.find(q => q.id === id) || null;
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const response = await fetch(`${API_BASE_URL}/api/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create question');
  }
  return response.json();
}
