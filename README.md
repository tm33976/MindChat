# Mind Chat — Full Setup Guide

A production-quality AI chat application built with:
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB (Atlas)
- **LLM**: Groq & Tavily

---

## Prerequisites

Make sure these are installed before starting:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node |
| Git | Any | https://git-scm.com |

You will also need free accounts on:
- **MongoDB Atlas** → https://cloud.mongodb.com
- **GroqCloud** (Groq API key) → https://console.groq.com/keys

---

## Project Structure

```
gemini-chat/
├── client/          ← Next.js frontend (port 3000)
└── server/          ← Express backend (port 5000)
```

---

## Step 1 — Get a MongoDB Connection String

1. Go to https://cloud.mongodb.com and sign in (free tier is fine)
2. Create a new **Project** → create a **Cluster** (M0 Free tier)
3. Click **Connect** → **Drivers** → copy the connection string
4. Replace `<password>` with your DB user password
5. Append the database name before `?`: `.../gemini-chat?retryWrites=...`

Your final URI looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gemini-chat?retryWrites=true&w=majority
```

---

## Step 2 — Get a Groq API Key

1. Go to https://console.groq.com/keys
2. Click **Get API Key** → **Create API key**
3. Copy the key (starts with `gsk...`)

The free tier includes generous quota. If you hit limits, the app gracefully falls back to mock responses.

---

## Step 3 — Set Up the Backend

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
```

Now open `server/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gemini-chat?retryWrites=true&w=majority
GROQ_API_KEY=gsk...your_key_here
TAVILY_API_KEY=tvly....your_key_here 
CLIENT_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
🚀 Server running on http://localhost:5000
```

Verify it works:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

---

## Step 4 — Set Up the Frontend

Open a **new terminal tab**:

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy the environment template
cp .env.local.example .env.local
```

The `.env.local` file just needs one line (already correct for local dev):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the chat interface.

---

## Step 5 — Test the App

1. Click **New** in the sidebar to create your first conversation
2. Type a message and press **Enter**
3. Gemini should respond within a few seconds
4. After 4+ messages, a **View summary** link appears below the chat
5. Click it to see the AI-generated summary of your conversation

---

## Troubleshooting

**"Network error — is the server running?"**
- Make sure the backend is running on port 5000
- Check that `NEXT_PUBLIC_API_URL` in `.env.local` points to `http://localhost:5000/api`

**"MongoDB connection failed"**
- Double-check your connection string (no angle brackets, correct password)
- In MongoDB Atlas: **Network Access** → Add your current IP or `0.0.0.0/0` for development



**Port already in use**
```bash
# Kill whatever is on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port in server/.env
PORT=5001
# And update client/.env.local:
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Deployment

### Backend → Render (free tier)

1. Push the `server/` folder to a GitHub repo
2. Go to https://render.com → New → **Web Service**
3. Connect your repo, set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables (same as `.env` but with production values):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your Atlas URI
   - `GROQ_API_KEY` = your key
   - `TAVILY_API_KEY` = your key
   - `CLIENT_URL` = your Vercel frontend URL (set after frontend deploy)
5. Deploy → copy the service URL (e.g. `https://mind-chat-api.onrender.com`)

### Frontend → Vercel (free tier)

1. Push the `client/` folder to a GitHub repo
2. Go to https://vercel.com → New Project → import your repo
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://mind-chat-api.onrender.com/api`
4. Deploy → your app is live at `https://your-app.vercel.app`

### Final step after both are deployed

Go back to Render → your backend service → **Environment** → update `CLIENT_URL` to your Vercel URL → redeploy.

### MongoDB Atlas — allow production IPs

In Atlas: **Network Access** → Add IP → either add Render's static IPs or use `0.0.0.0/0` (allow all — less secure but simpler).

---

## Environment Variables Reference

### server/.env

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | Full MongoDB Atlas connection string |
| `GROQ_API_KEY` | Yes | GroqCloud API key |
| `TAVILY_API_KEY` | Yes | Tavily API key |
| `CLIENT_URL` | Yes | Frontend URL for CORS |

### client/.env.local

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## Quick Start (TL;DR)

```bash
# Terminal 1 — Backend
cd server && npm install && cp .env.example .env
# edit .env with your keys
npm run dev

# Terminal 2 — Frontend
cd client && npm install && cp .env.local.example .env.local
npm run dev

# Open http://localhost:3000
```
##  Author

👨‍💻 **Tushar Mishra**  
📧 tm3390782@gmail.com  