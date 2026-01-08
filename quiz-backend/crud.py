from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from models import Quiz, Question, Answer
import schema

async def create_quiz(db: AsyncSession, quiz: schema.QuizCreate):
    db_quiz = Quiz(title=quiz.title, description=quiz.description)
    db.add(db_quiz)
    await db.commit()
    await db.refresh(db_quiz)
    
    for question in quiz.questions:
        db_question = Question(
            quiz_id=db_quiz.id,
            content=question.content,
            question_type=question.question_type,
            points=question.points
        )
        db.add(db_question)
        await db.commit()
        await db.refresh(db_question)
        
        for answer in question.answers:
            db_answer = Answer(
                question_id=db_question.id,
                content=answer.content,
                is_correct=answer.is_correct
            )
            db.add(db_answer)
        await db.commit()
    
    # Reload quiz with all relationships
    result = await db.execute(
        select(Quiz).options(selectinload(Quiz.questions).selectinload(Question.answers)).filter(Quiz.id == db_quiz.id)
    )
    return result.scalars().first()

async def get_quizzes(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Quiz).offset(skip).limit(limit))
    return result.scalars().all()

async def get_quiz(db: AsyncSession, quiz_id: int):
    result = await db.execute(
        select(Quiz).options(selectinload(Quiz.questions).selectinload(Question.answers)).filter(Quiz.id == quiz_id)
    )
    return result.scalars().first()

async def add_question(db: AsyncSession, quiz_id: int, question: schema.QuestionCreate):
    db_question = Question(
        quiz_id=quiz_id,
        content=question.content,
        question_type=question.question_type,
        points=question.points
    )
    db.add(db_question)
    await db.commit()
    await db.refresh(db_question)
    
    for answer in question.answers:
        db_answer = Answer(
            question_id=db_question.id,
            content=answer.content,
            is_correct=answer.is_correct
        )
        db.add(db_answer)
    await db.commit()
    
    # Reload question with relationship
    result = await db.execute(
        select(Question).options(selectinload(Question.answers)).filter(Question.id == db_question.id)
    )
    return result.scalars().first()
