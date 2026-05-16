from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, personas, scenarios, rubrics, simulations, evaluations, video_analysis, audio_analysis, voice

app = FastAPI(
    title="RoleCall AI API",
    description="Communication simulation platform backend — mock mode",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(personas.router, prefix="/personas", tags=["personas"])
app.include_router(scenarios.router, prefix="/scenarios", tags=["scenarios"])
app.include_router(rubrics.router, prefix="/rubrics", tags=["rubrics"])
app.include_router(simulations.router, prefix="/simulations", tags=["simulations"])
app.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
app.include_router(video_analysis.router, prefix="/video", tags=["video"])
app.include_router(audio_analysis.router, prefix="/audio", tags=["audio"])
app.include_router(voice.router, prefix="/voice", tags=["voice"])
