"use client";
import { create } from "zustand";
import type { AudioSignals, EvaluationReport, LiveCoaching, PersonaResponse, RubricResponse, ScenarioResponse, VideoSignals } from "@/lib/apiClient";

interface SimulationState {
  // Wizard
  mode: string | null;
  industry: string | null;
  personaPrompt: string;
  difficulty: string;
  difficultySliders: Record<string, number>;
  behaviorToggles: Record<string, boolean>;
  evaluationFocus: string[];
  currentStep: number;

  // Generated
  persona: PersonaResponse | null;
  scenario: ScenarioResponse | null;
  rubric: RubricResponse | null;
  simulationId: string | null;
  isGenerating: boolean;
  agentLog: Array<{ agent: string; color: string; message: string }>;

  // Pre-call
  consentVideoSignals: boolean;
  consentAudioSignals: boolean;
  consentSaveRecording: boolean;
  consentSaveTranscript: boolean;

  // Live call
  callStartTime: number | null;
  callElapsed: number;
  transcript: Array<{ speaker: string; timestamp: string; text: string; is_critical: boolean }>;
  liveSignals: VideoSignals;
  liveAudioSignals: AudioSignals;
  liveCoaching: LiveCoaching | null;
  criticalMomentVisible: boolean;
  criticalMomentMessage: string;
  isMuted: boolean;
  isCameraOff: boolean;
  callState: "idle" | "active" | "ended";

  // Report
  report: EvaluationReport | null;

  // Actions
  setMode: (mode: string) => void;
  setIndustry: (industry: string) => void;
  setPersonaPrompt: (p: string) => void;
  setDifficulty: (d: string) => void;
  setEvaluationFocus: (tags: string[]) => void;
  setCurrentStep: (step: number) => void;
  setPersona: (p: PersonaResponse) => void;
  setScenario: (s: ScenarioResponse) => void;
  setRubric: (r: RubricResponse) => void;
  setSimulationId: (id: string) => void;
  setIsGenerating: (v: boolean) => void;
  setAgentLog: (log: Array<{ agent: string; color: string; message: string }>) => void;
  setConsent: (key: keyof Pick<SimulationState, "consentVideoSignals" | "consentAudioSignals" | "consentSaveRecording" | "consentSaveTranscript">, value: boolean) => void;
  startCall: () => void;
  endCall: () => void;
  addTranscriptEntry: (entry: SimulationState["transcript"][0]) => void;
  setLiveSignals: (signals: VideoSignals) => void;
  setLiveAudioSignals: (signals: AudioSignals) => void;
  setLiveCoaching: (coaching: LiveCoaching | null) => void;
  triggerCriticalMoment: (message: string) => void;
  dismissCriticalMoment: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  setReport: (report: EvaluationReport) => void;
  reset: () => void;
}

const DEFAULT_SIGNALS: VideoSignals = {
  eye_contact_estimate: 0.62,
  face_centered: true,
  head_movement_stability: 0.78,
  facial_engagement_estimate: 0.84,
  speaking_pace_wpm: 164,
  interruption_count: 3,
  filler_word_count: 12,
  privacy_notice: "Video interaction signals are coaching estimates. They are not emotion detection, truth detection, psychological assessment, or medical assessment.",
};

const DEFAULT_AUDIO_SIGNALS: AudioSignals = {
  speaking_pace_wpm: 132,
  pause_count: 1,
  avg_pause_duration_s: 1.6,
  longest_pause_s: 2.3,
  filler_word_count: 0,
  interruption_count: 0,
  avg_response_time_s: 1.8,
  total_speaking_time_s: 0,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  mode: null,
  industry: null,
  personaPrompt: "",
  difficulty: "Medium",
  difficultySliders: { emotional_intensity: 0.4, interruptions: 0.25, hidden_agenda: 0.6, patience: 0.7, escalation_risk: 0.55 },
  behaviorToggles: { hidden_red_flag: true, random_surprise: true, light_accent: false },
  evaluationFocus: ["Empathy", "Clarity", "Active listening", "Escalation", "Nonverbal presence", "Eye-contact estimate"],
  currentStep: 1,

  persona: null,
  scenario: null,
  rubric: null,
  simulationId: null,
  isGenerating: false,
  agentLog: [],

  consentVideoSignals: true,
  consentAudioSignals: true,
  consentSaveRecording: false,
  consentSaveTranscript: true,

  callStartTime: null,
  callElapsed: 0,
  transcript: [],
  liveSignals: DEFAULT_SIGNALS,
  liveAudioSignals: DEFAULT_AUDIO_SIGNALS,
  liveCoaching: null,
  criticalMomentVisible: false,
  criticalMomentMessage: "",
  isMuted: false,
  isCameraOff: false,
  callState: "idle",

  report: null,

  setMode: (mode) => set({ mode }),
  setIndustry: (industry) => set({ industry }),
  setPersonaPrompt: (personaPrompt) => set({ personaPrompt }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setEvaluationFocus: (evaluationFocus) => set({ evaluationFocus }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setPersona: (persona) => set({ persona }),
  setScenario: (scenario) => set({ scenario }),
  setRubric: (rubric) => set({ rubric }),
  setSimulationId: (simulationId) => set({ simulationId }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setAgentLog: (agentLog) => set({ agentLog }),
  setConsent: (key, value) => set({ [key]: value } as Partial<SimulationState>),
  startCall: () => set({
    callStartTime: Date.now(),
    callElapsed: 0,
    callState: "active",
    transcript: [],
    liveSignals: DEFAULT_SIGNALS,
    liveAudioSignals: DEFAULT_AUDIO_SIGNALS,
    liveCoaching: null,
    criticalMomentVisible: false,
    criticalMomentMessage: "",
  }),
  endCall: () => set({ callState: "ended" }),
  addTranscriptEntry: (entry) => set((s) => ({ transcript: [...s.transcript, entry] })),
  setLiveSignals: (liveSignals) => set({ liveSignals }),
  setLiveAudioSignals: (liveAudioSignals) => set({ liveAudioSignals }),
  setLiveCoaching: (liveCoaching) => set({ liveCoaching }),
  triggerCriticalMoment: (message) => set({ criticalMomentVisible: true, criticalMomentMessage: message }),
  dismissCriticalMoment: () => set({ criticalMomentVisible: false }),
  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleCamera: () => set((s) => ({ isCameraOff: !s.isCameraOff })),
  setReport: (report) => set({ report }),
  reset: () => set({
    mode: null, industry: null, personaPrompt: "", currentStep: 1,
    persona: null, scenario: null, rubric: null, simulationId: null,
    isGenerating: false, agentLog: [], callState: "idle", transcript: [],
    liveSignals: DEFAULT_SIGNALS, liveAudioSignals: DEFAULT_AUDIO_SIGNALS,
    liveCoaching: null, criticalMomentVisible: false, criticalMomentMessage: "", report: null,
  }),
}));
