import React, { useState } from 'react';
import { Button, Input, Select, Card } from './ui/Components';
import AnswerList, { Answer } from './AnswerList';
import { Trash2 } from 'lucide-react';

export interface Question {
    content: string;
    question_type: 'single' | 'multiple' | 'true_false' | 'fill_blank';
    points: number;
    answers: Answer[];
}

interface QuestionItemProps {
    question: Question;
    index: number;
    onUpdate: (updatedQuestion: Question) => void;
    onDelete: () => void;
}

const QuestionItem = ({ question, index, onUpdate, onDelete }: QuestionItemProps) => {
    // Local state for answers to pass to AnswerList
    const handleValueChange = (field: keyof Question, value: any) => {
        onUpdate({ ...question, [field]: value });
    };

    const handleAnswersUpdate = (updatedAnswers: Answer[]) => {
        onUpdate({ ...question, answers: updatedAnswers });
    };

    const questionTypes = [
        { label: 'Single Choice', value: 'single' },
        { label: 'Multiple Choice', value: 'multiple' },
        { label: 'True/False', value: 'true_false' },
        { label: 'Fill in the Blank', value: 'fill_blank' },
    ];

    return (
        <Card className="relative">
            <div className="absolute top-4 right-4">
                <Button variant="danger" onClick={onDelete} className="p-2" aria-label="Delete Question">
                    <Trash2 size={16} />
                </Button>
            </div>

            <h3 className="text-lg font-semibold mb-4">Question {index + 1}</h3>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                        <Input
                            label="Question Text"
                            placeholder="e.g. What is the capital of France?"
                            value={question.content}
                            onChange={(e) => handleValueChange('content', e.target.value)}
                        />
                    </div>
                    <div>
                        <Input
                            label="Points"
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => handleValueChange('points', parseInt(e.target.value) || 1)}
                        />
                    </div>
                </div>

                <Select
                    label="Question Type"
                    options={questionTypes}
                    value={question.question_type}
                    onChange={(e) => handleValueChange('question_type', e.target.value)}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Answers</label>
                    <AnswerList
                        answers={question.answers}
                        questionType={question.question_type}
                        onUpdate={handleAnswersUpdate}
                    />
                </div>
            </div>
        </Card>
    );
};

export default QuestionItem;
