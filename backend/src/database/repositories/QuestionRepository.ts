import { executeQuery } from '../connection';
import { InterviewQuestion, QuestionFilters } from '../models/InterviewQuestion';

export class QuestionRepository {
  async findAll(filters?: QuestionFilters): Promise<InterviewQuestion[]> {
    let query = 'SELECT * FROM interview_questions';
    const params: any[] = [];
    const conditions: string[] = [];

    if (filters?.level) {
      conditions.push(`level = $${params.length + 1}`);
      params.push(filters.level);
    }

    if (filters?.type) {
      conditions.push(`type = $${params.length + 1}`);
      params.push(filters.type);
    }

    if (filters?.industry) {
      conditions.push(`industry = $${params.length + 1}`);
      params.push(filters.industry);
    }

    if (filters?.search) {
      conditions.push(`(question_text ILIKE $${params.length + 1} OR explanation ILIKE $${params.length + 1})`);
      params.push(`%${filters.search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    return executeQuery<InterviewQuestion>(query, params);
  }

  async findById(id: number): Promise<InterviewQuestion | null> {
    const query = 'SELECT * FROM interview_questions WHERE id = $1';
    const result = await executeQuery<InterviewQuestion>(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  async create(question: Omit<InterviewQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<InterviewQuestion> {
    const query = `
      INSERT INTO interview_questions (question_text, level, type, industry, explanation, examples)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await executeQuery<InterviewQuestion>(query, [
      question.question_text,
      question.level,
      question.type,
      question.industry,
      question.explanation,
      JSON.stringify(question.examples),
    ]);
    return result[0];
  }

  async batchCreate(questions: Omit<InterviewQuestion, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    const query = `
      INSERT INTO interview_questions (question_text, level, type, industry, explanation, examples)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (const question of questions) {
      await executeQuery(query, [
        question.question_text,
        question.level,
        question.type,
        question.industry,
        question.explanation,
        JSON.stringify(question.examples),
      ]);
    }
  }

  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM interview_questions';
    const result = await executeQuery<{ count: string }>(query);
    return parseInt(result[0].count, 10);
  }

  async clear(): Promise<void> {
    const query = 'DELETE FROM interview_questions';
    await executeQuery(query);
  }
}

export const questionRepository = new QuestionRepository();
