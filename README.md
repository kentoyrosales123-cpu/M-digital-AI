# M Digital AI Assistant

A simple ChatGPT-like AI web system with:
- Free tier using Ollama `llama3.1:8b`
- Premium tier using OpenAI API
- Node.js + Express + MongoDB
- Plain HTML/CSS/JavaScript frontend
- Manual GCash payment proof approval

## 1. Install dependencies

```bash
npm install
```

## 2. Create `.env`

Copy `.env.example` to `.env` and update values.

```bash
cp .env.example .env
```

On Windows CMD:

```cmd
copy .env.example .env
```

## 3. Run Ollama

Install Ollama first, then pull/run the free model:

```bash
ollama pull llama3.1:8b
ollama run llama3.1:8b
```

Ollama should be available at:

```text
http://localhost:11434
```

## 4. Create default admin

After setting `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`:

```bash
npm run seed:admin
```

## 5. Run development server

```bash
npm run dev
```

Open:

```text
http://localhost:5000
```

## 6. Production / Render

Render can host the Node.js web system, but local Ollama on your PC will not automatically be reachable by Render.

For production you have two choices:

1. Use OpenAI API only on Render.
2. Host Ollama on your own VPS/server and set `OLLAMA_BASE_URL` to that server.

Recommended Render settings:

```text
Build Command: npm install
Start Command: npm start
```

Add environment variables in Render dashboard.

## Important Notes

- Never expose `OPENAI_API_KEY` in frontend files.
- Keep `.env` private.
- Payment proof upload currently uses local server storage. For Render, uploaded files may not persist permanently unless you use persistent disk or cloud storage.
- This is a functional MVP. Add PayMongo, email notifications, file upload AI, and advanced analytics in Phase 2.
