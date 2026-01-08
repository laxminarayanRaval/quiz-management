from pydantic import BaseModel, Field
from typing import List, Optional
from models import QuestionType

class AnswerBase(BaseModel):
    content: str
    is_correct: bool

class AnswerCreate(AnswerBase):
    pass

class AnswerResponse(AnswerBase):
    id: int
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    content: str
    question_type: QuestionType
    points: int = 1

class QuestionCreate(QuestionBase):
    answers: List[AnswerCreate]

class QuestionResponse(QuestionBase):
    id: int
    answers: List[AnswerResponse]

    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None

class QuizCreate(QuizBase):
    questions: List[QuestionCreate] = []

class QuizResponse(QuizBase):
    public_id: str = Field(serialization_alias="id")
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class PublicAnswerResponse(BaseModel):
    id: int
    content: str
    
    class Config:
        from_attributes = True

class PublicQuestionResponse(QuestionBase):
    id: int
    answers: List[PublicAnswerResponse]

    class Config:
        from_attributes = True

class PublicQuizResponse(QuizBase):
    public_id: str = Field(serialization_alias="id")
    questions: List[PublicQuestionResponse]

    class Config:
        from_attributes = True

class AnswerSubmission(BaseModel):
    question_id: int
    selected_answer_ids: List[int] = [] # For multiple choice
    text_answer: Optional[str] = None # For fill in blank (not implemented in valid yet but good to have)

class QuizSubmission(BaseModel):
    answers: List[AnswerSubmission]

class QuestionResult(BaseModel):
    question_id: int
    is_correct: bool
    user_answer: Optional[str] = None # For display (text or joined options)
    correct_answer: Optional[str] = None # For feedback

class SubmissionResult(BaseModel):
    score: int
    total_points: int
    correct_count: int
    total_questions: int
    details: List[QuestionResult] = []

class ResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[dict | List | object] = None
