# AI Interview App

Mono-repo scaffold for an AI-assisted interview web app.

## Stack
- Frontend: React + Vite + TailwindCSS + Ant Design, Socket.IO client
- Backend: Node.js + Express + Socket.IO, PostgreSQL, Redis
- AI service: FastAPI (placeholder endpoints)
- Deploy: Vercel (frontend ready; backend/AI require server or Vercel functions with WebSocket-friendly hosting)

## Structure
- `frontend/` – React client
- `backend/` – Node.js API + Socket.IO gateway
- `ai-service/` – FastAPI microservice stub

## Getting Started (local)
### One-Command Start (Yarn workspaces)
```bash
yarn install          # Install dependencies for frontend and backend at repo root
yarn dev              # Start both frontend (Vite) and backend (Node + Socket.IO)
```
Make sure PostgreSQL, Redis, and AI service are running first (see below).

### Interview Metadata & Reports
- After selecting industry/job level on the frontend and clicking "Start Interview", all questions will be sent with context.
- The "Generate Report" button requests the backend to return a statistical summary of the current session (placeholder implementation).
- The backend currently stores conversations in an in-memory Map; for production, persist to database (PostgreSQL) and store audio/text.

### Start Services Separately
1) Frontend
```bash
cd frontend
yarn install
yarn dev
```
Set `VITE_BACKEND_URL` if backend is not localhost:4000.

2) Backend
```bash
cd backend
cp env.example .env
yarn install
yarn dev   # uses tsx to run TypeScript directly
```
Requires PostgreSQL + Redis running locally (or update URLs in `.env`). AI service URL defaults to `http://localhost:8000`.

3) AI service
```bash
conda activate interview-ai 
cd ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Set API Key (choose one method):
# Method 1: Create .env file (recommended)
echo "DEEPSEEK_API_KEY=your-deepseek-api-key" > .env

# Method 2: Set via command line
export DEEPSEEK_API_KEY=your-deepseek-api-key

uvicorn main:app --reload --port 8000
```

**Important**: You need to set the `DEEPSEEK_API_KEY` environment variable. Using a `.env` file is recommended (the code will automatically load it).

## Notes
- WebSockets are needed; Vercel serverless does not natively support long-lived Socket.IO. For production, host the backend (and AI service) on a WebSocket-friendly runtime (e.g., a small VM/container) and deploy only `frontend/` to Vercel.
- Audio handling is stubbed: the frontend streams MediaRecorder blobs, backend enqueues metadata in Redis, and AI service returns placeholder responses. Replace with real ASR/LLM calls and storage.

## Next Steps
- Wire real ASR + LLM in `ai-service/`
- Persist interview sessions and transcripts in PostgreSQL
- Add auth + role separation (candidate/interviewer)
- Add recording storage (S3/minio) and job workers

