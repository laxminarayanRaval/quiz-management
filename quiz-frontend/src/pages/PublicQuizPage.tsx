
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicQuiz, submitQuiz } from '../api';
import { Input } from '../components/ui/Components';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/ui/Loader';

interface Answer {
    id: number;
    content: string;
}

interface Question {
    id: number;
    content: string;
    question_type: string;
    points: number;
    answers: Answer[];
}

interface Quiz {
    id: string; // Updated to string (UUID)
    title: string;
    description: string;
    questions: Question[];
}

const PublicQuizPage = () => {
    const { id } = useParams<{ id: string }>();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<Record<number, number[]>>({});
    const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
    const [result, setResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await getPublicQuiz(id || '');
                if (response.success) {
                    setQuiz(response.data);
                } else {
                    setError('Failed to load quiz');
                }
            } catch (err) {
                setError('Error fetching quiz');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchQuiz();
        }
    }, [id]);

    const handleTextChange = (questionId: number, value: string) => {
        setTextAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleOptionSelect = (questionId: number, answerId: number, type: string) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            if (type === 'single' || type === 'true_false') {
                return { ...prev, [questionId]: [answerId] };
            } else {
                // Toggle for multiple
                if (current.includes(answerId)) {
                    return { ...prev, [questionId]: current.filter(id => id !== answerId) };
                } else {
                    return { ...prev, [questionId]: [...current, answerId] };
                }
            }
        });
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        const submission = {
            answers: quiz.questions.map(q => {
                if (q.question_type === 'fill_blank') {
                    return {
                        question_id: q.id,
                        text_answer: textAnswers[q.id] || ''
                    };
                } else {
                    return {
                        question_id: q.id,
                        selected_answer_ids: answers[q.id] || []
                    };
                }
            })
        };

        setSubmitting(true);
        try {
            const response = await submitQuiz(quiz.id, submission);
            if (response.success) {
                setResult(response.data);
                toast.success('Quiz submitted successfully!');
            } else {
                toast.error('Submission failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader size="lg" className="text-white" /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!quiz) return <div className="p-8 text-center">Quiz not found</div>;

    if (result) {
        return (
            <div className="max-w-3xl mx-auto p-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-900 mb-8">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h1>
                        <p className="text-gray-500">Here is how you performed</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Score</div>
                            <div className="text-2xl font-bold text-indigo-600">{result.score} / {result.total_points}</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-sm text-gray-500 mb-1">Correct Answers</div>
                            <div className="text-2xl font-bold text-green-600">{result.correct_count} / {result.total_questions}</div>
                        </div>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-soft-blue text-white rounded-lg hover:bg-sky-500 transition-colors font-semibold"
                    >
                        Retake Quiz
                    </button>
                </div>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Detailed Results</h2>
                    {quiz.questions.map((q) => {
                        const qResult = result.details?.find((d: any) => d.question_id === q.id);
                        const isCorrect = qResult?.is_correct;

                        return (
                            <div key={q.id} className={`rounded-xl shadow-lg border p-6 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        <span className="mr-2">{q.content}</span>
                                        {isCorrect ? <CheckCircle2 className="inline text-green-600 w-5 h-5" /> : <XCircle className="inline text-red-600 w-5 h-5" />}
                                    </h3>
                                    <span className="text-xs font-medium bg-white/50 text-gray-600 px-2 py-1 rounded">
                                        {q.points} points
                                    </span>
                                </div>
                                <div className="mt-2 text-gray-800">
                                    <p><span className="font-semibold">Your Answer:</span> {qResult?.user_answer || 'No Answer'}</p>
                                    {!isCorrect && (
                                        <p className="mt-1 text-green-700"><span className="font-semibold">Correct Answer:</span> {qResult?.correct_answer}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 text-white">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
                <p className="text-gray-300">{quiz.description}</p>
            </header>

            <div className="space-y-6 text-gray-900">
                {quiz.questions.map((q, qIndex) => (
                    <div key={q.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                <span className="text-gray-400 mr-2">{qIndex + 1}.</span>
                                {q.content}
                            </h3>
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {q.points} points
                            </span>
                        </div>

                        <div className="space-y-3">
                            {q.question_type === 'fill_blank' ? (
                                <Input
                                    placeholder="Type your answer here..."
                                    value={textAnswers[q.id] || ''}
                                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    className="border-gray-300 focus:border-soft-blue focus:ring-soft-blue text-gray-900"
                                />
                            ) : (
                                q.answers.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => handleOptionSelect(q.id, a.id, q.question_type)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${answers[q.id]?.includes(a.id)
                                            ? 'border-soft-blue bg-sky-50 text-sky-700'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${answers[q.id]?.includes(a.id)
                                                ? 'bg-soft-blue border-soft-blue'
                                                : 'border-gray-300'
                                                }`}>
                                                {answers[q.id]?.includes(a.id) && (
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            {a.content}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-8 py-3 bg-teal-soft text-midnight font-bold rounded-xl hover:bg-teal-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                    {submitting ? <Loader size="sm" /> : 'Submit Quiz'}
                </button>
            </div>
        </div>
    );
};

export default PublicQuizPage;
