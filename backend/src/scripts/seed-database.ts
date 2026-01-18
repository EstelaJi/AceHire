import { Pool } from 'pg';
import * as dotenv from 'dotenv';

interface Question {
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

const questions: Question[] = [
  {
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
    question: 'How do you prioritize features when working on a product roadmap?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your strategic thinking, understanding of product management frameworks, and ability to make data-informed decisions. Interviewers want to see how you balance user needs, business goals, and technical feasibility.',
    examples: [
      'I use a combination of frameworks to prioritize features. I start by understanding the business objectives and aligning features with those goals. For user-facing features, I use RICE scoring: Reach (how many users it affects), Impact (how much it improves their experience), Confidence (how certain we are about the estimates), and Effort (how much work it requires). I also consider Kano analysis to differentiate between basic needs, performance features, and excitement features. Stakeholder input is important, but I ground decisions in data - user research, analytics, and feedback. I maintain a backlog that regularly gets reassessed based on new information. Communication is key - I make sure the team understands why certain features are prioritized and how they contribute to the overall vision.',
      'My prioritization approach begins with clear goal alignment. I work with stakeholders to define what success looks like for each product cycle. I then use the MoSCoW method as a first pass to categorize features: Must-have, Should-have, Could-have, and Won\'t-have. For more detailed prioritization, I use value vs. effort matrices to identify quick wins and strategic bets. User feedback through surveys, interviews, and support tickets informs which features will have the most impact. I also consider technical debt and infrastructure needs alongside new features. I maintain transparency by sharing the prioritization criteria with the team and stakeholders, and I\'m prepared to adjust as we learn from user testing and market changes.'
    ]
  },
  {
    question: 'Explain the differences between SQL and NoSQL databases and when to use each.',
    level: 'medium',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your knowledge of database systems and your ability to choose the right tool for different use cases. Interviewers want to see understanding of data models, scalability, consistency, and trade-offs between different database types.',
    examples: [
      'SQL databases are relational and use structured query language. They enforce ACID properties (Atomicity, Consistency, Isolation, Durability) which makes them ideal for transactional data like banking, e-commerce, and user accounts where data integrity is critical. Examples include MySQL, PostgreSQL, and SQLite. NoSQL databases are non-relational and come in several types: document (MongoDB, CouchDB), key-value (Redis, DynamoDB), column-family (Cassandra), and graph (Neo4j). NoSQL databases excel at scaling horizontally and handling unstructured data. They often sacrifice strong consistency for higher availability and partition tolerance (CAP theorem). NoSQL is good for content management, real-time analytics, IoT, and applications needing rapid iteration. The choice depends on your specific needs: use SQL for complex queries, transactions, and structured data; use NoSQL for scalability, unstructured data, and rapid development.',
      'SQL databases store data in tables with predefined schemas and use SQL for queries. They provide strong consistency and are well-suited for applications with complex relationships between data entities. NoSQL databases have flexible schemas and are designed for horizontal scaling. Document databases like MongoDB store data in JSON-like documents and are great for content management and user profiles. Key-value stores like Redis are excellent for caching and real-time applications. Column-family databases like Cassandra handle massive amounts of data across many servers. Graph databases excel at managing highly connected data like social networks. When choosing, consider if your data has a fixed structure (SQL) or is evolving (NoSQL), if you need ACID compliance (SQL), and how much scaling you anticipate (NoSQL often scales better horizontally).'
    ]
  },
  {
    question: 'Tell me about a time when you had to make a difficult decision with limited information.',
    level: 'medium',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question assesses your decision-making skills under pressure. Interviewers want to see your ability to analyze situations, consider available data, and make confident decisions even when information is incomplete.',
    examples: [
      'In my previous role, our main server went down unexpectedly, and we had limited diagnostic information. The team was debating whether to roll back recent changes or investigate further. I decided to gather quick input from team members about what changes had been made recently, then prioritized the most likely causes. We quickly identified a problematic deployment and rolled it back, restoring service within 45 minutes. Afterward, I implemented better monitoring to provide more context during future incidents.',
      'I faced a situation where a key client was threatening to leave due to performance issues, but we had conflicting data about the root cause. Instead of waiting for a full analysis, I decided to take immediate action: I temporarily allocated additional resources to the client while my team continued investigating. This prevented the client from leaving while we identified and fixed the underlying issue. The quick decision based on partial information helped preserve an important relationship.'
    ]
  },
  {
    question: 'How would you design a real-time chat application for millions of users?',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question evaluates your understanding of real-time systems, scalability, and messaging protocols. Interviewers want to see your knowledge of WebSockets, message brokers, database design, and handling concurrent connections.',
    examples: [
      'For a real-time chat app, I would use WebSockets for bidirectional communication between clients and servers. A message broker like Redis Pub/Sub or Kafka would handle routing messages between users. For the database layer, I would use Cassandra for storing chat history due to its ability to handle write-heavy workloads. User presence could be managed with Redis. I would implement sharding based on user IDs to distribute load across servers. For reliability, messages would be persisted before being acknowledged. The system would include rate limiting to prevent abuse. I would use a combination of Node.js or Go for WebSocket servers, and implement connection pooling to handle millions of concurrent connections.',
      'A scalable chat application would use a publish-subscribe architecture. WebSockets would provide the real-time connection, with a fallback to HTTP long polling for browsers that don\'t support WebSockets. A message broker like RabbitMQ would handle message routing. I would design the system with horizontal scalability in mind, using load balancers to distribute connections. The database design would separate user profiles (PostgreSQL) from chat history (MongoDB or Cassandra). I would implement features like read receipts, typing indicators, and message persistence. For handling offline users, I would use push notifications. The system would need to handle message ordering, especially in group chats, and ensure low latency for a good user experience.'
    ]
  },
  {
    question: 'Describe a time when you had to adapt to a significant change in project requirements.',
    level: 'easy',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question assesses your flexibility and resilience. Interviewers want to see how you handle unexpected changes, maintain productivity, and stay positive when plans change.',
    examples: [
      'In my previous project, the client significantly changed the core feature requirements halfway through development. Instead of becoming frustrated, I led a team meeting to understand the new requirements and assess the impact on our timeline. We identified what work could be salvaged and what needed to be scrapped. I communicated the changes clearly to stakeholders and renegotiated the deadline. We adjusted our sprints, reprioritized tasks, and provided regular updates to the client. The project was completed successfully, and the client appreciated our adaptability.',
      'I experienced a major pivot when our product strategy changed direction due to market research showing our initial approach wouldn\'t meet user needs. I quickly learned the new domain, mapped out the revised requirements, and worked with the team to create a new implementation plan. I took responsibility for learning the new technology stack required and shared my knowledge with the team. Through effective communication and a positive attitude, we were able to adapt quickly and deliver a stronger product that better addressed user needs.'
    ]
  },
  {
    question: 'What are the key principles of object-oriented programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your fundamental understanding of OOP concepts. Interviewers want to see your grasp of encapsulation, inheritance, polymorphism, and abstraction - the four pillars of object-oriented programming.',
    examples: [
      'The four key principles of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Encapsulation is the bundling of data (attributes) and methods that operate on the data into a single unit (class), restricting access to some components. Inheritance allows a class to inherit properties and methods from another class, promoting code reuse. Polymorphism means the same operation can behave differently for different types - method overloading and overriding are examples. Abstraction focuses on hiding complex implementation details and showing only the essential features of an object, often achieved through interfaces or abstract classes. Together, these principles help create modular, reusable, and maintainable code.',
      'Object-oriented programming is built on core principles that enhance code organization and reusability. Encapsulation keeps data safe by restricting direct access, using getters and setters instead. Inheritance creates a hierarchy where child classes inherit from parent classes, reducing redundancy. Polymorphism allows methods to have the same name but different implementations - for example, a Shape class with a draw() method that works differently for Circle and Square subclasses. Abstraction simplifies complex systems by providing clear interfaces without revealing internal workings. These principles make code more flexible, easier to debug, and better suited for large-scale applications.'
    ]
  }
];

async function seedDatabase() {
  dotenv.config({
    path: '../../.env'
  });

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/interview_db',
  });

  try {
    console.log('Creating questions table if not exists...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        level VARCHAR(20) NOT NULL CHECK (level IN ('easy', 'medium', 'hard')),
        type VARCHAR(50) NOT NULL CHECK (type IN ('behavior', 'technical', 'product', 'system design')),
        industry VARCHAR(100),
        explanation TEXT NOT NULL,
        examples TEXT[] NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Clearing existing questions...');
    await pool.query('TRUNCATE TABLE questions RESTART IDENTITY');

    console.log('Seeding questions...');
    for (const q of questions) {
      await pool.query(
        `INSERT INTO questions (question, level, type, industry, explanation, examples)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [q.question, q.level, q.type, q.industry, q.explanation, q.examples]
      );
    }

    console.log(`Successfully seeded ${questions.length} questions!`);
  } catch (err) {
    console.error('Failed to seed database:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
