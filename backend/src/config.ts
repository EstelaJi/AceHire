import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  postgresUrl: string;
  redisUrl: string;
  aiServiceUrl: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT) || 4000,
  postgresUrl: process.env.POSTGRES_URL || 'postgres://postgres:postgres@localhost:5432/interview_app',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000'
};

