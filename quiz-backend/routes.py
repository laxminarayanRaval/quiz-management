from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import crud, schema, db, utils

router = APIRouter()

@router.post("/quizzes/", response_model=schema.ResponseModel)
async def create_quiz(quiz: schema.QuizCreate, database: AsyncSession = Depends(db.get_db)):
    created_quiz = await crud.create_quiz(database, quiz)
    quiz_data = schema.QuizResponse.model_validate(created_quiz)
    return utils.success_response(data=quiz_data, message="Quiz created successfully")

@router.get("/quizzes/", response_model=schema.ResponseModel)
async def read_quizzes(skip: int = 0, limit: int = 100, database: AsyncSession = Depends(db.get_db)):
    quizzes = await crud.get_quizzes(database, skip=skip, limit=limit)
    quizzes_data = [schema.QuizResponse.model_validate(quiz) for quiz in quizzes]
    return utils.success_response(data=quizzes_data, message="Quizzes retrieved successfully")

@router.get("/quizzes/{quiz_id}", response_model=schema.ResponseModel)
async def read_quiz(quiz_id: str, database: AsyncSession = Depends(db.get_db)):
    db_quiz = await crud.get_quiz_by_public_id(database, public_id=quiz_id)
    if db_quiz is None:
        return utils.error_response(message="Quiz not found")
    quiz_data = schema.QuizResponse.model_validate(db_quiz)
    return utils.success_response(data=quiz_data, message="Quiz retrieved successfully")

@router.post("/quizzes/{quiz_id}/questions/", response_model=schema.ResponseModel)
async def create_question_for_quiz(quiz_id: str, question: schema.QuestionCreate, database: AsyncSession = Depends(db.get_db)):
    # Check if quiz exists
    db_quiz = await crud.get_quiz_by_public_id(database, public_id=quiz_id)
    if db_quiz is None:
        return utils.error_response(message="Quiz not found")
    created_question = await crud.add_question(database, quiz_public_id=quiz_id, question=question)
    question_data = schema.QuestionResponse.model_validate(created_question)
    return utils.success_response(data=question_data, message="Question added successfully")

@router.get("/public/quizzes/{quiz_id}", response_model=schema.ResponseModel)
async def read_public_quiz(quiz_id: str, database: AsyncSession = Depends(db.get_db)):
    db_quiz = await crud.get_quiz_by_public_id(database, public_id=quiz_id)
    if db_quiz is None:
        return utils.error_response(message="Quiz not found")
    
    # We rely on Pydantic's response_model to filter out sensitive fields if we used a specific response model.
    # However, since we wrap in ResponseModel which has data: object, we need to explicitly convert.
    # But wait, utils.success_response is generic.
    # Let's manually convert to PublicQuizResponse to ensure filtering happens.
    
    public_quiz = schema.PublicQuizResponse.model_validate(db_quiz)
    return utils.success_response(data=public_quiz, message="Quiz retrieved successfully")

@router.post("/public/quizzes/{quiz_id}/submit", response_model=schema.ResponseModel)
async def submit_quiz(quiz_id: str, submission: schema.QuizSubmission, database: AsyncSession = Depends(db.get_db)):
    result = await crud.calculate_score(database, quiz_id, submission)
    if result is None:
        return utils.error_response(message="Quiz not found")
    
    return utils.success_response(data=result, message="Quiz submitted successfully")
