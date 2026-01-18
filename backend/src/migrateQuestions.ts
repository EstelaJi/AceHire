import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// 硬编码的问题数据（从前端复制）
const questionsData = [
  {
    "question": "Tell me about yourself",
    "level": "easy",
    "type": "behavior",
    "industry": "General",
    "explanation": "This is a common opening question used to understand your background, skills, and career goals.",
    "examples": [
      "Focus on your professional experience",
      "Highlight key achievements",
      "Connect your background to the job requirements"
    ]
  },
  {
    "question": "What are your strengths?",
    "level": "easy",
    "type": "behavior",
    "industry": "General",
    "explanation": "Interviewers want to know your key strengths and how they can benefit the company.",
    "examples": [
      "Use the STAR method to provide examples",
      "Align your strengths with the job requirements",
      "Show confidence but avoid sounding arrogant"
    ]
  },
  {
    "question": "What is React?",
    "level": "easy",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "React is a JavaScript library for building user interfaces, developed by Facebook.",
    "examples": [
      "It allows for building reusable UI components",
      "Uses a virtual DOM for efficient updates",
      "Follows a component-based architecture"
    ]
  },
  {
    "question": "How do you handle conflict in the workplace?",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your interpersonal skills and ability to resolve conflicts professionally.",
    "examples": [
      "Stay calm and listen to all parties involved",
      "Focus on finding a solution rather than assigning blame",
      "Document the conflict and resolution process if necessary"
    ]
  },
  {
    "question": "Explain the concept of RESTful APIs",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "RESTful APIs are a set of architectural principles for designing networked applications.",
    "examples": [
      "Use HTTP methods (GET, POST, PUT, DELETE) to perform operations",
      "Statelessness: each request contains all necessary information",
      "Resource-based URLs for accessing data"
    ]
  },
  {
    "question": "Tell me about a time you failed",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "Interviewers want to see how you handle failure and what you learn from it.",
    "examples": [
      "Be honest about the failure but focus on the learning experience",
      "Show how you've grown from the experience",
      "Avoid blaming others"
    ]
  },
  {
    "question": "How would you improve our product?",
    "level": "medium",
    "type": "product",
    "industry": "Technology",
    "explanation": "This question assesses your understanding of the product and your strategic thinking.",
    "examples": [
      "Research the product and its competitors",
      "Identify areas for improvement based on user feedback",
      "Provide specific, actionable recommendations"
    ]
  },
  {
    "question": "What is the difference between SQL and NoSQL databases?",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "SQL databases are relational and use structured query language, while NoSQL databases are non-relational.",
    "examples": [
      "SQL databases: MySQL, PostgreSQL, Oracle",
      "NoSQL databases: MongoDB, Cassandra, Redis",
      "SQL is better for structured data with complex relationships",
      "NoSQL is better for unstructured data and scalability"
    ]
  },
  {
    "question": "Describe a situation where you had to work with a difficult team member",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your teamwork and conflict resolution skills.",
    "examples": [
      "Focus on understanding their perspective",
      "Communicate openly and professionally",
      "Find common ground to work together effectively"
    ]
  },
  {
    "question": "How do you stay updated with industry trends?",
    "level": "easy",
    "type": "behavior",
    "industry": "General",
    "explanation": "Interviewers want to know if you're proactive about professional development.",
    "examples": [
      "Follow industry blogs and publications",
      "Attend conferences and workshops",
      "Participate in online communities"
    ]
  },
  {
    "question": "What is your greatest weakness?",
    "level": "easy",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your self-awareness and ability to improve.",
    "examples": [
      "Be honest but choose a weakness that's not critical for the job",
      "Show how you're working to improve it",
      "Avoid clichéd answers like 'I'm a perfectionist'"
    ]
  },
  {
    "question": "Why should we hire you?",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This is your opportunity to sell yourself and explain why you're the best candidate.",
    "examples": [
      "Highlight your unique skills and experiences",
      "Connect your background to the job requirements",
      "Show enthusiasm for the company and role"
    ]
  },
  {
    "question": "Explain the concept of object-oriented programming",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "Object-oriented programming (OOP) is a programming paradigm based on the concept of 'objects'.",
    "examples": [
      "Encapsulation: bundling data and methods into a single unit",
      "Inheritance: creating new classes from existing ones",
      "Polymorphism: using a single interface to represent different types"
    ]
  },
  {
    "question": "What is your experience with Agile development?",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "Agile is a software development methodology that emphasizes flexibility and collaboration.",
    "examples": [
      "Participate in daily stand-up meetings",
      "Work in sprints with defined goals",
      "Use tools like Jira or Trello for project management"
    ]
  },
  {
    "question": "Tell me about a time you had to meet a tight deadline",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your time management and stress management skills.",
    "examples": [
      "Prioritize tasks based on importance and urgency",
      "Communicate proactively with stakeholders",
      "Stay focused and avoid distractions"
    ]
  },
  {
    "question": "What is the cloud and how have you used it?",
    "level": "medium",
    "type": "technical",
    "industry": "Technology",
    "explanation": "The cloud refers to the delivery of computing services over the internet.",
    "examples": [
      "AWS, Azure, and Google Cloud are major cloud providers",
      "Cloud services include IaaS, PaaS, and SaaS",
      "Benefits include scalability, cost-effectiveness, and accessibility"
    ]
  },
  {
    "question": "How do you handle feedback?",
    "level": "easy",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your ability to accept constructive criticism and grow.",
    "examples": [
      "Listen actively and ask clarifying questions",
      "Thank the person for their feedback",
      "Take action to improve based on the feedback"
    ]
  },
  {
    "question": "What is your approach to problem-solving?",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "Interviewers want to understand your process for solving complex problems.",
    "examples": [
      "Define the problem clearly",
      "Gather information and analyze the situation",
      "Develop and evaluate potential solutions",
      "Implement the best solution and monitor results"
    ]
  },
  {
    "question": "Explain the concept of microservices",
    "level": "hard",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "Microservices is an architectural style that structures an application as a collection of small, autonomous services.",
    "examples": [
      "Each service runs in its own process and communicates via APIs",
      "Services are independently deployable and scalable",
      "Benefits include improved fault isolation and easier maintenance"
    ]
  },
  {
    "question": "Tell me about a time you led a project",
    "level": "hard",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your leadership skills and ability to manage projects.",
    "examples": [
      "Define clear goals and objectives",
      "Delegate tasks based on team members' strengths",
      "Communicate regularly and keep the team motivated",
      "Monitor progress and adjust plans as needed"
    ]
  },
  {
    "question": "How would you design a scalable system for our product?",
    "level": "hard",
    "type": "system design",
    "industry": "Technology",
    "explanation": "This question assesses your ability to design complex, scalable systems.",
    "examples": [
      "Consider factors like performance, availability, and security",
      "Use appropriate architectural patterns and technologies",
      "Plan for growth and scalability from the start"
    ]
  },
  {
    "question": "What is your experience with machine learning?",
    "level": "hard",
    "type": "technical",
    "industry": "Data Science",
    "explanation": "This question assesses your knowledge and experience with machine learning concepts and techniques.",
    "examples": [
      "Familiarity with supervised and unsupervised learning",
      "Experience with machine learning frameworks like TensorFlow or PyTorch",
      "Ability to apply machine learning to solve real-world problems"
    ]
  },
  {
    "question": "Tell me about a time you had to make a difficult decision",
    "level": "hard",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your decision-making skills and ability to handle complex situations.",
    "examples": [
      "Gather all relevant information and consider different perspectives",
      "Weigh the pros and cons of each option",
      "Make a decision and take responsibility for the outcome"
    ]
  },
  {
    "question": "How do you ensure code quality in your projects?",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "This question assesses your approach to writing high-quality, maintainable code.",
    "examples": [
      "Follow coding standards and best practices",
      "Write unit tests to ensure code functionality",
      "Use code reviews to catch issues early",
      "Refactor code regularly to improve maintainability"
    ]
  },
  {
    "question": "What is your experience with DevOps practices?",
    "level": "medium",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "DevOps is a set of practices that combines software development (Dev) and IT operations (Ops).",
    "examples": [
      "Continuous integration and continuous deployment (CI/CD)",
      "Infrastructure as code (IaC)",
      "Monitoring and logging for production systems"
    ]
  },
  {
    "question": "Tell me about a time you had to adapt to a significant change",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your flexibility and ability to adapt to new situations.",
    "examples": [
      "Stay positive and open-minded about the change",
      "Learn new skills or processes as needed",
      "Support others who may be struggling with the change"
    ]
  },
  {
    "question": "What is your understanding of our company and industry?",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your research and preparation for the interview.",
    "examples": [
      "Research the company's products, services, and values",
      "Understand the industry trends and challenges",
      "Connect your background to the company's mission"
    ]
  },
  {
    "question": "How do you manage your time and prioritize tasks?",
    "level": "medium",
    "type": "behavior",
    "industry": "General",
    "explanation": "This question assesses your time management and organizational skills.",
    "examples": [
      "Use tools like to-do lists or project management software",
      "Prioritize tasks based on importance and urgency",
      "Set realistic deadlines and track progress"
    ]
  },
  {
    "question": "What is your experience with data structures and algorithms?",
    "level": "hard",
    "type": "technical",
    "industry": "Software Development",
    "explanation": "This question assesses your knowledge of fundamental computer science concepts.",
    "examples": [
      "Familiarity with common data structures like arrays, linked lists, trees, and graphs",
      "Understanding of algorithms for sorting, searching, and graph traversal",
      "Ability to analyze algorithm complexity using Big O notation"
    ]
  }
];

async function migrateQuestions() {
  const client = new Client({
    host: 'localhost',
    port: 5431,
    database: 'interview_app',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // 创建表（如果不存在）
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS interview_questions (
        id VARCHAR(255) PRIMARY KEY,
        question TEXT NOT NULL,
        level VARCHAR(50) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
        type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
        industry VARCHAR(255),
        explanation TEXT NOT NULL,
        examples JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await client.query(createTableQuery);
    console.log('Table created or already exists');

    // 清空表（如果需要）
    await client.query('DELETE FROM interview_questions');
    console.log('Table cleared');

    // 插入数据
    const insertQuery = `
      INSERT INTO interview_questions (id, question, level, type, industry, explanation, examples)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    for (const question of questionsData) {
      const id = uuidv4();
      await client.query(insertQuery, [
        id,
        question.question,
        question.level,
        question.type,
        question.industry,
        question.explanation,
        JSON.stringify(question.examples)
      ]);
    }

    console.log(`Successfully migrated ${questionsData.length} questions`);
  } catch (error) {
    console.error('Error migrating questions:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Disconnected from PostgreSQL database');
  }
}

migrateQuestions();
