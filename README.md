<div align="center">
  <img src="./frontend/public/logo.png" alt="StreakForge Logo" width="150"/>
  <h1>🔥 StreakForge</h1>
  <p><strong>Where Deep Agentic AI Meets High-Stakes Gamification.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Frontend-React%2018-blue" alt="React" />
    <img src="https://img.shields.io/badge/Backend-FastAPI-009688" alt="FastAPI" />
    <img src="https://img.shields.io/badge/AI-Gemini%201.5%20Flash-F4B400" alt="Gemini" />
    <img src="https://img.shields.io/badge/Database-SQLite%2FPostgreSQL-336791" alt="Database" />
  </p>
</div>

---

## 🏆 The Last-Minute Life Saver

**StreakForge** is a proactive, AI-powered productivity companion built for the "Last-Minute Life Saver" hackathon. 

Most productivity apps fail because they rely on passive reminders. Users easily ignore push notifications, leading to procrastination and broken commitments. StreakForge solves this by replacing passive lists with a **proactive AI coach** and real **psychological stakes**.

By combining Google's Gemini AI for autonomous task planning with an "Accountability Court" (where users pledge virtual currency on their targets), StreakForge ensures that users take meaningful action before deadlines are missed.

## ✨ Key Features

- **🤖 Autonomous AI Copilot:** Chat with your AI coach (powered by Gemini) via text or Voice. The Copilot can autonomously plan your day, break down large goals, and inject them directly into your database.
- **⚖️ The Accountability Court:** Put your virtual coins on the line. If you fail to complete your pledged task before midnight, you suffer a "Contract Breach" and lose your XP and coins. Loss aversion prevents procrastination.
- **🔮 Context-Aware Risk Predictor:** Our AI analyzes your historical task completion rates. If you are statistically likely to break a streak today, the dashboard proactively warns you.
- **📊 Progressive Disclosure UI:** Complex analytics, GitHub-style contribution heatmaps, and mood trackers are neatly hidden until needed, preventing cognitive overload.
- **🗣️ Voice-Enabled:** Built-in Web Speech API integration allows for seamless, hands-free interaction with the AI Copilot.

## 🛠️ Built With (Google Technologies)

- **Google Gemini 3.1 Flash Lite:** Drives the deep agentic workflows, multi-turn conversational memory, JSON parsing for autonomous planning, and multimodal image verification.
- **Google Cloud Run:** The full-stack application is fully Dockerized and architected for scalable, serverless deployment on GCP.
- **Web Speech API:** Chrome/Google web standard for Voice-to-Text.

## 🚀 How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Google Gemini API Key

### 1. Setup Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 2. Setup Frontend (React)
```bash
cd frontend
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` to experience StreakForge!

## 🐳 Docker Deployment

To deploy the entire full-stack application as a single container (perfect for Google Cloud Run):

```bash
docker build -t streakforge .
docker run -p 8000:8000 --env-file backend/.env streakforge
```

---
*Built with ❤️ for the Hackathon.*
