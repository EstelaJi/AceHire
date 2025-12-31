export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
}

export const questions: Question[] = [
  {
    id: '1',
    question: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
    level: 'easy',
    type: 'behavior',
    industry: 'software'
  },
  {
    id: '2',
    question: 'Explain the concept of RESTful APIs and provide examples of HTTP methods used in them.',
    level: 'medium',
    type: 'technical',
    industry: 'software'
  },
  {
    id: '3',
    question: 'How would you design a scalable microservices architecture for an e-commerce platform?',
    level: 'hard',
    type: 'system design',
    industry: 'software'
  },
  {
    id: '4',
    question: 'Describe a product you recently used that you think is well-designed. What makes it stand out?',
    level: 'easy',
    type: 'product',
    industry: 'product'
  },
  {
    id: '5',
    question: 'How do you prioritize features when working on a product roadmap?',
    level: 'medium',
    type: 'product',
    industry: 'product'
  },
  {
    id: '6',
    question: 'Explain the differences between SQL and NoSQL databases and when to use each.',
    level: 'medium',
    type: 'technical',
    industry: 'software'
  },
  {
    id: '7',
    question: 'Tell me about a time when you had to make a difficult decision with limited information.',
    level: 'medium',
    type: 'behavior',
    industry: 'general'
  },
  {
    id: '8',
    question: 'How would you design a real-time chat application for millions of users?',
    level: 'hard',
    type: 'system design',
    industry: 'software'
  },
  {
    id: '9',
    question: 'Describe a time when you had to adapt to a significant change in project requirements.',
    level: 'easy',
    type: 'behavior',
    industry: 'general'
  },
  {
    id: '10',
    question: 'What are the key principles of object-oriented programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software'
  },
  {
    id: '11',
    question: 'How do you approach user research to inform product decisions?',
    level: 'medium',
    type: 'product',
    industry: 'product'
  },
  {
    id: '12',
    question: 'Design a system to handle high-volume API requests with rate limiting.',
    level: 'hard',
    type: 'system design',
    industry: 'software'
  },
  {
    id: '13',
    question: 'Tell me about a time when you had to lead a team through a challenging project.',
    level: 'hard',
    type: 'behavior',
    industry: 'general'
  },
  {
    id: '14',
    question: 'Explain the concept of containerization and how Docker works.',
    level: 'medium',
    type: 'technical',
    industry: 'software'
  },
  {
    id: '15',
    question: 'How would you improve the user onboarding experience for a mobile app?',
    level: 'medium',
    type: 'product',
    industry: 'product'
  },
  {
    id: '16',
    question: 'Describe a time when you had to resolve a conflict between team members.',
    level: 'medium',
    type: 'behavior',
    industry: 'general'
  },
  {
    id: '17',
    question: 'What is the difference between synchronous and asynchronous programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software'
  },
  {
    id: '18',
    question: 'How do you measure the success of a product feature?',
    level: 'easy',
    type: 'product',
    industry: 'product'
  },
  {
    id: '19',
    question: 'Design a distributed caching system to improve application performance.',
    level: 'hard',
    type: 'system design',
    industry: 'software'
  },
  {
    id: '20',
    question: 'Tell me about a time when you had to learn a new technology quickly to complete a project.',
    level: 'medium',
    type: 'behavior',
    industry: 'software'
  }
];