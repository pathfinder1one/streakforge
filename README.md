<div align="center">
  <img src="./frontend/public/logo.png" alt="StreakForge Logo" width="150" height="150"/>
  <h1>🔥 StreakForge</h1>
  <p><strong>Where Deep Agentic AI Meets High-Stakes Gamification.</strong></p>
  
  <p>
    <a href="#"><img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=white" alt="React" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688?logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="#"><img src="https://img.shields.io/badge/AI_Engine-Gemini%203.1%20Flash%20Lite-F4B400?logo=google&logoColor=white" alt="Gemini" /></a>
    <a href="#"><img src="https://img.shields.io/badge/State-Zustand-443E38?logo=react&logoColor=white" alt="Zustand" /></a>
    <a href="#"><img src="https://img.shields.io/badge/Deployment-Docker%20%7C%20Cloud%20Run-2496ED?logo=docker&logoColor=white" alt="Docker" /></a>
  </p>
  
  <p>
    <i>An AI-powered productivity ecosystem built to solve chronic procrastination through behavioral psychology and autonomous agentic workflows. Built for "The Last-Minute Life Saver" Hackathon.</i>
  </p>
</div>

---

## 📖 Table of Contents
- [The Vision](#-the-vision)
- [System Architecture](#-system-architecture)
- [Core Mechanics & AI](#-core-mechanics--ai)
- [Tech Stack](#-tech-stack)
- [Local Development Setup](#-local-development-setup)
- [Deployment (Docker & Cloud Run)](#-deployment)

---

## 🔭 The Vision

Most productivity software fails because it acts as a passive repository for tasks. Users easily dismiss notifications, leading to broken habits. 

**StreakForge** replaces passive reminders with **Proactive Accountability**. By forcing users to pledge virtual currency on critical daily targets (The Accountability Court) and utilizing an onboard **Agentic AI Copilot** to autonomously break down overwhelming goals into manageable steps, StreakForge engineers success by mitigating cognitive overload and leveraging loss-aversion psychology.

---

## 🏗 System Architecture

StreakForge is a decoupled, modern web application utilizing a RESTful architecture, built for scalability and low-latency AI interactions.

<details>
<summary><b>Click to view Architecture Details</b></summary>

- **Frontend (Client):** Single Page Application (SPA) built with React 18 and Vite. State is managed deterministically via `Zustand`. Styling is handled via highly optimized Tailwind CSS with Framer Motion for 60fps micro-animations.
- **Backend (API):** High-performance asynchronous backend built with FastAPI and Uvicorn. Implements secure JWT-based authentication.
- **Database Layer:** SQLAlchemy ORM interfacing with SQLite (local/dev) or PostgreSQL (production). 
- **AI Integration Layer:** Direct integration with Google's Vertex AI / AI Studio using the `gemini-3.1-flash-lite` model for ultra-low latency conversational agents and structured JSON generation.
- **Evaluation Engine (Lazy Loading):** Timezone-aware streak computation is handled via "Lazy Evaluation" upon dashboard initialization, ensuring highly accurate contract breach execution regardless of the user's localized GMT offset without requiring heavy cron-jobs.
</details>

---

## 🧠 Core Mechanics & AI

### 1. Autonomous Agentic Copilot
Unlike traditional chatbots, StreakForge's Copilot possesses **Agentic Depth**. It doesn't just offer advice; it takes action. When a user requests a study plan via **Voice Input** or text, the AI parses the intent, generates a structured schedule, and autonomously injects the tasks directly into the PostgreSQL database.

### 2. Context-Aware Risk Predictor
The backend utilizes historical session data to compute a statistical "Breach Risk" score. If a user is predicted to break their streak, the system triggers proactive, personalized nudges formulated dynamically by the AI.

### 3. The Accountability Court (Smart Contracts)
High-stakes gamification. Users stake their virtual currency (`coins`) on high-priority targets. If the midnight deadline (calculated strictly on the user's local timezone offset) is missed, a contract breach occurs, penalizing the user's XP and economy.

### 4. Progressive Disclosure UI
To prevent cognitive overload, complex analytics like GitHub-style Contribution Heatmaps, multi-axis Mood Tracking, and XP progression curves are dynamically lazy-loaded and hidden behind collapsible interfaces.

---

## 💻 Tech Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, Lucide Icons, Web Speech API |
| **Backend** | Python 3.11, FastAPI (Async), SQLAlchemy ORM, Pydantic, Passlib (Bcrypt), PyJWT |
| **AI / ML** | Google Gemini 3.1 Flash Lite (Generative AI), Scikit-Learn concepts (Risk Predictor) |
| **Infrastructure** | Docker, Google Cloud Run, Railway |

---

## 🚀 Local Development Setup

We highly recommend using Python 3.11+ and Node 18+ for local development.

### 1. Clone the Repository
```bash
git clone https://github.com/pathfinder1one/streakforge.git
cd streakforge
```

### 2. Backend Setup
The backend runs on port `8000`.
```bash
cd backend
python -m venv venv

# Activate Virtual Environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Important: Add your GEMINI_API_KEY in the .env file!

# Boot the API
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
The frontend runs on port `5173`.
```bash
cd frontend
npm install

# Connect to local backend
echo "VITE_API_URL=http://localhost:8000/api" > .env.local

# Boot the Dev Server
npm run dev
```

---

## 🐳 Deployment

StreakForge is fully Dockerized and ready for PaaS platforms like Google Cloud Run or Railway. The `Dockerfile` implements a multi-stage build, compiling the React assets and serving them statically via FastAPI to ensure a single, highly efficient container.

```bash
# Build the production image
docker build -t streakforge:latest .

# Run the production container
docker run -p 8000:8000 --env-file backend/.env streakforge:latest
```

---
<div align="center">
  <i>Built with dedication for the Last-Minute Life Saver Hackathon.</i>
</div>
