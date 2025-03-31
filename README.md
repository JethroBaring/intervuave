# Intervuave

**Intervuave** is a dynamic AI-powered interviewer system designed for cultural fit assessment. It analyzes candidate responses based on company-defined mission, vision, culture, and core values using video-based interviews, emotion recognition, and LLM-enhanced feedback.

---

## 🎯 Core Focus

Evaluate candidates not just by skill — but by how well they align with the company’s **culture**, **values**, **mission**, and **vision**.

---

## 🏗️ Architecture Overview

### 🧠 AI Worker Stack
- **FastAPI worker** (Python):  
  - Runs Whisper (speech-to-text)
  - DeepFace (emotion)
  - Mediapipe (posture, eye gaze, gestures)
  - Sentiment scoring

- **LLM**: Evaluates alignment to culture, values, mission, vision

- **NestJS Backend** (Node):
  - Auth & Admin APIs
  - Job queuing (Celery + RabbitMQ)
  - Prisma ORM (PostgreSQL)

- **Next.js Frontend**:
  - Company admin dashboard
  - Candidate interview portal
  - Zustand for auth state

---

## 🧱 Key Features

### 🔐 Auth
- JWT with HTTP-only cookies
- Refresh logic via Axios + middleware

### 📝 Interview Setup
- `Position` = interview context (title, voice, template)
- `InterviewTemplate` = reusable set of questions
- `ResponseMetric` = fixed metrics with per-template weights

### 🎤 Metrics Tracked (per response)
- `speechClarity`
- `confidence`
- `engagement`
- `emotionalTone`
- `bodyLanguage`

### 🎯 Scoring Outputs
- `valuesFit`
- `missionAlignment`
- `visionAlignment`
- `cultureFit` (composite)
- Per-question feedback + per-value breakdown

---

## 🌐 Video Upload Flow

1. Frontend requests signed URL from NestJS
2. Direct upload to GCP Cloud Storage
3. Send `videoUrl`, `timestamps`, and `raw transcript` to backend
4. Job queued for processing → then evaluation

---

## 📁 Project Structure

| Folder | Description |
|--------|-------------|
| `frontend` | Next.js frontend |
| `backend` | NestJS backend |
| `interview-worker` | FastAPI AI processing |
| `evaluation-worker` | FastAPI AI evaluation |


---

## 🚀 Getting Started

> Full setup instructions coming soon!  
For now, ensure you have:
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Redis (optional for Celery broker)
- RabbitMQ

---

## 🧪 Research Focus

This system was built as part of a cultural fit assessment study. It aims to measure alignment based on behavioral signals and value-driven responses.

---

## 📄 License

MIT © 2024 — built by Jethro
