import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/questions';

// Example functions to interact with the questions API

async function getAllQuestions() {
  try {
    const response = await axios.get(API_BASE_URL);
    console.log('All questions:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

async function getQuestionsByFilter(filter: any) {
  try {
    const response = await axios.get(API_BASE_URL, { params: filter });
    console.log(`Questions with filter ${JSON.stringify(filter)}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered questions:', error);
    throw error;
  }
}

async function getRandomQuestions(count = 5, filter = {}) {
  try {
    const response = await axios.get(`${API_BASE_URL}/random`, {
      params: { count, ...filter }
    });
    console.log(`Random questions (${count}):`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching random questions:', error);
    throw error;
  }
}

async function createQuestion(questionData: any) {
  try {
    const response = await axios.post(API_BASE_URL, questionData);
    console.log('Created question:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

async function updateQuestion(id: number, updateData: any) {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updateData);
    console.log('Updated question:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

async function deleteQuestion(id: number) {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    console.log(`Deleted question with ID: ${id}`);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

// Example usage
async function exampleUsage() {
  try {
    // Get all questions
    await getAllQuestions();
    
    // Get questions by filter
    await getQuestionsByFilter({ level: 'easy', type: 'behavior' });
    
    // Get random questions
    await getRandomQuestions(3, { industry: 'software' });
    
    // Create a new question
    const newQuestion = {
      question: 'Describe a challenging project you worked on and how you overcame obstacles.',
      level: 'medium',
      type: 'behavior',
      industry: 'software',
      explanation: 'This question assesses problem-solving skills, resilience, and ability to work under pressure.',
      examples: [
        'I worked on a project with a tight deadline where we had to implement a new feature. I broke down the task into smaller components, prioritized the most critical parts, and communicated regularly with stakeholders to manage expectations.',
        'In a previous project, we faced unexpected technical challenges that threatened our timeline. I organized a brainstorming session with the team, we identified alternative approaches, and I took ownership of implementing the solution that saved the project.'
      ]
    };
    
    const createdQuestion = await createQuestion(newQuestion);
    
    // Update the question
    await updateQuestion(createdQuestion.id, { level: 'hard' });
    
    // Delete the question
    await deleteQuestion(createdQuestion.id);
  } catch (error) {
    console.error('Example usage failed:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}

export {
  getAllQuestions,
  getQuestionsByFilter,
  getRandomQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion
};