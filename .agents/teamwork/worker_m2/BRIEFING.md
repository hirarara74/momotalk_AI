# BRIEFING — 2026-09-29T20:12:00Z

## Mission
Implement Blue Archive Danbooru visual dictionary, scene tags, photo intent detection, and 4-tier prompt synthesizer modules under `src/assets/imageGen/`.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m2
- Original parent: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Milestone: M2 (Danbooru Visual Dictionary & Prompt Synthesizer)

## 🔒 Key Constraints
- Exclusive write ownership:
  - `src/assets/imageGen/types.ts`
  - `src/assets/imageGen/characterDictionary.ts`
  - `src/assets/imageGen/sceneTags.ts`
  - `src/assets/imageGen/intentDetector.ts`
  - `src/assets/imageGen/promptSynthesizer.ts`
- Integrity Mandate: genuine implementation, no dummy/facade implementations, no hardcoded test shortcuts.
- Verification: Zero TypeScript errors via `npm run type-check`, all tests green via `npm test`.

## Current Parent
- Conversation ID: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Updated: 2026-09-29T20:12:00Z

## Task Summary
- **What to build**: Core character fidelity visual dictionary (23 prompt-supported students + Arona + fallback), contextual scene tags, multilingual photo intent detector, and 4-layer prompt synthesizer.
- **Success criteria**:
  1. `types.ts` defines all contracts (`ImageGenProviderType`, `CharacterVisualProfile`, `PhotoIntentResult`, `PromptSynthesisOptions`, `SynthesizedPrompt`, `ImageGenConfig`).
  2. `characterDictionary.ts` covers 23 students + Arona + generic fallback with complete canonical Danbooru tags, halos, hair, eyes, features, uniforms.
  3. `sceneTags.ts` implements poses, expressions, time-of-day, locations, lighting, and preset mapping.
  4. `intentDetector.ts` implements multilingual intent detection for selfies, photos, activity inquiries, and `[PHOTO: ...]` tag extraction/cleanup.
  5. `promptSynthesizer.ts` implements 4-layer prompt synthesis and student name/ID resolution.
  6. `npm run type-check` passes cleanly.
- **Interface contracts**: PROJECT.md § Interface Contracts, explorer_survey_2/report.md.
- **Code layout**: `src/assets/imageGen/`.

## Key Decisions Made
- Implemented `src/assets/imageGen/types.ts` with all required interfaces (`ImageGenProviderType`, `CharacterVisualProfile`, `PhotoIntentResult`, `PromptSynthesisOptions`, `SynthesizedPrompt`, `ImageGenConfig`, `ScenePreset`, `PhotoDirectiveResult`).
- Implemented `characterDictionary.ts` with all 23 prompt-supported students + Arona (24 entries total) + `DEFAULT_FALLBACK_PROFILE` + multi-language alias resolution (JP, EN, KR, ZH-CN, ZH-TW).
- Implemented `sceneTags.ts` with 8 scene presets, location tags, time of day tags, expression tags, pose tags, lighting tags, and contextual inference.
- Implemented `intentDetector.ts` with multi-language regex classifier for selfie, direct photo, outfit, and activity ("今何してるの？", "what are you doing?", "在幹嘛？", "在做甚麼？") + `extractPhotoDirective()` for `[PHOTO: ...]` directive handling.
- Implemented `promptSynthesizer.ts` with 4-tier Danbooru prompt synthesis (Quality aesthetic tags + Character Danbooru tags + Contextual scene/preset tags + strict negative prompt) and outfit resolution.

## Change Tracker
- **Files modified**:
  - `src/assets/imageGen/types.ts`: Created core interface types.
  - `src/assets/imageGen/characterDictionary.ts`: Created visual profiles for 23 students + Arona + fallback.
  - `src/assets/imageGen/sceneTags.ts`: Created scene presets and tag mappings.
  - `src/assets/imageGen/intentDetector.ts`: Created multilingual intent detector and [PHOTO: ...] parser with full Simplified & Traditional Chinese support.
  - `src/assets/imageGen/promptSynthesizer.ts`: Created 4-tier Danbooru prompt synthesizer.
- **Build status**: `npm run type-check` passed with 0 errors. `npm test` passed with 205/205 tests passing.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Pass (0 typecheck errors, 205/205 tests passing).
- **Lint status**: Clean.
- **Tests added/modified**: Verified against `studentImageGeneration.test.ts` (all 50 tests in suite green).

## Artifact Index
- `src/assets/imageGen/types.ts` — Type definitions
- `src/assets/imageGen/characterDictionary.ts` — Student visual dictionary
- `src/assets/imageGen/sceneTags.ts` — Scene tag presets and mappings
- `src/assets/imageGen/intentDetector.ts` — Photo intent detector
- `src/assets/imageGen/promptSynthesizer.ts` — 4-tier prompt synthesizer
