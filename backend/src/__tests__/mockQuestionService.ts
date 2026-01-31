// Mock database service for testing
export interface Question {
  id: number;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
  created_at?: Date;
}

class MockQuestionService {
  private questions: Question[] = [
    {
      id: 1,
      question: 'Tell me about yourself.',
      level: 'easy',
      type: 'behavior',
      industry: 'general',
      explanation: 'This is a common opening question that allows candidates to introduce themselves and highlight their key qualifications.',
      examples: [
        'I am a software developer with 5 years of experience in web development.',
        'I recently graduated with a degree in computer science and am passionate about machine learning.'
      ]
    },
    {
      id: 2,
      question: 'What is your greatest strength?',
      level: 'easy',
      type: 'behavior',
      industry: 'general',
      explanation: 'This question assesses self-awareness and confidence.',
      examples: [
        'My greatest strength is my ability to adapt to new situations quickly.',
        'I believe my greatest strength is my problem-solving skills.'
      ]
    },
    {
      id: 3,
      question: 'Explain the difference between REST and GraphQL.',
      level: 'medium',
      type: 'technical',
      industry: 'technology',
      explanation: 'This question tests understanding of API design principles.',
      examples: [
        'REST is an architectural style that uses standard HTTP methods, while GraphQL is a query language.',
        'REST requires multiple endpoints for different resources, while GraphQL uses a single endpoint.'
      ]
    }
  ];
  
  private nextId = 4;

  async getAllQuestions(level?: string, type?: string, limit?: number): Promise<Question[]> {
    let filteredQuestions = [...this.questions];
    
    if (level) {
      filteredQuestions = filteredQuestions.filter(q => q.level === level);
    }
    
    if (type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === type);
    }
    
    if (limit) {
      filteredQuestions = filteredQuestions.slice(0, limit);
    }
    
    return filteredQuestions;
  }

  async getQuestionById(id: number): Promise<Question | null> {
    return this.questions.find(q => q.id === id) || null;
  }

  async getRandomQuestions(count: number = 1, level?: string): Promise<Question[]> {
    let filteredQuestions = [...this.questions];
    
    if (level) {
      filteredQuestions = filteredQuestions.filter(q => q.level === level);
    }
    
    // Shuffle and take the first 'count' questions
    const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async createQuestion(questionData: Omit<Question, 'id' | 'created_at'>): Promise<Question> {
    const newQuestion: Question = {
      ...questionData,
      id: this.nextId++,
      created_at: new Date()
    };
    
    this.questions.push(newQuestion);
    return newQuestion;
  }

  async updateQuestion(id: number, questionData: Partial<Omit<Question, 'id' | 'created_at'>>): Promise<Question | null> {
    const questionIndex = this.questions.findIndex(q => q.id === id);
    
    if (questionIndex === -1) {
      return null;
    }
    
    this.questions[questionIndex] = {
      ...this.questions[questionIndex],
      ...questionData
    };
    
    return this.questions[questionIndex];
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const questionIndex = this.questions.findIndex(q => q.id === id);
    
    if (questionIndex === -1) {
      return false;
    }
    
    this.questions.splice(questionIndex, 1);
    return true;
  }
}

export const mockQuestionService = new MockQuestionService();