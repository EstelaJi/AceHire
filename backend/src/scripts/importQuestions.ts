import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool({ connectionString: config.postgresUrl });

const questions = [
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
      'My prioritization approach begins with clear goal alignment. I work with stakeholders to define what success looks like for each product cycle. I then use the MoSCoW method as a first pass to categorize features: Must-have, Should-have, Could-have, and Won’t-have. For more detailed prioritization, I use value vs. effort matrices to identify quick wins and strategic bets. User feedback through surveys, interviews, and support tickets informs which features will have the most impact. I also consider technical debt and infrastructure needs alongside new features. I maintain transparency by sharing the prioritization criteria with the team and stakeholders, and I’m prepared to adjust as we learn from user testing and market changes.'
    ]
  },
  {
    id: '6',
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
    id: '7',
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
    id: '8',
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
    id: '9',
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
    id: '10',
    question: 'What are the key principles of object-oriented programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your fundamental understanding of OOP concepts. Interviewers want to see your grasp of encapsulation, inheritance, polymorphism, and abstraction - the four pillars of object-oriented programming.',
    examples: [
      'The four key principles of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Encapsulation is the bundling of data (attributes) and methods that operate on the data into a single unit (class), restricting access to some components. Inheritance allows a class to inherit properties and methods from another class, promoting code reuse. Polymorphism means the same operation can behave differently for different types - method overloading and overriding are examples. Abstraction focuses on hiding complex implementation details and showing only the essential features of an object, often achieved through interfaces or abstract classes. Together, these principles help create modular, reusable, and maintainable code.',
      'Object-oriented programming is built on core principles that enhance code organization and reusability. Encapsulation keeps data safe by restricting direct access, using getters and setters instead. Inheritance creates a hierarchy where child classes inherit from parent classes, reducing redundancy. Polymorphism allows methods to have the same name but different implementations - for example, a Shape class with a draw() method that works differently for Circle and Square subclasses. Abstraction simplifies complex systems by providing clear interfaces without revealing internal workings. These principles make code more flexible, easier to debug, and better suited for large-scale applications.'
    ]
  },
  {
    id: '11',
    question: 'How do you approach user research to inform product decisions?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your understanding of user-centered design and research methodologies. Interviewers want to see how you gather, analyze, and apply user insights to drive product strategy.',
    examples: [
      'My user research approach starts with defining clear objectives - what questions do we need to answer? I then choose appropriate methods based on those goals: interviews for in-depth insights, surveys for broader quantitative data, usability tests to observe interactions, and contextual inquiries to see users in their natural environment. I recruit diverse participants to ensure representative feedback. During research, I take detailed notes and look for patterns and themes. After collecting data, I synthesize findings into actionable insights, often creating personas, journey maps, or affinity diagrams. I then work with stakeholders to prioritize what to address, ensuring research directly influences roadmap decisions. I also iterate on research methods based on what we learn, and maintain feedback loops to validate solutions with users.',
      'I approach user research by first understanding the problem space and what decisions need to be made. I select appropriate methods based on the stage of product development and the questions we need to answer. Early on, I might conduct discovery interviews and contextual inquiries to understand user needs. For validating solutions, I use usability testing and A/B testing. Surveys help gather quantitative data at scale. I analyze the data to identify patterns and insights, then create artifacts like personas, journey maps, and opportunity statements. I share findings with the team and stakeholders to ensure alignment. Importantly, I treat research as iterative - as we learn, we refine our understanding and may need to conduct follow-up research. The goal is to make data-informed decisions while staying user-centered throughout the product development process.'
    ]
  },
  {
    id: '12',
    question: 'How would you design a URL shortening service like bit.ly?',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question tests your ability to design a simple yet scalable system. Interviewers want to see your understanding of URL generation, database design, caching, and handling high traffic.',
    examples: [
      'For a URL shortening service, I would use a distributed unique ID generator like Snowflake to create short codes. The database would store the mapping between short codes and original URLs. I would use a distributed cache like Redis for frequently accessed URLs to reduce database load. For scalability, I would implement sharding based on the short code. The system would need to handle redirects efficiently, using CDN for edge caching. I would also implement analytics to track click counts and user behavior. Security measures would include rate limiting and validation to prevent abuse.',
      'A URL shortening service needs to generate unique, short codes for long URLs. I would use base62 encoding of a unique ID to create the short URL. The system would have a write-heavy workload, so I would use a database optimized for writes like Cassandra or DynamoDB. For reads, I would implement multiple layers of caching - in-memory cache for hot URLs and CDN for global distribution. The API would be simple: POST to create short URLs, GET to redirect. I would implement rate limiting to prevent abuse and analytics to track usage. The system would be designed for high availability with multiple data centers and failover mechanisms.'
    ]
  },
  {
    id: '13',
    question: 'What is the difference between monolithic and microservices architecture?',
    level: 'easy',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your understanding of architectural patterns. Interviewers want to see your knowledge of trade-offs between different approaches and when to use each.',
    examples: [
      'Monolithic architecture is a single, unified application where all components are interconnected and deployed together. It\'s simpler to develop, test, and deploy initially, but can become difficult to maintain as the application grows. Microservices architecture breaks the application into small, independent services that communicate via APIs. Each service has its own database and can be deployed independently. This allows for better scalability, fault isolation, and team autonomy, but adds complexity in terms of service communication, data consistency, and deployment orchestration.',
      'Monolithic applications have all functionality in one codebase and database. They\'re easier to start with because you don\'t need to worry about distributed systems challenges. However, as they grow, they can become difficult to scale and maintain. Microservices split the application into small, focused services. Each service owns its data and can be developed and deployed independently. This allows teams to work in parallel and scale individual components as needed. However, microservices introduce complexity in terms of service discovery, communication, monitoring, and data consistency. The choice depends on factors like team size, application complexity, and scalability requirements.'
    ]
  },
  {
    id: '14',
    question: 'Tell me about a time you had to deal with a tight deadline.',
    level: 'easy',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question assesses your time management, prioritization, and ability to work under pressure. Interviewers want to see how you handle stress and deliver results when time is limited.',
    examples: [
      'In my previous role, we had a critical feature that needed to be delivered in half the usual time due to a client deadline. I immediately assessed the requirements and identified the core functionality that was absolutely necessary. I worked with the team to create a minimal viable version, cutting nice-to-have features. We implemented a daily standup to track progress and quickly address blockers. I also communicated with stakeholders about what we could realistically deliver. We successfully met the deadline with the core features, and the client was satisfied. After the deadline, we iterated to add the additional features.',
      'I once had to complete a major report in just two days when the original timeline was a week. I started by breaking down the task into smaller, manageable chunks and prioritizing the most critical sections. I worked efficiently, focusing on one section at a time rather than multitasking. When I encountered a blocker, I immediately reached out to colleagues for help rather than getting stuck. I also took short breaks to maintain focus. I completed the report on time with all required information, and my manager praised the quality of the work despite the tight timeline.'
    ]
  },
  {
    id: '15',
    question: 'How do you handle technical debt?',
    level: 'medium',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your understanding of software maintenance and your ability to balance short-term delivery with long-term code quality.',
    examples: [
      'I treat technical debt as a necessary trade-off that needs to be managed strategically. When taking on technical debt to meet a deadline, I document it and create a plan to address it later. I allocate a percentage of each sprint specifically for paying down technical debt. I prioritize debt based on its impact on development velocity and system stability. I also advocate for addressing technical debt proactively before it becomes a crisis. Communication is key - I make sure stakeholders understand the trade-offs and the cost of not addressing technical debt.',
      'Technical debt is like financial debt - sometimes you take it on to move faster, but you need to pay it back with interest. I approach it by first identifying and cataloging technical debt using tools like code quality metrics and team feedback. I then prioritize based on factors like how much it slows down development, risk of bugs, and maintenance burden. I advocate for regular "debt repayment" sprints where we focus exclusively on refactoring and improvements. I also try to prevent new technical debt by encouraging good practices like code reviews, testing, and documentation. The goal is to find the right balance between shipping features and maintaining code quality.'
    ]
  },
  {
    id: '16',
    question: 'How would you design a recommendation system for an e-commerce platform?',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question evaluates your understanding of machine learning systems and scalability. Interviewers want to see your knowledge of recommendation algorithms, data pipelines, and real-time processing.',
    examples: [
      'For an e-commerce recommendation system, I would implement a multi-stage approach. First, collaborative filtering for user-based and item-based recommendations using user interaction data. Second, content-based filtering using product attributes and user preferences. I would use a hybrid approach combining both methods for better results. The system would have offline batch processing for generating recommendations and real-time serving for personalized results. I would use a message queue to process user events and update recommendations asynchronously. The data pipeline would include feature extraction, model training, and serving infrastructure. Caching would be crucial for performance.',
      'A recommendation system for e-commerce would start with collecting user interaction data: views, purchases, clicks, and searches. I would implement multiple recommendation strategies: collaborative filtering using matrix factorization, content-based filtering using product features, and popularity-based recommendations for cold start. The system would have an offline component that trains models and generates recommendations, and an online component that serves personalized results in real-time. I would use a feature store to manage user and item features. The serving layer would use caching and potentially a vector database for similarity search. The system would be designed to handle millions of users and products with low latency.'
    ]
  },
  {
    id: '17',
    question: 'Describe a situation where you had to learn a new technology quickly.',
    level: 'easy',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question assesses your learning agility and adaptability. Interviewers want to see how you approach learning new skills and apply them effectively.',
    examples: [
      'In a previous project, we needed to implement real-time features using WebSockets, which I had never used before. I started by reading the documentation and understanding the core concepts. I then built a small prototype to test my understanding. I also reached out to colleagues who had experience with WebSockets for guidance. Within a week, I was able to implement the required features. I documented what I learned and shared it with the team, which helped others get up to speed as well. The experience taught me that breaking down complex topics and hands-on practice are effective learning strategies.',
      'I once had to learn React for a new project when my background was in vanilla JavaScript. I started with the official documentation and built a simple todo app to understand the basics. I then watched tutorials and read articles to learn best practices. I joined online communities to ask questions and learn from others. Within two weeks, I was comfortable enough to start building the actual project. I continued learning as I built, referring to documentation when needed. The project was successful, and I became proficient in React, which has been valuable in my career since.'
    ]
  },
  {
    id: '18',
    question: 'What is the difference between synchronous and asynchronous programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your understanding of programming paradigms. Interviewers want to see your knowledge of execution models and when to use each approach.',
    examples: [
      'Synchronous programming executes code sequentially, with each operation blocking until it completes. This is straightforward and easy to reason about, but can lead to performance issues when operations take time, like network requests or file I/O. Asynchronous programming allows operations to run in the background without blocking, using callbacks, promises, or async/await. This enables better resource utilization and responsiveness, especially for I/O-bound operations. However, it adds complexity in terms of error handling and code flow.',
      'In synchronous programming, code runs line by line, and each statement must complete before the next one starts. This is simple and predictable but can be inefficient when waiting for slow operations. Asynchronous programming allows the program to continue executing while waiting for operations to complete. For example, in JavaScript, you can make an API call without blocking the main thread. When the response arrives, a callback or promise resolves with the result. This makes applications more responsive and efficient, especially for web applications that handle many concurrent requests. The trade-off is that asynchronous code can be harder to debug and reason about due to its non-linear execution flow.'
    ]
  },
  {
    id: '19',
    question: 'How do you measure the success of a product feature?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your understanding of product metrics and analytics. Interviewers want to see how you define and track success metrics.',
    examples: [
      'I measure feature success using a combination of quantitative and qualitative metrics. Quantitative metrics include adoption rate (percentage of users using the feature), retention (users who continue to use it over time), engagement (frequency and depth of usage), and impact on key business metrics like conversion or revenue. I also look at technical metrics like performance and error rates. Qualitatively, I gather user feedback through surveys, interviews, and support tickets. I define success criteria before launch and track progress against them. Importantly, I consider the feature\'s impact on the overall product goals, not just its standalone metrics.',
      'To measure feature success, I start by defining clear objectives and key results (OKRs) for the feature. I then identify metrics that align with those objectives: adoption (how many users try it), activation (how many users find value), retention (how many keep using it), and referral (how many recommend it). I use analytics tools to track these metrics over time. I also conduct A/B tests to compare against alternatives. User feedback through surveys and interviews provides context to the numbers. I look at both leading indicators (early adoption) and lagging indicators (long-term impact). The goal is to understand not just if the feature is used, but if it\'s delivering value to users and the business.'
    ]
  },
  {
    id: '20',
    question: 'How would you handle a situation where a stakeholder disagrees with your product decision?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your communication skills and ability to navigate conflicting opinions. Interviewers want to see how you handle disagreement and build consensus.',
    examples: [
      'When a stakeholder disagrees with a product decision, I first seek to understand their perspective by asking questions and listening actively. I then share the data and reasoning behind my decision, being transparent about trade-offs. If there\'s still disagreement, I propose running a small experiment or A/B test to gather more data. I also consider if there\'s a compromise solution that addresses both perspectives. Throughout the process, I maintain respect and focus on shared goals. The key is to move from "my decision vs. your decision" to "what\'s the best decision for the product and users?"',
      'I approach stakeholder disagreement by first ensuring I fully understand their concerns and motivations. I then explain the data and user research that informed my decision, acknowledging any uncertainties. If the disagreement persists, I suggest gathering more information through user testing or market research. I\'m also open to revisiting the decision if new information emerges. Importantly, I try to find common ground - often disagreements stem from different priorities rather than fundamentally different views. By focusing on shared goals and being willing to iterate, I can usually find a path forward that satisfies key stakeholders while staying true to product principles.'
    ]
  }
];

async function importQuestions() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const q of questions) {
      await client.query(
        `INSERT INTO questions (id, question, level, type, industry, explanation, examples)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           question = EXCLUDED.question,
           level = EXCLUDED.level,
           type = EXCLUDED.type,
           industry = EXCLUDED.industry,
           explanation = EXCLUDED.explanation,
           examples = EXCLUDED.examples,
           updated_at = CURRENT_TIMESTAMP`,
        [q.id, q.question, q.level, q.type, q.industry, q.explanation, JSON.stringify(q.examples)]
      );
      console.log(`Imported question ${q.id}`);
    }

    await client.query('COMMIT');
    console.log('All questions imported successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error importing questions:', err);
    throw err;
  } finally {
    client.release();
  }
}

importQuestions()
  .then(() => {
    console.log('Import completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });
