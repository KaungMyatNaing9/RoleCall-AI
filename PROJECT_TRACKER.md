# RoleCall AI Project Tracker

Last updated: 2026-05-16

## Purpose

This tracker is now the working source of truth for debugging, backend rebuilding, and product cleanup.

The goal is not to preserve mock UI. The goal is to make RoleCall AI work as a real multi-agent communication simulator described in [AGENTS.md](/Users/kaungmyatnaing/GitRepo/RoleCall-AI/AGENTS.md).

## Product Goal

RoleCall AI should support:

- realistic persona generation
- scenario generation
- rubric generation
- browser video, browser voice, phone-style, and text practice modes
- transcript capture
- audio signal analysis
- video interaction signal analysis
- real-time coaching
- post-session evaluation
- progress tracking

This is not a generic chatbot. It is a structured simulation and coaching product.

## Current Reality

The repo is in a mixed state:

- persona generation exists
- scenario generation exists
- rubric generation is still mostly mock-backed
- simulation reply generation exists
- ElevenLabs TTS exists
- live coaching exists, but is mostly heuristic
- video analysis backend pipeline exists, but is not fully integrated into the live call flow
- several pages still contain mock fallback UI, decorative controls, or incomplete product behavior
- some navigation items are not real features yet

## Priority Order

### P0: Core Product Reliability

These must work before anything else:

1. Create flow inputs must actually affect backend generation
2. Core simulation loop must be fully backend-driven and stable
3. Evaluation must be based on actual session data
4. Remove or stop depending on stale mock or merged-old code paths

### P1: Intelligent Agent Behavior

These make the product useful:

1. Persona Generator Agent should honor difficulty, behavior sliders, and toggles
2. Scenario Builder Agent should generate hidden goals, critical moments, and success conditions from the created persona
3. Rubric Generator Agent should honor evaluation focus and scenario risk level
4. Simulation Agent should use scenario context, memory, and progressive reveal logic
5. Coaching / Evaluation Agent should produce real guidance from transcript, audio, and video signals

### P2: Media and Real-Time Analysis

These make multimodal practice real:

1. Real browser camera flow during simulation
2. Real browser mic input and speech-to-text flow
3. Live video frame analysis integration
4. Live audio signal analysis integration
5. Useful real-time coaching sidebar with stable layout

### P3: Product Cleanup

These improve usability and remove fake surface area:

1. Editable persona, scenario, and rubric
2. Clean report page driven by real evaluation output
3. Simplified progress page driven by real session data
4. Remove or rebuild Templates, Team, and Settings

## Main Problems To Solve

### 1. Difficulty and Evaluation Focus Are Only Partially Real

Current state:

- `difficulty` is passed into persona and scenario generation
- behavior sliders and toggles from `/create` are not meaningfully used by backend generation
- evaluation focus does not yet strongly affect rubric generation, live coaching, or final evaluation

Needed:

- extend backend request handling so generation agents use:
  - emotional intensity
  - interruptions
  - hidden agenda
  - patience
  - escalation risk
  - hidden red flag toggle
  - random surprise toggle
  - light accent toggle
- use evaluation focus to shape:
  - rubric weighting
  - live coaching emphasis
  - report emphasis

Priority: `P0`

### 2. Persona Voice Diversity Is Not Strong Enough

Current state:

- ElevenLabs TTS exists
- voices are not yet robustly chosen per generated persona profile

Needed:

- infer or store persona voice attributes:
  - age band
  - gender presentation
  - tone
  - pacing
- map persona profile to different ElevenLabs voice IDs
- allow fallback voice if preferred voice is unavailable
- optionally allow override during persona editing

Priority: `P1`

### 3. Persona Editing Is Not Real Yet

Current state:

- preview page shows Edit action
- there is no real edit flow for persona data

Needed:

- editable persona form on preview
- update local session state after edit
- decide whether edits should:
  - patch only persona
  - optionally regenerate scenario and rubric

Priority: `P3`

### 4. Pre-Call Setup Buttons Are Mostly Decorative

Current state:

- setup page has buttons for mic, camera, blur, signals, drafts, settings
- most do not perform real actions

Needed:

- decide which controls are real and supported
- wire them properly
- remove decorative controls until implemented

Priority: `P2`

### 5. Video / Computer Vision Is Not Fully Working End-to-End

Current state:

- backend video analysis pipeline exists
- live call page is not fully feeding frames into backend analysis in production flow

Needed:

- send sampled camera frames from frontend call page to backend
- receive and store live video interaction signals
- generate session summary at end of call
- keep safety wording explicit

Priority: `P2`

### 6. Video Interviewing Camera and Controls Need Real Integration

Current state:

- setup requests camera access
- call page shows video layout
- camera lifecycle and button behavior are still incomplete or fragile

Needed:

