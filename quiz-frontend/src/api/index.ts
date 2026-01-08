import client from './client';

export const createQuiz = async (quizData: any) => {
    const response = await client.post('/quizzes/', quizData);
    return response.data;
};

export const getPublicQuiz = async (quizId: string) => {
    const response = await client.get(`/public/quizzes/${quizId}`);
    return response.data;
};

export const submitQuiz = async (quizId: string, submission: any) => {
    const response = await client.post(`/public/quizzes/${quizId}/submit`, submission);
    return response.data;
};
