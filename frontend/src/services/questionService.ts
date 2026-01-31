import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

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

export interface QuestionFilter {
  level?: 'easy' | 'medium' | 'hard';
  type?: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  limit?: number;
  offset?: number;
}

// Fetch all questions with optional filters
export const fetchQuestions = async (filter: QuestionFilter = {}): Promise<Question[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions`, { params: filter });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// Fetch a specific question by ID
export const fetchQuestionById = async (id: number): Promise<Question | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Error fetching question:', error);
    throw error;
  }
};

// Fetch random questions
export const fetchRandomQuestions = async (count = 5, filter: QuestionFilter = {}): Promise<Question[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/questions/random`, {
      params: { count, ...filter }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
};

// Create a new question
export const createQuestion = async (questionData: CreateQuestionRequest): Promise<Question> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/questions`, questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

// Update an existing question
export const updateQuestion = async (id: number, updateData: Partial<CreateQuestionRequest>): Promise<Question | null> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/questions/${id}`, updateData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    console.error('Error updating question:', error);
    throw error;
  }
};

// Delete a question
export const deleteQuestion = async (id: number): Promise<boolean> => {
  try {
    await axios.delete(`${API_BASE_URL}/questions/${id}`);
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    console.error('Error deleting question:', error);
    throw error;
  }
};