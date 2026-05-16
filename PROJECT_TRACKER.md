# RoleCall AI Project Tracker

Last reviewed: 2026-05-16

## Completed

- Frontend Next.js app is present and builds successfully with `npm run build` in `frontend/`.
- Core demo pages exist: landing, create, dashboard, simulation preview, setup, call, report, analyzing, and progress.
- Backend FastAPI app is present with mock endpoints for health, personas, scenarios, rubrics, simulations, video analysis, audio analysis, and evaluations.
- Backend route-level smoke test passed by calling the async route functions directly for persona generation, scenario generation, rubric generation, transcript turn generation, frame analysis, session summaries, and evaluation report generation.
- Safety wording for video signals is implemented in backend models and returned in reports.

## Cleaned Up

- Removed legacy prototype files that are not used by the current Next.js app: `RoleCall AI Prototype.html`, `design-canvas.jsx`, and `src/`.
- Removed generated Python cache folders under `backend/app/`.
- Removed generated frontend build output under `frontend/.next/`.
- Added a root `.gitignore` to keep build artifacts, Python caches, local env files, and the backend virtualenv out of version control.
- Added `httpx==0.27.2` to `backend/requirements.txt` so FastAPI/Starlette test-client support can be installed with a compatible version.

## Verified Working

- `frontend`: production build passes.
- `backend`: Python source compiles with `python3 -m compileall app`.
- `backend`: mock route flow returns valid data end-to-end.

## Issues Found

- Automated backend HTTP testing is not fully wired yet. In the system Python, `fastapi.testclient.TestClient` failed because the installed `httpx` version is too new. In the project virtualenv, `httpx` was missing entirely before this review. The requirements file is now updated to pin a compatible version, but the package still needs to be installed into the local virtualenv.
- The backend is still mostly mock/demo logic in `backend/app/services/mock_service.py`. It does not yet implement real LLM, audio, or video analysis pipelines.
- No formal automated test suite is present in the current repository state for frontend or backend behavior.
- `frontend/README.md` is still the default `create-next-app` boilerplate and does not describe this project.

## Needed Next

- Add a real automated backend test suite with pinned test dependencies, including `pytest` and a compatible `httpx` version.
- Add frontend lint/test scripts so regressions can be checked without manual review.
- Replace mock backend services with real implementations or clearly separate mock mode from production mode.
- Add API and UI error states so failed generation requests are visible to users.
- Document the actual setup and architecture in `frontend/README.md` or consolidate docs into the root `README.md`.
- Add persistent storage for sessions, personas, reports, and progress tracking.
- Implement real media handling for browser mic/camera, WebSocket session flow, and actual signal processing.

## Suggested Tracking Status

- Product shell and demo UX: done
- Mock backend demo flow: done
- Production-ready backend logic: not done
- Automated testing: not done
- Deployment readiness: not done

## Two-Person Task Split

### Person 1: Frontend and Product UX

Goal: own the Next.js app, UI reliability, and frontend-side documentation.

Files and areas to own:
- `frontend/app/**`
- `frontend/components/**`
- `frontend/lib/**`
- `frontend/stores/**`
- `frontend/package.json`
- `frontend/README.md`

Tasks:
- Add frontend lint and test scripts.
- Add visible UI error states for failed API calls during persona, scenario, rubric, and report generation.
- Review the simulation flow pages and confirm loading, empty, and failure states are handled cleanly.
- Document the real frontend setup and run flow in `frontend/README.md`.
- Keep API contract changes coordinated with Person 2, but do not edit backend route/model files unless needed for a shared contract update.

Recommended deliverables:
- Stable `npm run dev`, `npm run build`, and frontend test/lint commands.
- Clear UI handling for backend failures.
- Updated frontend documentation.

### Person 2: Backend, Testing, and Service Layer

Goal: own FastAPI reliability, automated backend tests, and backend implementation progress.

Files and areas to own:
- `backend/app/**`
- `backend/requirements.txt`
- backend test files to be added under `backend/tests/` or `backend/app/tests/`
- backend setup docs in root `README.md` if backend-specific

Tasks:
- Add backend automated tests with pinned dependencies, including `pytest` and compatible `httpx`.
- Verify HTTP-level testing works using `fastapi.testclient.TestClient` or an equivalent supported approach.
- Separate mock mode from future production mode more clearly, or begin replacing mock service paths with real implementations.
- Add backend error handling and predictable response behavior for invalid or failed generation requests.
- Define the next storage and media-processing backend milestones.

Recommended deliverables:
- Repeatable backend test command.
- Passing smoke tests for health, personas, scenarios, rubrics, simulations, audio, video, and evaluations.
- Clear backend structure for mock mode versus real implementation.

### Shared Rules To Reduce Merge Conflicts

- Person 1 should avoid editing `backend/app/**`.
- Person 2 should avoid editing `frontend/app/**`, `frontend/components/**`, and frontend styling files.
- If API request or response shapes must change, agree first on the contract, then make one small coordinated change set.
- Prefer adding new test files instead of editing many existing files at once.
- Keep documentation split: Person 1 owns `frontend/README.md`; Person 2 owns backend-related setup notes in root `README.md`.
