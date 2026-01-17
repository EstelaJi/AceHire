export interface Question {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

export const questions: Question[] = [
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
      'I believe user research should be ongoing, not just a one-time activity. I start with secondary research to understand the market and existing solutions. Then I conduct primary research through interviews with target users to uncover their needs, pain points, and behaviors. I use a mix of open-ended and structured questions to get both qualitative and quantitative data. After gathering insights, I identify key themes and prioritize them based on impact and feasibility. I translate research findings into concrete recommendations for the product team, using tools like user journey maps to make insights tangible. I also advocate for involving users throughout the development process - from testing prototypes to providing feedback on early releases. This iterative approach ensures we build products that truly meet user needs.'
    ]
  },
  {
    id: '12',
    question: 'Design a system to handle high-volume API requests with rate limiting.',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question evaluates your understanding of API design, scalability, and traffic management. Interviewers want to see your knowledge of load balancing, caching, rate limiting algorithms, and handling distributed systems.',
    examples: [
      'To handle high-volume API requests, I would start with a load balancer like NGINX to distribute traffic across multiple API servers. I would implement rate limiting using the Token Bucket or Leaky Bucket algorithm to prevent abuse and ensure fair usage. Redis would be ideal for tracking request counts across servers due to its high performance and support for atomic operations. I would use a CDN to cache static responses and reduce origin server load. API keys would identify clients and enforce different rate limits based on tiers. For scaling, I would design the system horizontally, adding more servers as needed. I would implement circuit breakers to prevent cascading failures. Monitoring would track request volume, latency, and error rates. The system would return appropriate HTTP status codes (429 for rate limiting exceeded) and include headers indicating remaining quota.',
      'A scalable API system would use multiple layers of protection. At the edge, a load balancer would distribute incoming requests. I would implement rate limiting at the API gateway level using a distributed cache like Redis to track requests per client. The rate limiting algorithm would be configurable per client, with different limits for different API endpoints. I would implement caching for frequently accessed data using Redis or Memcached. The API servers would be stateless to enable horizontal scaling. For very high traffic, I might use message queues like Kafka to decouple request processing. I would include authentication and authorization at the gateway level. The system would provide detailed analytics on API usage. I would also implement retries with exponential backoff for failed requests and ensure proper logging for debugging and security analysis.'
    ]
  },
  {
    id: '13',
    question: 'Tell me about a time when you had to lead a team through a challenging project.',
    level: 'hard',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question assesses your leadership skills, ability to handle pressure, and manage teams through difficult situations. Interviewers want to see your approach to motivating teams, solving problems, and delivering results under challenging circumstances.',
    examples: [
      'I led a team on a critical project with a tight deadline and complex technical requirements. Early on, we encountered unexpected technical issues that put the timeline at risk. I brought the team together to assess the situation, breaking down the problem into manageable parts. I reallocated resources based on individual strengths and established clear communication channels for daily updates. When team members became stressed, I provided support through one-on-one check-ins and adjusted workloads as needed. I also kept stakeholders informed about the challenges and our progress. By maintaining a positive attitude, focusing on solutions, and empowering team members to make decisions, we were able to overcome the obstacles and deliver the project on time. The success strengthened team morale and demonstrated the value of collaborative problem-solving.',
      'As project lead, I faced a situation where our team was behind schedule due to scope creep and technical difficulties. Instead of panicking, I called a team meeting to re-evaluate our approach. We prioritized the most critical features and identified tasks that could be simplified or deferred. I encouraged team members to share their ideas, and together we found ways to streamline our processes. I also negotiated with stakeholders to reduce the scope of less critical features. To boost morale, I celebrated small wins and recognized individual contributions. I implemented more frequent check-ins to stay on top of progress. By fostering a culture of transparency and collaboration, we were able to regain momentum and deliver a high-quality product that met the core requirements. The experience taught me the importance of adaptability and trusting your team\'s expertise.'
    ]
  },
  {
    id: '14',
    question: 'Explain the concept of containerization and how Docker works.',
    level: 'medium',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your understanding of modern software deployment techniques. Interviewers want to see your knowledge of containerization, virtualization differences, Docker components, and container orchestration.',
    examples: [
      'Containerization is a lightweight virtualization method that packages an application and its dependencies into a standardized unit called a container. Unlike VMs which virtualize hardware, containers virtualize the operating system, sharing the host OS kernel. Docker is a platform that uses OS-level virtualization to deliver software in containers. Key components include Docker Engine (runs containers), Docker Images (read-only templates), Dockerfile (instructions to build images), and Docker Hub (registry for sharing images). Containers provide consistency across environments, isolate applications, and enable rapid deployment. They\'re more efficient than VMs as they share system resources. Docker uses cgroups for resource allocation and namespaces for process isolation. Container orchestration tools like Kubernetes manage containerized applications at scale.',
      'Docker enables containerization by packaging software with all dependencies into containers. A Dockerfile specifies the base image, environment variables, commands, and files needed. Running docker build creates an image from the Dockerfile. Images are immutable and can be versioned. Docker containers are runtime instances of images, isolated but sharing the host OS. This ensures "works on my machine" becomes "works anywhere". Containers start quickly (seconds) compared to VMs (minutes). Docker provides tools for networking containers, managing storage volumes, and scaling. Portability is a key benefit - containers run consistently across development, staging, and production environments. Container orchestrators like Kubernetes handle deployment, scaling, and management of containers across clusters of machines.'
    ]
  },
  {
    id: '15',
    question: 'How would you improve the user onboarding experience for a mobile app?',
    level: 'medium',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your understanding of user experience design and product strategy. Interviewers want to see how you analyze user journeys, identify pain points, and create solutions that drive user engagement and retention.',
    examples: [
      'To improve onboarding, I would start by analyzing the current user flow and identifying drop-off points through analytics and user interviews. I would focus on making the process as simple as possible - reducing the number of steps, eliminating unnecessary form fields, and using progressive disclosure. I would incorporate interactive tutorials that teach users key features through hands-on experience rather than just reading instructions. I would provide clear value proposition early on to show users why the app matters to them. I would offer social proof through testimonials or success stories. I would implement a help system that provides context-sensitive guidance. I would also personalize the onboarding experience based on user goals. After implementation, I would A/B test different approaches and iterate based on user feedback and retention metrics.',
      'My approach would prioritize simplicity and value. I would minimize mandatory steps, allowing users to skip non-essential setup and complete it later. I would use a combination of tooltips, modals, and micro-interactions to guide users without overwhelming them. I would include a quick tour of key features with the option to skip for power users. I would emphasize the app\'s core value proposition upfront. I would offer a demo mode so users can explore features without creating an account. I would use clear, concise language and avoid jargon. I would implement a progress indicator to show users how far they are in the process. I would provide immediate feedback and celebrate small wins. Post-onboarding, I would send personalized welcome messages and tips to help users get the most out of the app. I would continuously measure onboarding success through metrics like time-to-value, completion rate, and day-7 retention.'
    ]
  },
  {
    id: '16',
    question: 'Describe a time when you had to resolve a conflict between team members.',
    level: 'medium',
    type: 'behavior',
    industry: 'general',
    explanation: 'This question evaluates your conflict resolution skills and ability to maintain team harmony. Interviewers want to see how you handle disagreements, facilitate communication, and find solutions that benefit everyone involved.',
    examples: [
      'I once had two team members with conflicting approaches to a project deadline. One wanted to prioritize speed to meet the date, while the other insisted on thorough testing to ensure quality. Instead of picking a side, I met with each individually to understand their perspectives. I learned the deadline was rigid due to external commitments, but quality concerns were valid as previous rushed work had caused issues. I facilitated a discussion where they could hear each other\'s concerns. Together, we developed a hybrid approach: focus on critical path items first with basic testing, then conduct comprehensive testing on less time-sensitive components after the initial deadline. This compromise addressed both concerns and maintained team morale. The project was delivered on time with acceptable quality, and the team learned to appreciate different working styles.',
      'Two senior developers were in conflict over architectural decisions for our main feature. Each had strong technical opinions and was dismissive of the other\'s ideas. I recognized this was slowing progress and affecting team dynamics. I scheduled a structured meeting with clear ground rules for respectful discussion. I asked each to present their approach and explain the benefits and trade-offs. I then facilitated a discussion to find common ground. We identified that both approaches had merit in different contexts. We agreed to use one approach for the core functionality and the other for secondary features. By focusing on the technical merits rather than personalities, we were able to resolve the conflict. I followed up with both individually to ensure they felt heard and valued. The resolution strengthened the team\'s ability to handle technical disagreements constructively.'
    ]
  },
  {
    id: '17',
    question: 'What is the difference between synchronous and asynchronous programming?',
    level: 'easy',
    type: 'technical',
    industry: 'software',
    explanation: 'This question tests your understanding of programming paradigms and concurrency models. Interviewers want to see your knowledge of execution models, blocking vs non-blocking operations, and when to use each approach.',
    examples: [
      'Synchronous programming executes tasks sequentially - each operation must complete before the next starts. It\'s straightforward but can waste resources waiting for I/O operations. Asynchronous programming allows multiple tasks to execute independently, without waiting for previous tasks to complete. This is especially useful for I/O-bound operations (network requests, file reading). In async code, when an operation starts, the program can do other work while waiting. Callbacks, promises, and async/await are common patterns. Synchronous code is easier to debug and reason about, while async code can handle more concurrent operations efficiently. The choice depends on the use case: synchronous for simple workflows, asynchronous for performance-critical or I/O-heavy applications.',
      'In synchronous execution, code runs line by line, blocking on long-running operations. This is simple but inefficient for tasks like waiting for database queries or API responses. Asynchronous code uses callbacks, promises, or event loops to handle operations without blocking. When an async operation starts, control returns immediately, allowing other code to execute. When the operation completes, a callback is invoked or a promise resolves. This approach improves responsiveness and resource utilization. Web browsers use async for AJAX requests, and Node.js heavily relies on async for handling many concurrent connections. Async code can be more complex to write and debug, especially with callback hell, but modern syntax like async/await simplifies it. Understanding the difference is crucial for building performant applications.'
    ]
  },
  {
    id: '18',
    question: 'How do you measure the success of a product feature?',
    level: 'easy',
    type: 'product',
    industry: 'product',
    explanation: 'This question assesses your understanding of product analytics and metrics. Interviewers want to see how you define success, track relevant metrics, and use data to evaluate feature performance and inform decisions.',
    examples: [
      'I start by defining clear success metrics before launching a feature, aligned with business goals and user needs. For engagement features, I track daily/weekly active users, time spent, and retention. For monetization features, I measure revenue, conversion rates, and average order value. I also track adoption rate - what percentage of users try the feature. Qualitative feedback from user interviews and surveys provides context for the numbers. I compare performance against baseline metrics and goals. A/B testing helps validate if the feature is better than alternatives. I also monitor for negative impacts on other metrics. Success isn\'t just about usage - it\'s about whether the feature solves the intended problem. I regularly review metrics and iterate on the feature based on what we learn.',
      'Feature success depends on both quantitative and qualitative measures. Quantitative metrics include adoption rate, frequency of use, retention, and impact on key business metrics like conversion or revenue. I use funnels to see where users drop off in the feature flow. Qualitative data comes from user feedback, support tickets, and usability studies - does the feature make users\' lives better? I also consider business impact - does it move the needle on strategic goals? I establish benchmarks before launch and set clear KPIs. Post-launch, I analyze how the feature affects user behavior and business outcomes. If a feature has high usage but negative feedback, it might need redesign. If it has low usage but strong positive feedback from power users, it might need better discovery. The goal is to understand both what\'s happening and why, then use that insight to improve the feature or inform future decisions.'
    ]
  },
  {
    id: '19',
    question: 'Design a distributed caching system to improve application performance.',
    level: 'hard',
    type: 'system design',
    industry: 'software',
    explanation: 'This question evaluates your understanding of caching strategies, distributed systems, and performance optimization. Interviewers want to see your knowledge of cache eviction policies, consistency models, and handling cache failures.',
    examples: [
      'A distributed caching system would use a cluster of cache servers to store frequently accessed data. I would use a consistent hashing algorithm to distribute keys across servers, minimizing rehashing when servers are added or removed. The cache would support read-through and write-through/write-behind patterns for data consistency. I would implement LRU (Least Recently Used) or LFU (Least Frequently Used) eviction policies to manage memory. For high availability, I would use replication - each key would have multiple replicas across different servers. I would include circuit breakers to prevent cache stampedes and implement request coalescing to handle concurrent cache misses efficiently. I would monitor cache hit ratio and adjust cache size and TTLs (time-to-live) based on access patterns. The cache would be integrated with the application through a client library that handles connection management and failover. Redis or Memcached could serve as the cache backend.',
      'To design a distributed cache, I would start by defining key requirements: scalability, high availability, low latency, and data consistency. The system would use a cluster of nodes with data distribution based on consistent hashing. I would implement tiered caching: local cache on application servers for very hot data, and distributed cache for shared data. For cache invalidation, I would use TTLs and explicit invalidation when data changes. I would include support for cache warming to populate cache with critical data on startup. I would handle cache failures with fallback to the database and automatic recovery. I would use compression to reduce memory usage and network traffic. The system would include monitoring for hit ratio, latency, and throughput. I would also consider security aspects like encryption and access control. For very large datasets, I might use a hybrid approach with in-memory cache for hot data and disk-based storage for less frequently accessed data.'
    ]
  },
  {
    id: '20',
    question: 'Tell me about a time when you had to learn a new technology quickly to complete a project.',
    level: 'medium',
    type: 'behavior',
    industry: 'software',
    explanation: 'This question assesses your learning agility, adaptability, and ability to apply new skills under pressure. Interviewers want to see your approach to learning new technologies quickly and effectively.',
    examples: [
      'In my previous role, our team needed to adopt React for a new project, but I had only worked with Vue.js before. With a tight deadline, I created a structured learning plan: I completed an intensive React course over a weekend, built small prototype components, and studied our existing codebase patterns. I paired with team members who had React experience to learn best practices. I prioritized learning the concepts most relevant to our project - hooks, state management, and component lifecycle. Within a week, I was contributing meaningful code. By focusing on practical application rather than theoretical knowledge, I was able to quickly become productive. The project was delivered successfully, and I continued to deepen my React knowledge through ongoing practice and learning.',
      'I faced a situation where our team needed to implement machine learning features using TensorFlow, but none of us had ML experience. I took the initiative to lead the learning effort. I started with introductory courses on ML concepts and TensorFlow fundamentals. I built small proof-of-concept models to understand the workflow. I joined online communities and forums to learn from experts. I created documentation and shared my learnings with the team through internal workshops. We started with simple models and gradually increased complexity. Within a month, we had a working prototype. The key was breaking down the learning into manageable chunks, focusing on practical implementation, and collaborating with the team. We delivered the feature on time, and the experience taught me that with the right approach, even complex technologies can be learned quickly.'
    ]
  }
];