- stabilize camera stream ownership between setup and call pages
- make mute, camera toggle, and related controls work reliably
- confirm direct navigation and refresh behavior

Priority: `P2`

### 7. Real-Time Coaching Sidebar Is Not Product-Ready

Current state:

- transcript tab is useful
- other tabs are partly heuristic or unclear
- long conversations can distort layout and hide controls

Needed:

- define purpose of each sidebar tab:
  - Live Notes
  - Transcript
  - Rubric
  - Signals
  - Hints
- keep transcript in its own scroll region
- keep bottom controls always visible
- show only useful real-time coaching:
  - active risk cue
  - next best action
  - suggested phrasing
  - current signal snapshot
  - rubric item currently at stake

Priority: `P2`

### 8. Evaluation Agent Is Not Fully Real Yet

Current state:

- evaluation route exists
- evaluation still falls back heavily to mock report behavior

Needed:

- real evaluation pipeline using:
  - transcript
  - scenario
  - rubric
  - audio summary
  - video summary
- return:
  - overall score
  - rubric item scores
  - key moments
  - evidence-backed improvements
  - next practice recommendation

Priority: `P0`

### 9. Report Page Needs Rework Around Real Evaluation Output

Current state:

- current report page is visually rich
- structure is still partly based on mock fallback
- too much information can feel messy

Needed:

- reduce noise
- prioritize:
  - overall outcome
  - top strengths
  - top improvement areas
  - critical moments
  - rubric breakdown
  - next recommended practice
- keep full transcript and raw signal details secondary

Priority: `P3`

### 10. Templates, Team, Settings, and Progress Need Cleanup

Current state:

- Templates is not a real working page in current app structure
- Team is not a real feature
- Settings is not a real feature
- Progress is mostly mock visualization

Needed:

- remove Team and Settings from nav unless implemented
- either build Templates around saved persona/scenario/rubric bundles or hide it
- rebuild Progress only from real stored session data

Priority: `P3`

## Execution Plan

### Phase 1: Stabilize The Core System

Goal:

- make generation, simulation, and evaluation stable without fake branches

Tasks:

1. Audit and remove stale merged-old code paths
2. Define stable backend contracts for:
   - persona
   - scenario
   - rubric
   - session
   - transcript
   - live signals
   - evaluation report
3. Make create-page controls affect backend generation
4. Make evaluation depend on real session data

Done when:

- `/create` choices meaningfully change persona/scenario/rubric
- simulation runs through backend consistently
- final report is generated from real session artifacts

### Phase 2: Build Real Agents

Goal:

- match the product architecture described in `AGENTS.md`

Agents and services to formalize:

1. Persona Generator Agent
2. Scenario Builder Agent
3. Rubric Generator Agent
4. Simulation Agent
5. Transcript Analysis Agent
6. Audio Signal Analysis Service
7. Video Signal Analysis Service
8. Coaching Report Agent

Tasks:

1. Separate prompt and generation logic by responsibility
2. Make each agent consume prior agent outputs
3. Store agent artifacts for session inspection and debugging
4. Make fallback behavior explicit instead of hidden

Done when:

- backend architecture reflects actual multi-agent product behavior

### Phase 3: Real-Time Multimodal Practice

Goal:

- make browser call modes truly multimodal and useful

Tasks:

1. Integrate camera frame streaming to backend analysis
2. Integrate real audio-derived analysis
3. Improve real-time coaching sidebar
4. Make setup/call controls truly functional

Done when:

- video, voice, phone, and text modes behave differently and meaningfully
- sidebar updates with useful live coaching

### Phase 4: Product Surface Cleanup

Goal:

- remove fake pages and polish real ones

Tasks:

1. Persona/scenario/rubric editing
2. Report page redesign
3. Progress page rebuild
4. Remove or rebuild Templates, Team, Settings

Done when:

- navigation only points to real, useful features

## First Milestone We Should Build

Recommended first milestone:

1. Make create controls truly affect backend generation
2. Make rubric generation and evaluation real
3. Then wire live video/audio analysis into the call flow

Reason:

- if generation, rubric, and evaluation are weak, the product has no useful training backbone
- real-time media analysis matters, but it is secondary to scenario quality and coaching quality

## Backend-Focused Next Work

This is the backend-first order to follow:

1. Contract audit and schema cleanup
2. Generation controls wiring
3. Rubric generator upgrade
4. Evaluation agent implementation
5. Simulation agent memory and stronger behavior control
6. Voice selection by persona
7. Video analysis integration support
8. Persistent storage for sessions, reports, and progress

## Success Criteria

The product is in a strong MVP state when:

- user choices in `/create` materially affect persona, scenario, rubric, and coaching
- generated personas sound distinct
- persona/scenario/rubric can be edited after generation
- setup and call controls actually work
- video mode really captures and analyzes frames
- real-time coaching is useful and stable
- report is based on real session data
- fake nav items and fake pages are removed or replaced
