import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui/Components';
import QuestionItem, { Question } from '../components/QuestionItem';
import client from '../api/client';
import { Plus, Save } from 'lucide-react';

const CreateQuizPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { content: '', question_type: 'single', points: 1, answers: [{ content: '', is_correct: false }] }
    ]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            { content: '', question_type: 'single', points: 1, answers: [{ content: '', is_correct: false }] }
        ]);
    };

    const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        setQuestions(newQuestions);
    };

    const handleDeleteQuestion = (index: number) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const payload = {
                title,
                description,
                questions
            };
            const response = await client.post('/quizzes/', payload);
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Quiz created successfully!' });
                // Reset form
                setTitle('');
                setDescription('');
                setQuestions([{ content: '', question_type: 'single', points: 1, answers: [{ content: '', is_correct: false }] }]);
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to create quiz' });
            }
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Create a New Quiz</h1>
                    <p className="mt-2 text-gray-600">Design your quiz with multiple question types.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <Card className="space-y-4">
                    <Input
                        label="Quiz Title"
                        placeholder="Enter quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        label="Description (Optional)"
                        placeholder="Enter a brief description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Card>

                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <QuestionItem
                            key={index}
                            index={index}
                            question={q}
                            onUpdate={(uq) => handleUpdateQuestion(index, uq)}
                            onDelete={() => handleDeleteQuestion(index)}
                        />
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
                    <Button variant="outline" onClick={handleAddQuestion} className="flex items-center justify-center gap-2">
                        <Plus size={20} /> Add Question
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title}
                        className="flex items-center justify-center gap-2"
                    >
                        <Save size={20} /> {loading ? 'Saving...' : 'Save Quiz'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuizPage;
