# Handoff Report — Milestone M3 (Image Generation Providers & Client Service)

## 1. Observation
- Exclusive write scope targets:
  - `src/assets/imageGen/providers/pollinations.ts`
  - `src/assets/imageGen/providers/fal.ts`
  - `src/assets/imageGen/providers/together.ts`
  - `src/assets/imageGen/providers/index.ts`
  - `src/assets/imageGen/imageService.ts`
  - `src/assets/imageGen/index.ts`
- Initial workspace inspection: None of the above 6 files existed prior to M3 execution. The directory `src/assets/imageGen/providers` was absent.
- Contract references:
  - `docs/ARCHITECTURE_IMAGE_GEN.md` (Sections 2, 3, 7.1–7.3) defines Pollinations (`flux`, GET URL format), Fal.ai (`fal-ai/flux/schnell`, `Key {apiKey}` auth, `square_hd`/`1024x1024`), Together AI (`black-forest-labs/FLUX.1-schnell`, `Bearer {apiKey}` auth), 15s timeout limit, fallback hierarchy, and student failure apologies.
  - `src/assets/imageGen/types.ts` defines `ImageGenConfig`, `ImageGenProviderType`, `PromptSynthesisOptions`.
  - `src/tests/studentImageGeneration.test.ts` defines the test expectations for URL parameter encoding, auth headers, and fallback structures.
- Verification command outputs:
  - `npm run type-check`:
    ```
    > momotalk-ai@1.0.0 type-check
    > vue-tsc --noEmit --composite false
    (Exit code 0, 0 errors)
    ```
  - `npm test`:
    ```
    Test Files  5 passed (5)
         Tests  205 passed (205)
    (Exit code 0, 100% green)
    ```
  - `npm run build-only`:
    ```
    vite v4.3.9 building for production...
    ✓ 194 modules transformed.
    rendering chunks...
    ✓ built in 3.54s
    (Exit code 0, 0 errors)
    ```

## 2. Logic Chain
1. **Pollinations Provider (`src/assets/imageGen/providers/pollinations.ts`)**:
   - As observed in Architecture doc §2.3.1, Pollinations operates client-side with zero configuration using `https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={random_seed}`.
   - Implemented `buildPollinationsUrl(prompt, seedOrOptions)` accepting either a random seed number or a `PollinationsOptions` object to satisfy both positional seed and property-based options patterns.
   - Implemented `generatePollinationsImage(prompt, options)` which supports `AbortSignal` for cancellation and returns the resolved image URL.
   - Aliased `buildPollinationsImageUrl = buildPollinationsUrl` for complete backward and cross-spec compatibility.

2. **Fal.ai Provider (`src/assets/imageGen/providers/fal.ts`)**:
   - As observed in Architecture doc §2.3.2, Fal.ai provides high-speed FLUX.1 Schnell inference (~1.2s).
   - Implemented `buildFalAiRequest(prompt, apiKey, options)` constructing a POST request targeting `https://fal.run/fal-ai/flux/schnell` with header `Authorization: Key ${apiKey}`, `Content-Type: application/json`, and body payload `{ prompt, image_size: { width: 1024, height: 1024 }, num_inference_steps: 4, enable_safety_checker: true }`.
   - Implemented `generateFalImage(prompt, apiKey, options)` validating API key existence, handling AbortSignal, executing fetch, parsing JSON response `data.images[0].url`, and raising descriptive errors on non-200 responses.

3. **Together AI Provider (`src/assets/imageGen/providers/together.ts`)**:
   - As observed in Architecture doc §2.3.3, Together AI exposes OpenAI-compatible image generations endpoint.
   - Implemented `buildTogetherAiRequest(prompt, apiKey, options)` targeting `https://api.together.xyz/v1/images/generations` with header `Authorization: Bearer ${apiKey}` and body `{ prompt, model, width: 1024, height: 1024, steps: 4, n: 1, response_format: 'url' }`.
   - Implemented `generateTogetherImage(prompt, apiKey, modelOrOptions, options)` supporting optional model overrides and signal cancellation, parsing response `data.data[0].url`.

4. **Provider Index (`src/assets/imageGen/providers/index.ts`)**:
   - Re-exports all provider functions, URL builders, and request options interfaces.

5. **Central Image Service (`src/assets/imageGen/imageService.ts`)**:
   - Implemented `generateStudentPhoto(studentIdOrName, context, config)`:
     - Returns `null` immediately when `config.enabled === false`.
     - Synthesizes 4-layer Danbooru prompt via `synthesizePrompt(promptOptions)`.
     - Creates an `AbortController` enforcing a default 15-second timeout (configurable via `context.timeoutMs`).
     - Routes to `pollinations`, `fal`, or `together`.
     - Multi-tiered resilience: If Fal.ai or Together AI key is missing or generation throws an error, the service logs a warning and automatically falls back to Pollinations.ai.
     - Total failure or timeout triggers `getStudentApologyMessage(studentIdOrName, locale)`.
   - Implemented `getStudentApologyMessage` featuring character-specific Japanese dialogue for major students (Shiroko, Hoshino, Hina, Yuuka, Arona) and authentic localized strings for EN, KR, ZH, and TW as specified in Architecture doc §7.3.
   - Implemented `isPhotoUrl(url)`: accurately detects Pollinations image URLs, Fal CDN (`fal.media`), Together CDN (`together.xyz`), data URLs, blob URLs, and standard image formats.
   - Implemented `isPhotoFailed(content)`: detects student apology messages and failure markers while rejecting valid photo URLs and placeholders.

6. **Unified Package Root (`src/assets/imageGen/index.ts`)**:
   - Re-exports types, character dictionary, scene tags, intent detector, prompt synthesizer, providers, and image service under `@/assets/imageGen`.

## 3. Caveats
- Direct browser network calls to Fal.ai or Together AI require valid BYOK keys. When testing without keys or during provider outages, the automatic fallback to Pollinations.ai activates seamlessly.
- Pollinations.ai operates over public GPU resources; the 15-second AbortController timeout guarantees the chat UI will never deadlock if public endpoints experience high latency spikes.

## 4. Conclusion
Milestone M3 is 100% complete and fully verified. All 6 files within exclusive write ownership are implemented with genuine logic, strict TypeScript typing, and full architectural compliance. No test files, UI components, or unrelated sources outside our ownership were modified. All 205 unit tests pass and production build succeeds without issues.

## 5. Verification Method
To independently verify:
1. Run type check:
   ```powershell
   npm run type-check
   ```
   *Expected outcome*: Exits with code 0 (no TypeScript errors).
2. Run test suite:
   ```powershell
   npm test
   ```
   *Expected outcome*: 5/5 test files pass (205/205 tests green).
3. Run production build:
   ```powershell
   npm run build-only
   ```
   *Expected outcome*: Vite builds client bundle into `docs/` cleanly in ~3.5s.
4. Verify exports:
   Importing from `@/assets/imageGen` provides access to `generateStudentPhoto`, `buildPollinationsUrl`, `generateFalImage`, `generateTogetherImage`, `isPhotoUrl`, `isPhotoFailed`, and `getStudentApologyMessage`.
