# BRIEFING — 2026-09-29T20:03:00Z

## Mission
Survey the MomoTalk codebase for Settings UI & persistence, Image Gen Providers (Free Pollinations vs BYOK Fal/Together/Replicate & CORS), Build & Vitest test infra, and Architecture Doc requirements.

## 🔒 My Identity
- Archetype: explorer
- Roles: codebase investigation, technical selection survey, test & build infrastructure audit
- Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3
- Original parent: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Milestone: Initial Survey & Architecture Investigation

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Produce comprehensive survey report at `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md`
- Maintain progress.md heartbeat
- Generate handoff.md before notifying parent

## Current Parent
- Conversation ID: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Updated: 2026-09-29T20:03:00Z

## Investigation State
- **Explored paths**:
  - `src/views/DialogView/SettingWindow.vue` & `dialog-view.scss`
  - `src/assets/storeUtils/store.ts` & `talkHistory.ts`
  - `src/views/ChatView/ChatDraggable.vue` & `ChatView.vue`
  - `src/assets/chatUtils/send.ts`
  - `package.json`, `vite.config.ts`, `vitest.config.ts`
  - Existing test suite (`src/tests/*`)
  - Live API CORS tests for Pollinations.ai, Fal.ai, Together AI, Replicate
  - Synthesized reports from Explorer 1 and Explorer 2
- **Key findings**:
  - Pollinations.ai works zero-key with CORS `*` (~3.5s latency).
  - Fal.ai (`fal.run`) and Together AI (`v1/images/generations`) support browser CORS directly via BYOK.
  - Replicate blocks browser CORS (requires backend proxy, not suitable for direct client-side).
  - State management uses Vue 3 `reactive()` and `localStorage` (no Pinia).
  - SettingWindow currently supports 2 tabs, easily extensible to 3 tabs (`imageGenSetting`).
  - Vitest runs 155 tests in 3.35s; clean test suite ready for `studentImageGeneration.test.ts`.
- **Unexplored areas**: None for survey scope. Implementation plan fully detailed.

## Key Decisions Made
- Confirmed dual-provider architecture: Free zero-key Pollinations default + Fast Fal.ai & Together AI BYOK.
- Designed two-phase optimistic UX (dialogue <1s -> "📷 撮影中..." placeholder -> swap to photo).
- Defined target test suite structure with 4 major test blocks.

## Artifact Index
- DISPATCH.md — record of incoming dispatch messages
- progress.md — liveness and task checklist
- report.md — comprehensive survey report (completed)
- handoff.md — 5-component handoff report
