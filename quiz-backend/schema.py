from pydantic import BaseModel
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
    id: int
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class ResponseModel(BaseModel):
    success: bool
    message: str
    data: Optional[dict | List | object] = None
