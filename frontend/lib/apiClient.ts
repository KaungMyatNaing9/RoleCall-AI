const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function requestBlob(path: string, options?: RequestInit): Promise<Blob> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.blob();
}

export const api = {
  health: () => request<{ status: string; version: string }>("/health"),

  generatePersona: (body: object) =>
    request<PersonaResponse>("/personas/generate", { method: "POST", body: JSON.stringify(body) }),

  generateScenario: (body: object) =>
    request<ScenarioResponse>("/scenarios/generate", { method: "POST", body: JSON.stringify(body) }),

  generateRubric: (body: object) =>
    request<RubricResponse>("/rubrics/generate", { method: "POST", body: JSON.stringify(body) }),

  simulationRespond: (body: object) =>
    request<SimulationTurn>("/simulations/respond", { method: "POST", body: JSON.stringify(body) }),

  analyzeFrame: (body: object) =>
    request<FrameAnalysisResponse>("/video/analyze-frame", { method: "POST", body: JSON.stringify(body) }),

  summarizeVideoSession: (body: object) =>
    request<VideoSignals>("/video/summarize-session", { method: "POST", body: JSON.stringify(body) }),

  summarizeAudioSession: (body: object) =>
    request<AudioSignals>("/audio/summarize-session", { method: "POST", body: JSON.stringify(body) }),

  generateEvaluation: (body: object) =>
    request<EvaluationReport>("/evaluations/generate", { method: "POST", body: JSON.stringify(body) }),

  synthesizeVoice: (body: { text: string; persona_name?: string; voice_style?: string; voice_id?: string }) =>
    requestBlob("/voice/synthesize", { method: "POST", body: JSON.stringify(body) }),
};

// Type imports (mirroring backend models)
export interface PersonaResponse {
  id: string;
  name: string;
  age: number;
  role: string;
  mood: string;
  traits: string[];
  goal: string;
  hidden_red_flag?: string;
  behavior: string;
  voice_style: string;
  opening_line: string;
  avatar_preset: string;
  sample_lines: string[];
}

export interface ScenarioResponse {
  id: string;
  title: string;
  description: string;
  your_role: string;
  duration: string;
  objective: string;
  success_condition: string;
  difficulty: string;
  industry: string;
}

export interface RubricItem {
  name: string;
  weight: number;
  is_hot: boolean;
  description: string;
}

export interface RubricResponse {
  id: string;
  items: RubricItem[];
  total_weight: number;
}

export interface TranscriptEntry {
  speaker: string;
  timestamp: string;
  text: string;
  is_critical: boolean;
}

export interface SimulationTurn {
  session_id: string;
  turn_index: number;
  entry: TranscriptEntry;
  call_ended: boolean;
}

export interface VideoSignals {
  eye_contact_estimate: number;
  face_centered: boolean;
  head_movement_stability: number;
  facial_engagement_estimate: number;
  speaking_pace_wpm: number;
  interruption_count: number;
  filler_word_count: number;
  privacy_notice: string;
}

export interface AudioSignals {
  speaking_pace_wpm: number;
  pause_count: number;
  avg_pause_duration_s: number;
  longest_pause_s: number;
  filler_word_count: number;
  interruption_count: number;
  avg_response_time_s: number;
  total_speaking_time_s: number;
}

export interface FrameAnalysisResponse {
  signals: VideoSignals;
  frame_index: number;
  session_id: string;
}

export interface KeyMoment {
  timestamp: string;
  position_pct: number;
  type: "strong" | "improve" | "risk" | "question";
  title: string;
  excerpt: string;
  why_it_mattered?: string;
  better_response?: string;
  score_impact?: number;
}

export interface AnnotatedTurn {
  speaker: string;
  timestamp: string;
  text: string;
  tag?: "strong" | "improve" | "risk" | "question";
  tag_label?: string;
}

export interface CoachFeedback {
  did_well: string;
  missed: string;
  try_next: string;
  next_drill_title: string;
}

export interface MultimodalInsightItem {
  label: string;
  value: string;
  note?: string;
  tone: "ok" | "warn" | "bad";
}

export interface EvaluationReport {
  session_id: string;
  overall_score: number;
  skill_scores: Record<string, number>;
  key_moments: KeyMoment[];
  annotated_transcript: AnnotatedTurn[];
  multimodal_insights: MultimodalInsightItem[];
  coach_feedback: CoachFeedback;
  next_practice: Array<{ persona: string; name: string; difficulty: string; description: string; why: string }>;
  privacy_notice: string;
  duration: string;
  mode: string;
  industry: string;
  difficulty: string;
  persona_name: string;
}
