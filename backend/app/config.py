import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


class Settings:
    openai_api_key = os.getenv("OPENAI_API_KEY", "").strip()
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY", "").strip()
    elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY", "").strip()

    openai_model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini").strip()
    anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-latest").strip()
    elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID", "").strip()
    elevenlabs_model_id = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()
    elevenlabs_voice_female_young = os.getenv("ELEVENLABS_VOICE_FEMALE_YOUNG", "").strip()
    elevenlabs_voice_female_adult = os.getenv("ELEVENLABS_VOICE_FEMALE_ADULT", "").strip()
    elevenlabs_voice_female_senior = os.getenv("ELEVENLABS_VOICE_FEMALE_SENIOR", "").strip()
    elevenlabs_voice_male_young = os.getenv("ELEVENLABS_VOICE_MALE_YOUNG", "").strip()
    elevenlabs_voice_male_adult = os.getenv("ELEVENLABS_VOICE_MALE_ADULT", "").strip()
    elevenlabs_voice_male_senior = os.getenv("ELEVENLABS_VOICE_MALE_SENIOR", "").strip()
    elevenlabs_voice_neutral_young = os.getenv("ELEVENLABS_VOICE_NEUTRAL_YOUNG", "").strip()
    elevenlabs_voice_neutral_adult = os.getenv("ELEVENLABS_VOICE_NEUTRAL_ADULT", "").strip()
    elevenlabs_voice_neutral_senior = os.getenv("ELEVENLABS_VOICE_NEUTRAL_SENIOR", "").strip()


settings = Settings()
