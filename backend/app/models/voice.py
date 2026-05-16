from pydantic import BaseModel


class VoiceSynthesisRequest(BaseModel):
    text: str
    persona_name: str | None = None
    voice_style: str | None = None
    voice_id: str | None = None
