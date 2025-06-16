# AI Recruitment Platform

A modern web-based recruitment platform that leverages AI to streamline the hiring process. The platform uses AI for candidate matching, job description generation, and automated contract creation.

## Features

- 🤖 AI-Powered Candidate Matching
- 📝 Smart Job Description Generation
- 🎯 Intelligent Application Scoring
- 📄 Automated Contract Generation
- 👥 User Roles (Employers & Candidates & Admin)
- 🔒 Secure Authentication System
  
## Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.8+)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT Models
- **Migration**: Alembic

### Frontend

- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8 or higher
- Node.js 14 or higher
- PostgreSQL 12 or higher
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-recruitment
```

### 2. Backend Setup

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

Key Python packages and their purposes:

- `fastapi==0.104.1`: Modern web framework for building APIs
- `uvicorn==0.24.0`: ASGI server for running FastAPI
- `sqlalchemy==2.0.23`: SQL toolkit and ORM
- `psycopg2-binary==2.9.9`: PostgreSQL adapter
- `python-jose[cryptography]==3.3.0`: JWT token handling
- `passlib[bcrypt]==1.7.4`: Password hashing
- `python-multipart==0.0.6`: Form data parsing
- `openai==1.3.0`: OpenAI API integration
- `python-dotenv==1.0.0`: Environment variable management
- `pydantic==2.5.1`: Data validation
- `alembic==1.12.1`: Database migration tool
- `pytest==7.4.3`: Testing framework
- `httpx==0.25.1`: HTTP client for testing

3. Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_recruitment
JWT_SECRET=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
OPENAI_API_KEY=your-openai-api-key
```

4. Initialize the database:

```bash
# Create database
createdb ai_recruitment

# Run migrations
alembic upgrade head
```

5. Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

Key frontend dependencies and their purposes:

- `@mui/material` & `@mui/icons-material`: Material-UI components and icons
- `@reduxjs/toolkit`: State management
- `react-router-dom`: Application routing
- `formik` & `yup`: Form handling and validation
- `axios`: HTTP client
- `typescript`: Type checking

3. Start the frontend development server:

```bash
npm start
```

## Application Structure

### Backend Structure

```
app/
├── api/
│   └── api_v1/
│       ├── endpoints/
│       └── api.py
├── core/
│   ├── config.py
│   └── security.py
├── models/
│   └── models.py
├── services/
│   └── ai_service.py
└── main.py
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   └── layout/
│   ├── services/
│   ├── store/
│   └── App.tsx
└── package.json
```

## API Documentation

Once the backend server is running, you can access:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Scripts

### Backend

- `uvicorn app.main:app --reload`: Start development server
- `pytest`: Run tests
- `alembic revision --autogenerate`: Generate migration
- `alembic upgrade head`: Apply migrations

### Frontend

- `npm start`: Start development server
- `npm test`: Run tests
- `npm run build`: Build for production

## Environment Variables

### Backend (.env)

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `OPENAI_API_KEY`: OpenAI API key for AI features

## Development Guidelines

1. **Database Changes**

   - Create new models in `app/models/models.py`
   - Generate migration: `alembic revision --autogenerate -m "description"`
   - Apply migration: `alembic upgrade head`

2. **API Endpoints**

   - Add new endpoints in `app/api/api_v1/endpoints/`
   - Register routes in `app/api/api_v1/api.py`

3. **Frontend Components**
   - Follow Material-UI best practices
   - Use TypeScript interfaces for props
   - Implement responsive design

## Common Issues & Solutions

1. **Database Connection**

   - Ensure PostgreSQL is running
   - Verify database credentials in `.env`
   - Check database exists: `createdb ai_recruitment`

2. **OpenAI API**

   - Ensure valid API key in `.env`
   - Check API rate limits
   - Handle API errors gracefully

3. **Frontend Development**
   - Clear browser cache if changes not reflecting
   - Check console for errors
   - Verify API endpoint URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
