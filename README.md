# RoleCall AI

A multimodal AI communication simulation platform. Practice difficult conversations with realistic AI personas, get coached on transcript quality, audio patterns, and video interaction signals.

## Quick Start

### Backend (Python/FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/health`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Flow

1. **Landing page** → click "Start Simulation"
2. **Create** → select Web Video + Healthcare, keep the default prompt (Margaret Lewis), click "Generate Simulation"
3. **Preview** → review the persona, scenario, rubric; click "Start practice"
4. **Pre-call setup** → allow camera/mic, review consent toggles, click "Join simulation"
5. **Live call** → watch the transcript play out; at ~2:41 the critical moment banner fires
6. **End call** → click "End call", watch the analyzing screen
7. **Report** → see scores, key moments, and coach feedback
8. **Progress** → view 30-day skill trends and radar

## Architecture

```
frontend/   Next.js 14, TypeScript, Tailwind, Zustand
backend/    Python FastAPI, Pydantic, mock AI endpoints
```

### Backend endpoints (all mock — no API keys needed)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| POST | `/personas/generate` | Generate AI persona |
| POST | `/scenarios/generate` | Generate scenario |
| POST | `/rubrics/generate` | Generate evaluation rubric |
| POST | `/simulations/respond` | Get next transcript turn |
| POST | `/video/analyze-frame` | Mock video signal analysis |
| POST | `/video/summarize-session` | Session-level video signals |
| POST | `/audio/summarize-session` | Session-level audio signals |
| POST | `/evaluations/generate` | Full coaching report |

## Video Interaction Signals

RoleCall shows these coaching estimates during and after calls:

- Eye-contact estimate
- Face centered
- Head movement stability
- Facial engagement estimate
- Speaking pace (wpm)
- Interruption count
- Filler word count

**Privacy notice:** Video interaction signals are coaching estimates. They are not emotion detection, truth detection, psychological assessment, or medical assessment.

## ML Pipeline (scaffolded)

`backend/app/ml/video/` contains the video analysis pipeline with correct function signatures. Currently returns mock values — ready to integrate MediaPipe FaceMesh for production use.

## Environment

Copy `.env.example` to `.env` in both `frontend/` and `backend/`. No API keys are required for mock mode.

```bash
cp backend/.env.example backend/.env
```