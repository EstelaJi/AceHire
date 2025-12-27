# AI Interview App (Voice Only)

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
### 一键启动前后端（Yarn workspaces）
```bash
yarn install          # 在仓库根目录安装并拉取 frontend/backend 依赖
yarn dev              # 同时启动 frontend (Vite) 与 backend (Node + Socket.IO)
```
需要先准备 Postgres/Redis/AI 服务（见下方）。

### 面试元数据与报告
- 前端选择行业/职位等级后点击“开始面试”，所有问题会带上上下文发送。
- “生成报告” 按钮会请求后端返回当前会话的统计摘要（占位实现）。
- 后端目前将对话存储在内存 Map；生产环境请落库（PostgreSQL）并持久化音频/文本。

### 分别启动
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

# 设置 API Key（选择一种方式）：
# 方式1: 创建 .env 文件（推荐）
echo "DEEPSEEK_API_KEY=your-deepseek-api-key" > .env

# 方式2: 命令行设置
export DEEPSEEK_API_KEY=your-deepseek-api-key

uvicorn main:app --reload --port 8000
```

**重要**: 需要设置 `DEEPSEEK_API_KEY` 环境变量。推荐使用 `.env` 文件（代码会自动加载）。

## Notes
- WebSockets are needed; Vercel serverless does not natively support long-lived Socket.IO. For production, host the backend (and AI service) on a WebSocket-friendly runtime (e.g., a small VM/container) and deploy only `frontend/` to Vercel.
- Audio handling is stubbed: the frontend streams MediaRecorder blobs, backend enqueues metadata in Redis, and AI service returns placeholder responses. Replace with real ASR/LLM calls and storage.

## Next Steps
- Wire real ASR + LLM in `ai-service/`
- Persist interview sessions and transcripts in PostgreSQL
- Add auth + role separation (candidate/interviewer)
- Add recording storage (S3/minio) and job workers

