## 2026-09-29T20:10:52Z
You are Worker M3 (worker_m3).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m3
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- src/assets/imageGen/providers/pollinations.ts
- src/assets/imageGen/providers/fal.ts
- src/assets/imageGen/providers/together.ts
- src/assets/imageGen/providers/index.ts
- src/assets/imageGen/imageService.ts
- src/assets/imageGen/index.ts

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\docs\ARCHITECTURE_IMAGE_GEN.md (Section 2 & 3 Provider Specifications & Service Architecture)
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\assets\imageGen\types.ts
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\assets\imageGen\promptSynthesizer.ts
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\tests\studentImageGeneration.test.ts

Task:
Implement the Image Generation Providers and central Image Service under `src/assets/imageGen/`:
1. `providers/pollinations.ts`:
   - Free/default zero-key provider.
   - Generates Pollinations image URL: `https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={random_seed}`.
   - Exports `buildPollinationsUrl(prompt: string, seed?: number): string`.
   - Exports `generatePollinationsImage(prompt: string, options?: { signal?: AbortSignal, seed?: number }): Promise<string>`.
2. `providers/fal.ts`:
   - BYOK provider calling `https://fal.run/fal-ai/flux/schnell` with header `Authorization: Key ${apiKey}`.
   - Request body: `{ prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, enable_safety_checker: true }`.
   - Exports `generateFalImage(prompt: string, apiKey: string, options?: { signal?: AbortSignal }): Promise<string>`.
3. `providers/together.ts`:
   - BYOK provider calling `https://api.together.xyz/v1/images/generations` with header `Authorization: Bearer ${apiKey}`.
   - Request body: `{ model: model || 'black-forest-labs/FLUX.1-schnell', prompt, width: 1024, height: 1024, steps: 4, n: 1, response_format: 'url' }`.
   - Exports `generateTogetherImage(prompt: string, apiKey: string, model?: string, options?: { signal?: AbortSignal }): Promise<string>`.
4. `providers/index.ts`:
   - Re-exports all provider functions and types.
5. `imageService.ts`:
   - Implements `generateStudentPhoto(studentIdOrName, context, config)`:
     - If `config.enabled === false`, returns null or throws.
     - Synthesizes 4-layer Danbooru prompt using `synthesizePrompt`.
     - Routes to selected provider (`pollinations`, `fal`, `together`).
     - If BYOK provider is missing API key or fails, gracefully falls back to Pollinations or returns in-character student failure message.
     - Handles timeout (15s) with AbortController.
     - On error, returns a student failure apology message: `ごめんね先生、ちょっとカメラの調子が悪いみたい……また後で撮るね！` (with character-appropriate tone if possible).
   - Exports `isPhotoUrl(url: string): boolean`.
   - Exports `isPhotoFailed(content: string): boolean`.
6. `index.ts`:
   - Unified re-export for `@/assets/imageGen`.

## 2026-09-29T20:20:13Z
**Context**: Milestone M3 Implementation Status Check
**Content**: Provider modules and imageService.ts have been detected in `src/assets/imageGen/`. Please run your verification commands (`npm run type-check` and `npm test`), compile your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m3\handoff.md`, and report back with your completion message so we can proceed with Milestone M4.
**Action**: Complete verification, write handoff.md, and send completion message.
