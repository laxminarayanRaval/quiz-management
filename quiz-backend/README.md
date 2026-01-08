# Quiz Management System - Backend

This is the backend for the Quiz Management System, built with FastAPI and PostgreSQL (using SQLAlchemy).

## Features

- **FastAPI**: Modern, fast web framework for building APIs.
- **SQLAlchemy**: ORM for database interactions (Async).
- **PostgreSQL**: Robust relational database.
- **Pydantic**: Data validation and settings management.

## Prerequisites

- Python 3.10+
- PostgreSQL database (or NeonDB)

## Setup

1.  **Clone the repository** and navigate to the backend directory:
    ```bash
    cd quiz-management/quiz-backend
    ```

2.  **Create a virtual environment**:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Environment Variables**:
    Create a `.env` file in `quiz-backend/` with the following content:
    ```env
    DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
    ```
    Replace the value with your actual connection string.

## Database Migration

The project uses a custom migration script to handle schema changes (like adding `public_id`).

Run the migration script:
```bash
python migrate_db.py
```

## Running the Application

Start the FastAPI development server:
```bash
python main.py
```
Or potentially via uvicorn directly if configured:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
Interactive API documentation is available at `http://localhost:8000/docs`.

## Project Structure

- `main.py`: Entry point of the application.
- `models.py`: Database models (SQLAlchemy).
- `schema.py`: Pydantic models for request/response validation.
- `crud.py`: Database access logic.
- `routes.py`: API endpoints.
- `db.py`: Database connection setup.
- `migrate_db.py`: Database migration script.
