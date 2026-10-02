## 2026-09-29T20:03:24Z
You are Worker M2 (worker_m2).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m2
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- src/assets/imageGen/types.ts
- src/assets/imageGen/characterDictionary.ts
- src/assets/imageGen/sceneTags.ts
- src/assets/imageGen/intentDetector.ts
- src/assets/imageGen/promptSynthesizer.ts

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_2\report.md (Detailed tag dictionaries for all 23 prompt-supported students + Arona, regex rules, scene tag definitions, 4-tier prompt synthesis algorithm).
- c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md § Interface Contracts.

Task:
Implement the core character fidelity visual dictionary, intent detection, and prompt synthesizer modules under `src/assets/imageGen/`:
1. `types.ts`: Define all TypeScript interfaces and types (`ImageGenProviderType`, `CharacterVisualProfile`, `PhotoIntentResult`, `PromptSynthesisOptions`, `SynthesizedPrompt`, `ImageGenConfig`).
2. `characterDictionary.ts`: Implement comprehensive Danbooru visual dictionary covering all 23 prompt-supported students + Arona (numeric IDs, canonical tags, halos, hair, eyes, uniforms, accessories, and fallback profile for other students).
3. `sceneTags.ts`: Implement contextual scene tags (poses, expressions, time-of-day, locations like classroom/cafe/street/beach, lighting, and preset mapping).
4. `intentDetector.ts`: Implement multilingual photo intent detection ("自撮り送って", "写真送って", "写真見せて", "今何してるの？", "send selfie", "show photo", "what are you doing?", "셀카", "拍照", "自拍") returning `PhotoIntentResult`.
5. `promptSynthesizer.ts`: Implement 4-layer prompt synthesis (Quality aesthetic tags + Character Danbooru tags + Contextual scene/preset tags + strict negative prompt) and student name/ID resolution.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

After implementation:
Run `npm run type-check` to verify that there are zero TypeScript compiler errors.
Write your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m2\handoff.md`.
Update `progress.md`.
Notify parent (id: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11) via send_message when done.

## 2026-09-29T20:10:16Z
**Context**: Milestone M2 Completion & Traditional Chinese Intent Edge Case
**Content**: Excellent work implementing the core imageGen modules! E2E Test Writer identified one minor Traditional Chinese regex improvement in `src/assets/imageGen/intentDetector.ts`:
In `ACTIVITY_REGEX`, update the Chinese patterns to support Traditional Chinese characters as well:
e.g. `在[干幹]嘛[?？]?`, `在[干幹]什[么麼][?？]?`, `在做[什甚][么麼][?？]?`.
Please make this update, run `npm run type-check` and `npm test`, write your final `handoff.md` to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m2\handoff.md`, and report back with your completion message.
**Action**: Update intentDetector.ts, verify tests pass, write handoff.md, and reply with completion.
