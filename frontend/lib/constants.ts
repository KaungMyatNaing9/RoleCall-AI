export const INDUSTRIES = [
  { id: "healthcare", label: "Healthcare" },
  { id: "customer-service", label: "Customer Service" },
  { id: "sales", label: "Sales" },
  { id: "hr-interview", label: "HR Interview" },
  { id: "education", label: "Education" },
  { id: "finance", label: "Finance" },
  { id: "hospitality", label: "Hospitality" },
  { id: "custom", label: "Custom" },
];

export const MODES = [
  { id: "phone", label: "Phone Call", desc: "Audio only · authentic phone UI" },
  { id: "voice", label: "Web Voice", desc: "Browser mic + transcript" },
  { id: "video", label: "Web Video", desc: "Camera + nonverbal signals", premium: true },
  { id: "text", label: "Text / Chat", desc: "For reading speed practice" },
];

export const EVALUATION_CRITERIA = [
  "Empathy", "Clarity", "Professionalism", "Active listening", "Escalation",
  "Compliance", "Customer sat.", "STAR", "Discovery", "De-escalation",
  "Nonverbal presence", "Eye-contact estimate", "Speaking pace", "Filler words",
  "Interruptions", "Turn-taking",
];

export const PRIVACY_NOTICE =
  "Video interaction signals are coaching estimates. They are not emotion detection, truth detection, psychological assessment, or medical assessment.";

export const MOCK_TRANSCRIPT = [
  { speaker: "patient", timestamp: "00:15", text: "Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.", is_critical: false },
  { speaker: "patient", timestamp: "00:52", text: "Oh dear, I have so many bottles here… I'm not sure which is the water pill and which is the blood pressure one.", is_critical: false },
  { speaker: "patient", timestamp: "01:30", text: "They told me in the hospital but I was still groggy and I forgot to write it down.", is_critical: false },
  { speaker: "patient", timestamp: "02:10", text: "I think I took one this morning but now I'm second-guessing myself.", is_critical: false },
  { speaker: "patient", timestamp: "02:41", text: "I also feel a little tightness in my chest, but maybe I'm just nervous.", is_critical: true },
  { speaker: "patient", timestamp: "03:15", text: "Should I be worried about that? The tightness, I mean.", is_critical: false },
  { speaker: "patient", timestamp: "04:00", text: "I don't want to be a bother — should I call 911?", is_critical: false },
  { speaker: "patient", timestamp: "04:50", text: "Thank you so much, dear. You've been very patient with me.", is_critical: false },
];
