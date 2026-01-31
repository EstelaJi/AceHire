import { Pool } from 'pg';
import { config } from '../config';

interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

// Sample questions from the original questionsData.ts file
const sampleQuestions: Question[] = [
  {
    id: '1',
    question: 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?',
    level: 'easy',
    type: 'behavior',
    industry: 'software',
    explanation: 'This question assesses your interpersonal skills, conflict resolution abilities, and emotional intelligence. Interviewers want to see how you handle challenging team dynamics while maintaining productivity and positive relationships.',
    examples: [
      'In my previous project, I had a team member who consistently missed deadlines and was unresponsive to messages. Instead of escalating immediately, I scheduled a one-on-one to understand their challenges. I discovered they were struggling with a personal issue and overwhelmed with their workload. We collaborated to reprioritize their tasks, and I offered to help with some of my less critical work. This approach not only improved their performance but also strengthened our working relationship, and we successfully delivered the project on time.',
      'I once worked with a colleague who had very different communication styles than me - they were direct and sometimes blunt in meetings, which made team members hesitant to speak up. I pulled them aside privately and shared specific examples of how their approach was impacting the team dynamic. I suggested we try a more collaborative approach where we could all share ideas more freely. They appreciated the feedback and made a conscious effort to adjust their communication style, which led to more open and productive team discussions.'
    ]
  },
  {
    id: '2',
    question: 'Explain the concept of RESTful APIs and provide examples of HTTP methods used in them.',
    level: 'medium',
    type: 'technical',
    industry: 'software',
    explanation: 'REST (Representational State Transfer) is an architectural style for designing networked applications. RESTful APIs use HTTP requests to perform CRUD (Create, Read, Update, Delete) operations on resources. The key principles include statelessness, client-server architecture, and uniform interface.',
    examples: [
      'RESTful APIs are based on the concept of resources identified by URLs. For example, an API endpoint like /api/users would represent the users resource. HTTP methods define the action: GET to retrieve data, POST to create new resources, PUT to update existing ones, and DELETE to remove resources. A GET request to /api/users/1 would retrieve the user with ID 1, while a POST to /api/users would create a new user. RESTful APIs typically return data in JSON format and use HTTP status codes to indicate the result of operations.',
      'RESTful APIs leverage HTTP methods for CRUD operations: GET retrieves data (e.g., GET /api/products returns all products), POST creates new resources (e.g., POST /api/products creates a product), PUT updates existing resources (e.g., PUT /api/products/1 updates product with ID 1), and DELETE removes resources (e.g., DELETE /api/products/1 deletes product with ID 1). REST emphasizes statelessness, meaning each request must contain all information needed to process it, and caching for performance optimization. APIs following REST principles are scalable, maintainable, and easy to integrate with various clients.'
    ]
  },
  {
    id: '3',
    question: 'How would you design a scalable microservices architecture for an e-commerce platform?',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question evaluates your ability to design complex distributed systems. Interviewers look for understanding of microservices patterns, scalability strategies, database design, caching, load balancing, and overall system architecture principles.',
    examples: [
      'For an e-commerce platform, I would start by decomposing the system into bounded contexts: user service, product catalog, order management, payment processing, inventory, and recommendation services. Each service would be independently deployable and communicate via REST or gRPC. I would use an API gateway to route requests and handle authentication. For data storage, I would use a mix of relational databases for transactions (PostgreSQL) and NoSQL for product catalog (MongoDB). Caching with Redis would improve performance for frequently accessed data. Message queues like Kafka would handle asynchronous processing for order fulfillment. The system would be deployed on Kubernetes for container orchestration, with auto-scaling based on load. Monitoring would be implemented using Prometheus and Grafana.',
      'A scalable e-commerce architecture would begin with identifying core business domains and creating independent services. Services like user management, product search, cart, checkout, and payment would each have their own databases and APIs. Event-driven architecture using RabbitMQ or Kafka would enable services to communicate asynchronously. For scaling, I would implement horizontal scaling with load balancers like NGINX. A distributed cache layer with Redis would reduce database load. For the database layer, I would use sharding for large datasets and read replicas for scaling read operations. The system would include circuit breakers to prevent cascading failures. Frontend would be served via CDN. Security would include OAuth2 for authentication and rate limiting to prevent abuse. Infrastructure-as-Code tools like Terraform would manage deployments across multiple availability zones.'
    ]
  },
  {
    id: '4',
    question: 'Describe a product you recently used that you think is well-designed. What makes it stand out?',
    level: 'easy',
    type: 'product',
    industry: 'product',
    explanation: 'This question evaluates your product sense, ability to analyze user experience, and understanding of what makes a product successful. Interviewers want to see if you can articulate design principles and identify what creates value for users.',
    examples: [
      'I recently used Notion and was impressed by its well-designed interface. What stood out was its extreme flexibility and intuitive organization. The database feature allows users to create custom views - tables, boards, calendars - all from the same data source. The keyboard shortcuts make navigation incredibly efficient. The collaboration features like real-time editing and comments are seamlessly integrated without feeling cluttered. The design balances power with simplicity - beginners can create basic pages, while power users can build complex workflows. The consistency across platforms (web, mobile, desktop) also makes it easy to transition between devices.',
      'I was really impressed by the Figma mobile app. What makes it stand out is how successfully it brings a complex desktop design tool to mobile without compromising functionality. The touch gestures are intuitive - two-finger taps for zoom, swipe panels for layers. The interface maintains the same familiar structure as the desktop version, making the transition seamless. Collaboration features like commenting and viewing prototypes work beautifully on mobile. The offline mode is particularly well-designed - you can work on files without an internet connection, and changes sync automatically when you reconnect. The attention to detail in interactions, like subtle animations when switching tools, shows thoughtful design that prioritizes user experience.'
    ]
  },
  {
    id: '5',
    question: 'How do you prioritize features when working on a product roadmap?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your strategic thinking, understanding of product management frameworks, and ability to make data-informed decisions. Interviewers want to see how you balance user needs, business goals, and technical feasibility.',
    examples: [
      'I use a combination of frameworks to prioritize features. I start by understanding the business objectives and aligning features with those goals. For user-facing features, I use RICE scoring: Reach (how many users it affects), Impact (how much it improves their experience), Confidence (how certain we are about the estimates), and Effort (how much work it requires). I also consider Kano analysis to differentiate between basic needs, performance features, and excitement features. Stakeholder input is important, but I ground decisions in data - user research, analytics, and feedback. I maintain a backlog that regularly gets reassessed based on new information. Communication is key - I make sure the team understands why certain features are prioritized and how they contribute to the overall vision.',
      'My prioritization approach begins with clear goal alignment. I work with stakeholders to define what success looks like for each product cycle. I then use the MoSCoW method as a first pass to categorize features: Must-have, Should-have, Could-have, and Won\'t-have. For more detailed prioritization, I use value vs. effort matrices to identify quick wins and strategic bets. User feedback through surveys, interviews, and support tickets informs which features will have the most impact. I also consider technical debt and infrastructure needs alongside new features. I maintain transparency by sharing the prioritization criteria with the team and stakeholders, and I\'m prepared to adjust as we learn from user testing and market changes.'
    ]
  }
];

async function seedQuestions() {
  const pool = new Pool({ connectionString: config.postgresUrl });
  
  try {
    console.log('Seeding interview questions...');
    
    // Check if questions already exist
    const { rows: existingQuestions } = await pool.query('SELECT COUNT(*) as count FROM interview_questions');
    const count = parseInt(existingQuestions[0].count);
    
    if (count > 0) {
      console.log(`Database already contains ${count} questions. Skipping seed.`);
      return;
    }
    
    // Insert sample questions
    for (const question of sampleQuestions) {
      await pool.query(
        `INSERT INTO interview_questions (question, level, type, industry, explanation, examples)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          question.question,
          question.level,
          question.type,
          question.industry || null,
          question.explanation,
          question.examples
        ]
      );
    }
    
    console.log(`Successfully seeded ${sampleQuestions.length} interview questions`);
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('Database seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedQuestions };