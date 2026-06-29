<div align="center">

<img src="./frontend/public/logo.png" alt="StreakForge Logo" width="120" />

# 🔥 StreakForge

**An AI-Powered Productivity Ecosystem built for the "Last-Minute Life Saver" Hackathon.**

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> *"Users don't lack memory—they lack accountability. StreakForge fixes human procrastination by combining autonomous AI planning with the psychological power of Loss Aversion."*

</div>

---

## ⚡ Why StreakForge? (The Innovation)

Most productivity tools are passive. You set a task, and you ignore the reminder. 
**StreakForge is Proactive & High-Stakes.** 

1. **The Accountability Court:** Stake your hard-earned virtual XP/Coins on critical tasks. If you miss the midnight deadline, your smart contract breaches and you lose your progress.
2. **Deep Agentic AI:** Speak to your AI Copilot. It doesn't just chat—it autonomously parses your goals, estimates time, creates a schedule, and **injects the tasks directly into your PostgreSQL database.**

---

## 🏗️ System Architecture

GitHub renders the diagram below dynamically to showcase our decoupled, scalable architecture.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#282c34,stroke:#61dafb,stroke-width:2px,color:#fff
    classDef backend fill:#0f3f33,stroke:#009688,stroke-width:2px,color:#fff
    classDef ai fill:#2f153a,stroke:#d93025,stroke-width:2px,color:#fff
    classDef db fill:#1a365d,stroke:#3182ce,stroke-width:2px,color:#fff

    %% Nodes
    Client[("💻 Client (React 18 + Vite)\nZustand State, Framer Motion")]:::frontend
    API["⚙️ FastAPI Backend\n(Async, Python 3.11)"]:::backend
    Gemini["🤖 Google Gemini 3.1 Flash\n(AI Studio / Vertex AI)"]:::ai
    DB[("🗄️ Database\n(SQLite/PostgreSQL)")]:::db

    %% Connections
    Client -- "REST API (JSON)\nJWT Auth" --> API
    API -- "CRUD Operations\n(SQLAlchemy ORM)" --> DB
    API -- "Multi-Turn Memory\n& Agentic Prompts" --> Gemini
    Gemini -- "Structured JSON\n(Tasks & Nudges)" --> API
    
    %% Async Job
    Scheduler["⏰ Lazy Evaluation Engine\n(Timezone Aware)"]:::backend
    Scheduler -. "Evaluates Midnight Breaches" .-> DB
```

---

## 🔮 Core Agentic Capabilities

| Feature | Description | Google Tech Used |
| :--- | :--- | :--- |
| **Autonomous Planning** | Users prompt the AI to plan their day. The AI breaks down tasks, assigns priorities, and injects them straight into the UI/DB. | `Gemini 3.1 Flash Lite` |
| **Risk Predictor** | Machine learning analyzes historical completion rates. If a user is at risk of breaking a streak, the AI generates a proactive nudge. | `Gemini Data Processing` |
| **Voice Copilot** | Users can interact with the AI completely hands-free using real-time voice transcription. | `Web Speech API` |

---

## 📂 Project Structure

```text
📦 streakforge
 ┣ 📂 backend/               # FastAPI Application
 ┃ ┣ 📂 app/
 ┃ ┃ ┣ 📂 api/               # REST API endpoints (Routers)
 ┃ ┃ ┣ 📂 core/              # Security, JWT, Database Config
 ┃ ┃ ┣ 📂 ml/                # Risk Prediction Logic
 ┃ ┃ ┣ 📂 models/            # SQLAlchemy Database Schemas
 ┃ ┃ ┗ 📂 services/          # Core Business Logic & AI Integrations
 ┃ ┣ 📜 Dockerfile           # Multi-stage build for Cloud Run
 ┃ ┗ 📜 requirements.txt
 ┣ 📂 frontend/              # React 18 SPA
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 components/        # Reusable UI components & AI Copilot Widget
 ┃ ┃ ┣ 📂 store/             # Zustand State Management
 ┃ ┃ ┗ 📂 services/          # Axios API clients
 ┃ ┗ 📜 package.json
 ┗ 📜 README.md
```

---

## 🚀 Quick Start Guide

### 1. Boot the API (Backend)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Add GEMINI_API_KEY to your .env file
uvicorn app.main:app --reload --port 8000
```

### 2. Boot the Client (Frontend)
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

---

<div align="center">
  <h3>✨ Built for the Hackathon ✨</h3>
  <p>Ready for production deployment on Google Cloud Run.</p>
</div>
