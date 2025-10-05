# Lotwise Portfolio Tracker -


Structure:
- backend/ (Express API that publishes trades to Kafka)
- worker/ (Kafka consumer applying FIFO lot logic)
- frontend/ (Next.js app with trade form, positions and P&L pages)
- docker-compose.yml (Postgres + Zookeeper + Kafka)

Quick start (Linux/macOS/Windows with Docker Desktop):
1. Extract the archive and open the folder in VSCode.
2. Start infrastructure:
   docker-compose up -d
3. Create DB schema & seed (from backend folder):
   cd backend
   npm install
   psql "postgres://postgres:postgres@localhost:5432/lotwise" -f src/seeds/seed.sql
4. Start backend server (in backend/):
   cp .env.example .env
   npm start
5. Start worker (in worker/):
   cp .env.example .env
   npm start
6. Start frontend (in frontend/):
   cd frontend
   npm install
   npm run dev
7. Open frontend at http://localhost:3000

See full README inside backend/src/seeds/seed.sql for schema and seeded trades.
