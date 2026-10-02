## 2026-09-29T20:03:24Z

You are Worker M1 (worker_m1).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m1
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- docs/ARCHITECTURE_IMAGE_GEN.md

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md (Section 8 Architecture Document Blueprint & Provider Benchmarks)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_2\report.md (Danbooru Visual Dictionary & Prompt Engine Design)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_1\report.md (Chat UI & Perceived Latency Architecture)

Task:
Produce the comprehensive, production-grade technical selection, provider comparison, and architecture design document at `docs/ARCHITECTURE_IMAGE_GEN.md`.
It must cover:
1. Executive Summary & Goals (Dynamic photo generation in MomoTalk, perceived latency optimization, zero-key default + BYOK).
2. Provider Technical Evaluation & Selection (Empirical latency, cost, quality comparison: Pollinations.ai vs Fal.ai vs Together AI vs Replicate, with CORS empirical findings and client-side browser suitability).
3. System Architecture & Component Interaction (Data flow diagram, interaction between send.ts, ChatDraggable.vue, ImageModalViewer.vue, imageService.ts, and providers).
4. Blue Archive Character Fidelity Engine (Danbooru tag dictionary schema, halo/hair/eye/uniform taxonomy, negative safety prompts).
5. Perceived Latency UX & Asynchronous Flow (Dialogue-first response within 1.5s, "📷 撮影中..." placeholder bubble, reactive replacement, click-to-enlarge modal).
6. Security, API Key Protection & BYOK Policy (Client-side localStorage storage, no server backend, CORS compliance, sanitization).
7. Fallback & Resilience Strategy (Timeout handling, network failure in-character student apologies, rate-limiting mitigation).
8. Verification & Test Plan (Vitest test matrix, scenarios A/B).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

After creating `docs/ARCHITECTURE_IMAGE_GEN.md`:
Run `npm run build-only` to ensure the project builds properly without breaking docs output.
Write your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m1\handoff.md`.
Update `progress.md`.
Notify parent (id: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11) via send_message when done.
