from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import crud, schema, db, utils

router = APIRouter()

@router.post("/quizzes/", response_model=schema.ResponseModel)
async def create_quiz(quiz: schema.QuizCreate, database: AsyncSession = Depends(db.get_db)):
    created_quiz = await crud.create_quiz(database, quiz)
    return utils.success_response(data=created_quiz, message="Quiz created successfully")

@router.get("/quizzes/", response_model=schema.ResponseModel)
async def read_quizzes(skip: int = 0, limit: int = 100, database: AsyncSession = Depends(db.get_db)):
    quizzes = await crud.get_quizzes(database, skip=skip, limit=limit)
    return utils.success_response(data=quizzes, message="Quizzes retrieved successfully")

@router.get("/quizzes/{quiz_id}", response_model=schema.ResponseModel)
async def read_quiz(quiz_id: int, database: AsyncSession = Depends(db.get_db)):
    db_quiz = await crud.get_quiz(database, quiz_id=quiz_id)
    if db_quiz is None:
        return utils.error_response(message="Quiz not found")
    return utils.success_response(data=db_quiz, message="Quiz retrieved successfully")

@router.post("/quizzes/{quiz_id}/questions/", response_model=schema.ResponseModel)
async def create_question_for_quiz(quiz_id: int, question: schema.QuestionCreate, database: AsyncSession = Depends(db.get_db)):
    db_quiz = await crud.get_quiz(database, quiz_id=quiz_id)
    if db_quiz is None:
        return utils.error_response(message="Quiz not found")
    created_question = await crud.add_question(database, quiz_id=quiz_id, question=question)
    return utils.success_response(data=created_question, message="Question added successfully")
