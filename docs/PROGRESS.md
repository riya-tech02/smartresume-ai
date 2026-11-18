# SmartResume AI — Development Progress

## Phase 1: Project Setup & Monorepo Foundation
- **Status:** Done
- **What was built:**
  - Monorepo configured with `shared`, `server`, `client` workspaces.
  - Root build and scripts (`dev`, `build`, `test`, `typecheck`).
  - `@smartresume/shared` complete: schemas (`auth`, `resume`, `section`, `ai`, `ats`, `jobmatch`), constants (`templates`, `limits`, `palette`, `sectionTypes`), types, and `calculateCompleteness()`.
  - Shared package tests: 100% passing.
- **Tests run:** 2 tests passed.
- **Deviations:** None.

## Phase 2: Authentication & Database Integration
- **Status:** Done (Backend)
- **What was built:**
  - Mongoose models: `User`, `RefreshToken`, `Resume`, `Analysis`, `AiUsage`.
  - Secure authentication: bcrypt (cost 12), JWT (HS256 15m), rotating opaque refresh token family with reuse detection and `httpOnly` cookie (`sr_refresh`).
  - Timing equalization for non-existent users (anti-enumeration).
  - Rate limiters: global, auth (10/15m), refresh, AI, PDF, ATS.
  - User management endpoints: profile update, password change with session revocation, account deletion with full cascade, data export as JSON.
  - Auto-creation of standard sample resume on registration (PRD RES-09).
- **Tests run:** Integration tests for register, duplicate check, login, timing equalization, refresh cookie, session cascade. All passing.
- **Deviations:** None.

## Phase 3: Resume Builder Backend
- **Status:** Done (Backend)
- **What was built:**
  - Full CRUD for resumes with summary projection on lists (title, completion, lastAtsScore).
  - Optimistic concurrency control via `baseRevision` with atomic `$inc` and `409 CONFLICT_REVISION`.
  - Max 20 resumes per user limit enforcement (`409 RESUME_LIMIT_REACHED`).
  - Resume duplication with new title and reset revision.
  - IDOR protection: foreign IDs return 404.
- **Tests run:** Integration tests for list, create, update with revision increment, conflict 409, delete. All passing.
- **Deviations:** None.

## Phase 4: Templates & PDF Export Backend
- **Status:** Done (Backend)
- **What was built:**
  - Template metadata endpoint `GET /api/v1/templates` (4 templates: Modern Professional, Minimal ATS, Software Engineer, Fresher / Student).
  - Single-use 60s print token service (`PrintTokenService`).
  - Headless Chromium browser pool (`browserPool.ts`) with concurrency semaphore (`PDF_MAX_CONCURRENCY = 2`), timeouts, SSRF request interception blocking foreign origins.
  - Endpoints: `POST /api/v1/resumes/:id/pdf` and `GET /api/v1/print/resume`.
- **Tests run:** Unit & security tests for print token single-use enforcement.
- **Deviations:** None.

## Phase 5: AI Resume Assistant Backend
- **Status:** Done (Backend)
- **What was built:**
  - `LLMProvider` interface with providers: `mock` (deterministic, offline), `gemini` (Google Gemini API via HTTPS), and `openai` (OpenAI-compatible).
  - Versioned prompt builders: summary, improve-bullets, rewrite-project, suggest-skills, achievements, grammar, tailor.
  - Strict PII sanitization: email, phone, URLs, address are never sent to the LLM.
  - Fact Guard: detects unsupplied numbers, metrics, or currencies and flags with warnings.
  - Rule-based fallback suggester: triggers gracefully when LLM is unavailable/fails, returning `meta.fallback = true`.
  - Deterministic action verbs dictionary (`action-verbs.json`).
  - Quota management: daily limit tracking and consent gate.
- **Tests run:** Unit tests for Fact Guard, PII sanitization, and fallback.
- **Deviations:** None.

## Phase 6: ATS Analyzer & Job Description Matcher Backend
- **Status:** Done (Backend)
- **What was built:**
  - Pure function ATS Engine (`text.ts`, `keywords.ts`, `match.ts`, `formatting.ts`, `content.ts`, `pages.ts`, `recommendations.ts`, `scoreResume.ts`).
  - Formatting checks F1–F10 and Content checks C1–C9.
  - Comprehensive skills dictionary (`skills-dictionary.json`) with alias awareness (js -> javascript, node -> node.js, mongo -> mongodb, etc.).
  - Job description matcher with requirement extraction, matched/missing keyword rankings, and rule-based section suggestions.
  - Score persistence in `AnalysisModel` with JD privacy (raw JD not stored, only SHA-256 hash).
  - Automatic pruning to keep latest 10 analyses per resume.
- **Tests run:** 27 unit tests for ATS engine, checks, keyword aliasing, determinism, empty resume < 20, sample resume >= 70. Integration tests for `/ats`.
- **Deviations:** None.

## Current Focus: Frontend Application Development
- Now building the complete, rich React 19 + Tailwind SPA client:
  - Landing page (Hero, features, template previews, how it works, CTAs)
  - Auth pages (Login, Register with client validation)
  - App shell, navigation (sidebar, topbar, mobile drawer)
  - Dashboard (stats, resume cards, search & sort, quick actions)
  - Builder (3-pane layout, drag-and-drop reorder, section editors, autosave hook, live A4 preview with scale, template switcher)
  - 4 Resume templates (Modern Professional, Minimal ATS, Software Engineer, Fresher / Student)
  - ATS Analyzer page (Score gauge, breakdown bars, checklist, recommendations with deep-link navigation)
  - Job Matcher page (JD input, matched/missing keyword chips, section suggestions, tailored copy)
  - AI Assistant page & ✨ inline popovers
  - Settings page (profile, password change, account deletion, export data)
  - Print page (`/print` and `/resumes/:id/print`)

  ### Resume Validation Update
  - **Status:** Frontend build restored
  - **What was verified/fixed:**
    - Aligned resume creation requests with the shared `templateId` contract.
    - Added missing template metadata fields consumed by dashboard and gallery views.
    - Exported the shared summary section data type.
    - Fixed personal-link ID and URL typing in the builder.
    - Resolved server Mongoose section, date, and ATS cache type mismatches.
  - **Tests run:** Production build passes; workspace type-check passes; shared and server tests pass (46 tests).
  - **Known remaining validation:** The client Vitest suite has no test files yet. Workspace lint currently reports existing code-quality violations across the frontend and backend.

  ### Resume Navigation Fix
  - **Status:** Implemented
  - **What changed:**
    - Resume cards now open `/builder/:id` instead of nonexistent edit routes.
    - ATS card actions deep-link to `/ats?resumeId=...`.
    - Job matcher tailoring now sends `baseRevision` when renaming duplicated resumes.
    - Added the first client Vitest suite with coverage for builder and ATS resume-card navigation.
  - **Tests run:** 2 client tests passing.
