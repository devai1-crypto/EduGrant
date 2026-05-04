# EduGrant AI

Multi-agent scholarship application automation system.

## Project Structure
- `backend/`: FastAPI + LangGraph orchestrator.
- `frontend/`: React + Vite + Tailwind CSS.
- `shared/`: Shared schemas and models.

## Getting Started

### Prerequisites
- Python 3.12+ (Recommended: [uv](https://docs.astral.sh/uv/))
- Node.js 20+ and npm/pnpm
- Docker (for database and storage)

### 1. Setup Backend
```bash
cd backend
# Using uv (recommended)
uv sync
# Or using pip
pip install -e .

# Start the API
uvicorn edugrant.main:app --reload
```
The API will be available at [http://localhost:8000](http://localhost:8000).
Check the health at [http://localhost:8000/health](http://localhost:8000/health).

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at [http://localhost:5173](http://localhost:5173).

### 3. Environment Variables
Create a `.env` file in the `backend/` directory:
```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/edugrant
R2_BUCKET=edugrant-attachments
```

## Implementation Status
- [x] Monorepo structure bootstrapped
- [x] Backend FastAPI skeleton
- [x] LangGraph orchestration skeleton
- [x] Frontend React + Tailwind setup
- [x] Basic routing (Student, Admin, Trace)
- [ ] Agent logic implementation (In Progress)
- [ ] Docker infrastructure setup (Next Step)
