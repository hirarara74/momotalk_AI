## 2026-09-29T20:03:24Z
You are Test Writer E2E (test_writer_e2e).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\test_writer_e2e
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- TEST_INFRA.md (at project root: c:\Users\USER\Documents\GitHub\momotalk-ai\TEST_INFRA.md)
- src/tests/studentImageGeneration.test.ts

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md (Section 7 Vitest Test Specification)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md § Verification Resources & Strategy

Task:
1. Create `TEST_INFRA.md` at project root following the Project Pattern template (Test Philosophy, Feature Inventory mapping, Test Architecture, Coverage Thresholds: Tier 1 Feature Coverage >=5 per feature, Tier 2 Boundary & Corner >=5 per feature, Tier 3 Cross-feature combinations, Tier 4 Real-world application scenarios).
2. Author the automated Vitest test suite at `src/tests/studentImageGeneration.test.ts` testing:
   - Intent detection across multiple languages (JA, EN, ZH, KO) and non-photo false positives.
   - Character visual dictionary resolution (Shiroko, Yuuka, Hina, Arona, fallback) and Danbooru tag consistency.
   - Context-adaptive prompt synthesis (combining student tags, scene tags, negative prompts).
   - Provider request/URL generation (Pollinations URL formatting, Fal API payloads, Together AI payloads).
   - Multilingual i18n keys for photo generation settings across all 5 language files.
   - Chat simulation scenarios (Scenario A: selfie request -> dialogue + photo; Scenario B: what are you doing -> situational photo).

Note: While M2 and M3 are implementing the code, you can import from `@/assets/imageGen/*` according to the interface contracts defined in `PROJECT.md § Interface Contracts`. Ensure your tests are clean, robust, and adhere to Vitest best practices.

Write your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\test_writer_e2e\handoff.md`.
Update `progress.md`.
Notify parent (id: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11) via send_message when done.
