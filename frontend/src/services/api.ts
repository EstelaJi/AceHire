export interface Question {
  id: string;
  question: string;
  level: string;
  type: string;
  industry?: string;
  explanation: string;
  examples: string[];
  created_at?: string;
  updated_at?: string;
}

export interface QuestionFilters {
  level?: string;
  type?: string;
  industry?: string;
  search?: string;
}

const API_BASE_URL = 'http://localhost:4000/api';

export const questionApi = {
  getAll: async (filters?: QuestionFilters): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.level) params.append('level', filters.level);
      if (filters.type) params.append('type', filters.type);
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.search) params.append('search', filters.search);
    }

    const response = await fetch(`${API_BASE_URL}/questions?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    return data.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await fetch(`${API_BASE_URL}/questions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question');
    }
    const data = await response.json();
    return data.data;
  },
};
