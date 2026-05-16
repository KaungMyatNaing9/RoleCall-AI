# AGENTS.md — RoleCall AI

## Project name

RoleCall AI

## One-line product summary

RoleCall AI is a multimodal AI communication simulation platform where users generate realistic AI personas, practice through browser voice or web video calls, and receive structured feedback on transcript quality, communication skills, audio patterns, and ML-based video interaction signals.

## Core product vision

Build a full communication-practice simulator for different industries.

Users should be able to:
1. Create a realistic AI persona from a prompt or uploaded document.
2. Generate a scenario based on industry, difficulty, and training goal.
3. Generate an evaluation rubric automatically.
4. Practice through browser video call, browser voice call, or phone-call-style mode.
5. Capture transcript, audio signals, and video interaction signals.
6. Receive a post-call coaching report.
7. Track improvement over repeated sessions.
8. Optionally generate an avatar or 3D/talking persona for the AI participant.

This is not a generic chatbot. It is a structured simulation and coaching system.

## Target industries

Support these industries and training modes:

- Healthcare: patient intake, post-discharge calls, difficult patient conversations
- Customer service: angry customers, refund requests, escalation handling
- Sales: discovery calls, objection handling, closing practice
- HR/interviews: recruiter simulation, behavioral interviews, job-description-based practice
- Education: teacher-parent conversations, student advising
- Finance: client support, fraud/scam-awareness training
- Hospitality: hotel guest complaints, front-desk training
- Custom: user-defined training scenario

## Key differentiator

RoleCall AI is a multi-agent communication simulator.

Behind the scenes, it should feel like these agents are working together:

1. **Persona Generator Agent**
   - Creates realistic caller/customer/patient/interviewer personas.

2. **Scenario Builder Agent**
   - Creates situation, background, hidden goals, critical moments, and success conditions.

3. **Rubric Generator Agent**
   - Creates evaluation criteria based on industry and scenario.

4. **Simulation Agent**
   - Roleplays the persona during the call.

5. **Transcript Analysis Agent**
   - Reviews what the trainee said.

6. **Audio Signal Analysis Service**
   - Measures speech-related signals such as pace, interruptions, pause patterns, and filler words.

7. **Video Signal Analysis Service**
   - Uses ML/computer vision to extract video interaction signals.

8. **Coaching Report Agent**
   - Produces scores, feedback, key moments, and next-practice recommendations.

9. **Avatar Generator Agent**
   - Optional add-on that creates a fictional persona avatar image or 3D/talking avatar.

## Important safety and privacy principle

RoleCall AI must be privacy-conscious and careful with video analysis.

The system must not claim to detect:
- emotions as facts
- truthfulness
- anxiety
- mental health state
- medical condition
- protected attributes
- personality traits as facts

Use careful wording:
- video interaction signals
- nonverbal communication cues
- eye-contact estimate
- face-centered estimate
- head movement stability
- facial engagement estimate
- speaking pace
- pause patterns
- interruption count
- coaching indicators
- estimates

Always include this notice in setup and report screens:

> Video interaction signals are coaching estimates. They are not emotion detection, truth detection, psychological assessment, or medical assessment.

## Technical architecture

Use a two-service architecture:

```txt
React / Next.js Frontend
        ↓ REST + WebSocket
Python FastAPI Backend
        ↓
AI + ML Services
        ├── Persona generation
        ├── Scenario generation
        ├── Rubric generation
        ├── Simulation response generation
        ├── Transcript evaluation
        ├── Audio feature extraction
        ├── Video frame analysis
        ├── Report generation
        └── Optional avatar generation
```

## Primary stack
Frontend

Use:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Recharts
Zustand
Zod
Lucide React
WebRTC/getUserMedia browser APIs
Backend

Use:

Python
FastAPI
Pydantic
WebSockets
OpenCV
MediaPipe
NumPy
Pillow
python-dotenv
python-multipart
optional: SQLModel / SQLAlchemy
optional: librosa / soundfile for audio features
optional: OpenAI / Gemini / Anthropic SDKs
optional: ElevenLabs SDK/API
ML video analysis

Use:

MediaPipe Face Landmarker or Face Mesh
OpenCV for frame decoding and preprocessing
Lightweight frame sampling
Session-level signal aggregation
Voice integration

MVP can use:

text responses
simulated voice waveform
optional TTS

Stretch:

ElevenLabs TTS
ElevenLabs conversational agent
browser voice interaction
Twilio phone-call mode later

ElevenLabs supports conversational agents and developer tools for voice-rich multimodal agents.

## Recommended monorepo structure

