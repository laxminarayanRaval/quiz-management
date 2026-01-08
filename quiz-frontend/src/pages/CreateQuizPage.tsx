import React, { useState } from 'react';
import { Button, Input, Card } from '../components/ui/Components';
import QuestionItem, { Question } from '../components/QuestionItem';
import client from '../api/client';
import { Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/ui/Loader';

const CreateQuizPage = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([
        { content: '', question_type: 'single', points: 1, answers: [{ content: '', is_correct: false }] }
    ]);
    const [loading, setLoading] = useState(false);

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
        try {
            const payload = {
                title,
                description,
                questions
            };
            const response = await client.post('/quizzes/', payload);
            if (response.data.success) {
                toast.success('Quiz created successfully!');
                // Reset form
                setTitle('');
                setDescription('');
                setQuestions([{ content: '', question_type: 'single', points: 1, answers: [{ content: '', is_correct: false }] }]);
            } else {
                toast.error(response.data.message || 'Failed to create quiz');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-white">Create a New Quiz</h1>
                    <p className="mt-2 text-gray-300">Design your quiz with multiple question types.</p>
                </div>



                <Card className="space-y-4 bg-white text-gray-900 shadow-xl">
                    <Input
                        label="Quiz Title"
                        placeholder="Enter quiz title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-gray-300 focus:border-soft-blue focus:ring-soft-blue"
                    />
                    <Input
                        label="Description (Optional)"
                        placeholder="Enter a brief description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="border-gray-300 focus:border-soft-blue focus:ring-soft-blue"
                    />
                </Card>

                <div className="space-y-6">
                    {questions.map((q, index) => (
                        <div key={index} className="rounded-xl overflow-hidden shadow-lg">
                            <QuestionItem
                                index={index}
                                question={q}
                                onUpdate={(uq) => handleUpdateQuestion(index, uq)}
                                onDelete={() => handleDeleteQuestion(index)}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between pt-4">
                    <Button
                        variant="outline"
                        onClick={handleAddQuestion}
                        className="flex items-center justify-center gap-2 border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white transition-colors"
                    >
                        <Plus size={20} /> Add Question
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !title}
                        className="flex items-center justify-center gap-2 bg-teal-soft hover:bg-teal-400 text-midnight font-bold border-none"
                    >
                        {loading ? <Loader size="sm" /> : <><Save size={20} /> Save Quiz</>}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateQuizPage;
