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

async def get_quiz_by_public_id(db: AsyncSession, public_id: str):
    result = await db.execute(
        select(Quiz).options(selectinload(Quiz.questions).selectinload(Question.answers)).filter(Quiz.public_id == public_id)
    )
    return result.scalars().first()

async def add_question(db: AsyncSession, quiz_public_id: str, question: schema.QuestionCreate):
    # Lookup quiz to get internal ID
    quiz = await get_quiz_by_public_id(db, quiz_public_id)
    if not quiz:
        return None
        
    db_question = Question(
        quiz_id=quiz.id,
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

async def calculate_score(db: AsyncSession, quiz_public_id: str, submission: schema.QuizSubmission) -> schema.SubmissionResult:
    # Fetch quiz with questions and answers
    quiz = await get_quiz_by_public_id(db, quiz_public_id)
    if not quiz:
        return None

    score = 0
    total_points = sum(q.points for q in quiz.questions)
    correct_count = 0
    total_questions = len(quiz.questions)
    
    # Map submission answers for easy lookup: question_id -> AnswerSubmission
    submission_map = {a.question_id: a for a in submission.answers}
    
    details = []

    for question in quiz.questions:
        user_sub = submission_map.get(question.id)
        is_correct = False
        user_answer_display = "No Answer"
        correct_answer_display = ""
        
        # Determine correct answers from DB
        correct_answers_db = [a for a in question.answers if a.is_correct]
        
        if question.question_type == schema.QuestionType.fill_blank:
            # For fill_blank, usually there is one correct answer stored
            correct_text = correct_answers_db[0].content if correct_answers_db else ""
            correct_answer_display = correct_text
            
            if user_sub and user_sub.text_answer:
                user_answer_display = user_sub.text_answer
                # Case insensitive comparison
                if user_sub.text_answer.strip().lower() == correct_text.strip().lower():
                    is_correct = True
        else:
            # For selection types
            correct_ids = {a.id for a in correct_answers_db}
            correct_answer_display = ", ".join([a.content for a in correct_answers_db])
            
            if user_sub:
                submitted_ids = set(user_sub.selected_answer_ids)
                # Helper to show what user selected
                # We need to find content for submitted IDs. 
                # Since we have all answers loaded in question.answers, we can lookup
                selected_content = [a.content for a in question.answers if a.id in submitted_ids]
                user_answer_display = ", ".join(selected_content) if selected_content else "No Selection"
                
                if submitted_ids == correct_ids:
                    is_correct = True

        if is_correct:
            score += question.points
            correct_count += 1
            
        details.append(schema.QuestionResult(
            question_id=question.id,
            is_correct=is_correct,
            user_answer=user_answer_display,
            correct_answer=correct_answer_display
        ))

    return schema.SubmissionResult(
        score=score,
        total_points=total_points,
        correct_count=correct_count,
        total_questions=total_questions,
        details=details
    )
