# UniManage AI - جامعة البليدة 2

A premium, AI-powered institutional dashboard for University Administration, customized for Université Lounici Ali (Blida 2).

## Features
- **Trilingual Interface:** Full support for Arabic, French, and English, including RTL/LTR layout switching.
- **AI Operations Analyst:** Powered by OpenRouter, leveraging a model cascade (Gemma, Minimax, Nemotron) with a smart data-driven fallback to analyze live database metrics.
- **Live Dashboard:** Real-time KPIs for student enrollment, room occupancy, and maintenance tickets.
- **Maintenance Ticketing System:** Track, prioritize, and resolve issues with ease.
- **Excel Tools:** Import bulk students and rooms via Excel, and export administrative reports.
- **Role-Based Access Control:** Secure JWT authentication.

## Tech Stack
- **Frontend:** React 18, Vite, Recharts, Lucide Icons.
- **Backend:** Node.js, Express, PostgreSQL (via Supabase), JSON Web Tokens.
- **AI Integration:** OpenRouter API.

## Getting Started

### 1. Database Setup
The backend is configured to use a PostgreSQL database hosted on Supabase.
Ensure your `.env` file in the `backend/` directory contains the correct `DATABASE_URL`.

### 2. Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
*(Server runs on port 5000)*

### 3. Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
*(Vite runs on port 5173)*

### 4. Admin Account
On first successful database connection, the backend **creates** a default admin if that email does not exist yet:

- **Email:** `admin@blida2.dz`
- **Password:** `admin123` (unless you set `DEFAULT_ADMIN_PASSWORD` in `backend/.env`)

Restart the backend after fixing `DATABASE_URL` so this bootstrap runs.

**Login problems:** Ensure the backend is running (same port as the frontend expects, e.g. `5050` in `frontend/src/api/axios.js`) and that `JWT_SECRET` is set in `.env`. If someone previously ran local scripts that changed the password, try both `admin123` and `admin12345`. You can reset the hash with `DEFAULT_ADMIN_PASSWORD` + delete the admin row once, then restart—or update the password in the database directly.

## Production Deployment
- **Backend:** Ready to be deployed to services like Render, Heroku, or Railway. Ensure to set the `NODE_ENV=production` and the environment variables (`DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `AI_MODEL`).
- **Frontend:** Build the static files using `npm run build` inside the `frontend/` directory and host on Vercel, Netlify, or similar platforms.
