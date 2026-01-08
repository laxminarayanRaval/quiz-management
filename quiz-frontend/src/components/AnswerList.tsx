import React from 'react';
import { Button, Input } from './ui/Components';
import { Plus, Trash2 } from 'lucide-react';

export interface Answer {
    content: string;
    is_correct: boolean;
}

interface AnswerListProps {
    answers: Answer[];
    questionType: 'single' | 'multiple' | 'true_false' | 'fill_blank';
    onUpdate: (answers: Answer[]) => void;
}

const AnswerList = ({ answers, questionType, onUpdate }: AnswerListProps) => {
    const handleAddAnswer = () => {
        onUpdate([...answers, { content: '', is_correct: false }]);
    };

    const handleRemoveAnswer = (index: number) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        onUpdate(newAnswers);
    };

    const handleContentChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index].content = value;
        onUpdate(newAnswers);
    };

    const handleCorrectChange = (index: number) => {
        const newAnswers = [...answers];
        if (questionType === 'single' || questionType === 'true_false') {
            // Reset others to false
            newAnswers.forEach((a, i) => {
                a.is_correct = i === index;
            });
        } else {
            // Toggle for multiple
            newAnswers[index].is_correct = !newAnswers[index].is_correct;
        }
        onUpdate(newAnswers);
    };

    if (questionType === 'fill_blank') {
        return (
            <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                <Input
                    placeholder="Enter the correct answer..."
                    value={answers[0]?.content || ''}
                    onChange={(e) => onUpdate([{ content: e.target.value, is_correct: true }])}
                />
            </div>
        );
    }

    if (questionType === 'true_false') {
        // Ensure we have 2 answers: True and False
        if (answers.length !== 2) {
            // Initialize if empty
            setTimeout(() => onUpdate([
                { content: 'True', is_correct: true },
                { content: 'False', is_correct: false }
            ]), 0);
            return null;
        }

        return (
            <div className="mt-2 flex gap-4">
                {answers.map((answer, index) => (
                    <label key={index} className={`flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer ${answer.is_correct ? 'bg-green-50 border-green-500' : 'bg-white'}`}>
                        <input
                            type="radio"
                            name={`tf-${Math.random()}`} // unique group
                            checked={answer.is_correct}
                            onChange={() => handleCorrectChange(index)}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={answer.is_correct ? 'font-bold text-green-700' : 'text-gray-700'}>{answer.content}</span>
                    </label>
                ))}
            </div>
        )
    }

    return (
        <div className="mt-2 space-y-2">
            {answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        type={questionType === 'single' ? 'radio' : 'checkbox'}
                        checked={answer.is_correct}
                        onChange={() => handleCorrectChange(index)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        title="Mark as correct"
                    />
                    <Input
                        className="flex-1"
                        placeholder={`Option ${index + 1}`}
                        value={answer.content}
                        onChange={(e) => handleContentChange(index, e.target.value)}
                    />
                    <button
                        onClick={() => handleRemoveAnswer(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <Button variant="outline" onClick={handleAddAnswer} className="mt-2 flex items-center gap-1 text-sm">
                <Plus size={16} /> Add Option
            </Button>
        </div>
    );
};

export default AnswerList;