rolecall-ai/
├── AGENTS.md
├── README.md
├── .env.example
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── public/
│   │   ├── avatars/
│   │   ├── demo/
│   │   └── logos/
│   └── src/
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── dashboard/
│       │   │   └── page.tsx
│       │   ├── create/
│       │   │   └── page.tsx
│       │   ├── simulation/
│       │   │   ├── preview/
│       │   │   │   └── page.tsx
│       │   │   ├── setup/
│       │   │   │   └── page.tsx
│       │   │   ├── call/
│       │   │   │   └── page.tsx
│       │   │   └── report/
│       │   │       └── page.tsx
│       │   ├── templates/
│       │   │   └── page.tsx
│       │   ├── progress/
│       │   │   └── page.tsx
│       │   └── settings/
│       │       └── page.tsx
│       ├── components/
│       │   ├── ui/
│       │   ├── layout/
│       │   │   ├── AppShell.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── TopNav.tsx
│       │   ├── landing/
│       │   │   ├── HeroSection.tsx
│       │   │   ├── FeatureCards.tsx
│       │   │   └── IndustryCards.tsx
│       │   ├── dashboard/
│       │   │   ├── QuickStartCards.tsx
│       │   │   ├── RecentSessions.tsx
│       │   │   └── ReadinessOverview.tsx
│       │   ├── simulation/
│       │   │   ├── ModeSelector.tsx
│       │   │   ├── IndustrySelector.tsx
│       │   │   ├── PersonaPromptBox.tsx
│       │   │   ├── DifficultyControls.tsx
│       │   │   ├── EvaluationFocusSelector.tsx
│       │   │   ├── PersonaCard.tsx
│       │   │   ├── ScenarioCard.tsx
│       │   │   ├── RubricCard.tsx
│       │   │   ├── PreCallChecklist.tsx
│       │   │   ├── VideoCallStage.tsx
│       │   │   ├── VoiceCallStage.tsx
│       │   │   ├── CallControlBar.tsx
│       │   │   ├── LiveTranscript.tsx
│       │   │   ├── CoachingSidebar.tsx
│       │   │   ├── CriticalMomentBanner.tsx
│       │   │   ├── SignalMeter.tsx
│       │   │   └── VideoSignalOverlay.tsx
│       │   ├── reports/
│       │   │   ├── ReportSummaryCard.tsx
│       │   │   ├── ScoreCard.tsx
│       │   │   ├── TimelineMoment.tsx
│       │   │   ├── TranscriptReview.tsx
│       │   │   ├── VideoSignalInsights.tsx
│       │   │   ├── AudioSignalInsights.tsx
│       │   │   └── ImprovementRecommendations.tsx
│       │   ├── analytics/
│       │   │   ├── SkillRadarChart.tsx
│       │   │   ├── ProgressTrendChart.tsx
│       │   │   └── MistakePatternCards.tsx
│       │   └── avatar/
│       │       ├── PersonaAvatar.tsx
│       │       ├── AvatarGeneratorPanel.tsx
│       │       └── AvatarPreview.tsx
│       ├── hooks/
│       │   ├── useCamera.ts
│       │   ├── useMicrophone.ts
│       │   ├── useSimulationSocket.ts
│       │   ├── useVideoFrameSender.ts
│       │   ├── useTranscript.ts
│       │   └── useSimulationStore.ts
│       ├── lib/
│       │   ├── apiClient.ts
│       │   ├── constants.ts
│       │   ├── mockData.ts
│       │   ├── schemas.ts
│       │   └── utils.ts
│       ├── stores/
│       │   └── simulationStore.ts
│       └── types/
│           ├── persona.ts
│           ├── scenario.ts
│           ├── rubric.ts
│           ├── simulation.ts
│           ├── transcript.ts
│           ├── evaluation.ts
│           ├── signals.ts
│           └── avatar.ts
└── backend/
    ├── pyproject.toml
    ├── requirements.txt
    ├── .env.example
    ├── app/
    │   ├── main.py
    │   ├── config.py
    │   ├── dependencies.py
    │   ├── models/
    │   │   ├── schemas.py
    │   │   ├── persona.py
    │   │   ├── scenario.py
    │   │   ├── rubric.py
    │   │   ├── transcript.py
    │   │   ├── signals.py
    │   │   └── evaluation.py
    │   ├── routes/
    │   │   ├── health.py
    │   │   ├── personas.py
    │   │   ├── scenarios.py
    │   │   ├── rubrics.py
    │   │   ├── simulations.py
    │   │   ├── evaluations.py
    │   │   ├── video_analysis.py
    │   │   ├── audio_analysis.py
    │   │   ├── avatar.py
    │   │   └── websocket.py
    │   ├── services/
    │   │   ├── llm_service.py
    │   │   ├── persona_service.py
    │   │   ├── scenario_service.py
    │   │   ├── rubric_service.py
    │   │   ├── simulation_service.py
    │   │   ├── evaluation_service.py
    │   │   ├── transcript_service.py
    │   │   ├── video_signal_service.py
    │   │   ├── audio_signal_service.py
    │   │   ├── avatar_service.py
    │   │   └── storage_service.py
    │   ├── ml/
    │   │   ├── video/
    │   │   │   ├── frame_decoder.py
    │   │   │   ├── face_landmarks.py
    │   │   │   ├── gaze_estimator.py
    │   │   │   ├── posture_estimator.py
    │   │   │   ├── engagement_features.py
    │   │   │   └── video_signal_pipeline.py
    │   │   ├── audio/
    │   │   │   ├── audio_features.py
    │   │   │   ├── pace_estimator.py
    │   │   │   ├── filler_detector.py
    │   │   │   └── audio_signal_pipeline.py
    │   │   └── common/
    │   │       ├── feature_smoothing.py
    │   │       └── signal_types.py
    │   ├── prompts/
    │   │   ├── persona_prompt.py
    │   │   ├── scenario_prompt.py
    │   │   ├── rubric_prompt.py
    │   │   ├── simulation_prompt.py
    │   │   ├── evaluation_prompt.py
    │   │   └── avatar_prompt.py
    │   ├── storage/
    │   │   ├── db.py
    │   │   └── repositories.py
    │   └── tests/
    │       ├── test_schemas.py
    │       ├── test_persona_service.py
    │       ├── test_video_signal_service.py
    │       └── test_evaluation_service.py
    └── scripts/
        ├── run_dev.sh
        └── seed_demo.py

