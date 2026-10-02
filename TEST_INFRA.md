# MomoTalk AI — Test Infrastructure & Automated Verification Architecture

## 1. Test Philosophy

Dynamic Student Photo Generation in Blue Archive MomoTalk is built upon a zero-backend, client-side browser SPA architecture. Because all artificial intelligence inference (LLM streaming dialogue + image generation pipelines) runs directly inside the client's browser, the testing infrastructure must satisfy four core philosophies:

1. **Progressive Testability & Decoupled Verification**:
   - Each layer of the image generation pipeline (intent classifier, character dictionary, scene synthesizers, provider request formatting, reactive store, and UI state transitions) must be verifiable in isolation without requiring active external network connections or API credits.
   - Tests assert observable behavior, structured contracts, and reproducible outputs rather than internal implementation quirks.

2. **Test Fidelity & Anti-Facade Principle**:
   - Tests never use hardcoded success facades or trivial `expect(true).toBe(true)` dummies.
   - Assertions strictly validate authentic domain logic: Danbooru character tagging accuracy, halo geometric specifications, multilingual regex coverage, URL query encoding, and HTTP JSON payloads.

3. **Zero-Perceived-Latency UX Verification**:
   - The primary UX innovation (Requirement R3) is **Dialogue-First Immediate Reply** paired with an asynchronous loading placeholder (`📷 撮影中...`).
   - The test infrastructure simulates the entire user journey: sensei prompt dispatch -> synchronous/instant intent classification -> immediate dialogue response emission (<1.5s) -> chat bubble insertion -> asynchronous image resolution -> reactive talk update.

4. **Comprehensive Multilingual Parity**:
   - MomoTalk supports 5 official locales: Japanese (`jp`), Korean (`kr`), English (`en`), Simplified Chinese (`zh`), and Traditional Chinese (`tw`).
   - Testing verifies that intent detection and UI localization keys are uniformly implemented and error-free across all 5 languages.

---

## 2. Feature Inventory Mapping

The test infrastructure maps directly to the features defined in `PROJECT.md § Feature Inventory`:

| Feature ID | Feature Name | Test Category | Target Test File | Verification Tier | Verification Command |
|---|---|---|---|---|---|
| **F1** | Technical Selection & Architecture Document | Static Verification & Spec Alignment | `docs/ARCHITECTURE_IMAGE_GEN.md` | Tier 1, 3 | Doc audit & CORS matrix check |
| **F2** | Blue Archive Danbooru Visual Dictionary | Unit & Tag Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2, 3 | `npm test` |
| **F3** | Context-Adaptive Scene Tag & Intent Detector | Unit & Multilingual Regex Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2, 3 | `npm test` |
| **F4** | 4-Tier Prompt Synthesizer | Unit & Integration Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2, 3 | `npm test` |
| **F5** | Zero-Key Free Provider (Pollinations.ai) | Unit & URL Encoding Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2 | `npm test` |
| **F6** | BYOK Providers (Fal.ai & Together AI) | Unit & HTTP Payload Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2 | `npm test` |
| **F7** | Image Service & Fault-Tolerant Fallback | Service & Timeout Mock Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2, 4 | `npm test` |
| **F8** | Dialogue-First Immediate Reply UX | Async Simulation & Latency Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 4 | `npm test` |
| **F9** | Shooting Placeholder Indicator ("📷 撮影中...") | Chat History State & Bubble Swap | `src/tests/studentImageGeneration.test.ts` | Tier 1, 4 | `npm test` |
| **F10** | Image Modal Viewer Component | Component & Event Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 4 | `npm test` |
| **F11** | SettingWindow Image Generation Tab | UI Tab & Settings Page Verification | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2 | `npm test` |
| **F12** | Settings Store Reactive Persistence | Store & LocalStorage Serialization | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2, 3 | `npm test` |
| **F13** | Multilingual i18n Localization | Translation Matrix Across 5 Locales | `src/tests/studentImageGeneration.test.ts` | Tier 1, 2 | `npm test` |
| **F14** | Automated Vitest Test Suite | Comprehensive Regression Suite | `src/tests/studentImageGeneration.test.ts` | Tier 1–4 | `npm test` |
| **F15** | Production Build & Integration Verification | TypeScript & Vite Bundle Compilation | `dist/` and `docs/` | Tier 4 | `npm run type-check && npm run build-only` |

---

## 3. Test Architecture & Environment

### 3.1 Test Runner & Environment
- **Test Engine**: `vitest` v1.6.1
- **DOM Simulation Environment**: `jsdom` (providing `window`, `document`, `localStorage`, `HTMLImageElement`, and browser navigation primitives)
- **TypeScript Type Checker**: `vue-tsc` (zero emit) validating full type conformance across `.ts` and `.vue` files.
- **Vite Path Aliasing**: `@` resolves to `./src`.

### 3.2 Mocking & Isolation Strategy
- **Network Boundaries**: External HTTP endpoints (`image.pollinations.ai`, `fal.run`, `api.together.xyz`) are simulated deterministically using `vi.stubGlobal('fetch', ...)` and URL validation helpers to ensure zero flakiness and zero remote network dependencies during automated runs.
- **State Reset**: In-memory settings and talk history stores are cleared between test cases using `beforeEach()` hooks (`localStorage.clear()`, resetting `store.imageGenEnabled = true`, `store.imageGenProvider = 'pollinations'`).
- **Timing & Asynchrony**: Virtual timers (`vi.useFakeTimers()`) and Promise resolution chains test immediate dialogue emissions and background image completion without slowing down CI runs.

---

## 4. Coverage Thresholds & 4-Tier Test Matrix

Every feature is evaluated across four rigorous tiers to guarantee production reliability.

### Tier 1: Feature Coverage (>=5 test cases per feature)

#### Feature 2: Blue Archive Danbooru Visual Dictionary
1. **Shiroko (10010)**: Resolves canonical tag `sunaookami_shiroko_(blue_archive)`, light blue halo, wolf ears, blue scarf, and Abydos uniform.
2. **Hoshino (10005)**: Resolves pink target halo, ahoge, low twintails, sleepy eyes, and heterochromia (blue/amber).
3. **Hina (10004)**: Resolves purple spiked crown halo, silver-violet hair, black horns, demon wings, and Gehenna coat.
4. **Yuuka (13010)**: Resolves dark blue twintails, blue digital geometric halo, and Millennium tech jacket.
5. **Arona (9999)**: Resolves white waterdrop halo, light blue bob, pink ribbon hairpin, whale hair accessory, and Shittim Chest uniform.
6. **Alias & Multilingual Resolution**: Resolves characters via Japanese Kanji, Hiragana/Katakana, English names, Korean Hangul, and Chinese names.

#### Feature 3: Context-Adaptive Scene Tag & Intent Detector
1. **Japanese Selfie Intents**: Accurately detects "自撮り送って", "写真送って", "写真見せて", "かわいい自撮りちょうだい".
2. **Multilingual Intents (EN/KO/ZH)**: Accurately detects "can you send me a selfie?", "take a photo for me", "사진 보내줘", "셀카 찍어줘", "拍张自拍给我".
3. **Situational & Activity Inquiries**: Accurately detects "今何してるの？写真見せて", "何食べてるの？", "what are you doing right now?".
4. **Negative / Non-Photo Conversations**: Confirms false negatives on normal dialogue ("おはよう！", "今日の予定を確認しよう", "ありがとう先生").
5. **LLM `[PHOTO: ...]` Directive Extraction**: Parses directives from assistant output streams and separates clean dialogue text from scene tags.

#### Feature 4: 4-Tier Prompt Synthesizer
1. **Aesthetic Quality Prefix**: Injects standard masterpiece tags (`masterpiece, best quality, highly detailed, anime aesthetic`).
2. **Student Identity Integration**: Combines student canonical tag, halo, hair, eyes, and outfit tags.
3. **Contextual Scene & Pose Tags**: Integrates situational tags (e.g. `selfie, holding phone, looking at viewer, classroom, soft daylight`).
4. **Negative Prompt Shield**: Enforces mandatory anti-artifact tags (`worst quality, bad anatomy, deformed halo, extra digits, multiple girls`).
5. **Outfit Variant Selection**: Allows switching between `default`, `swimsuit`, or `cycling` attire variants.

#### Feature 5: Pollinations.ai (Zero-Key Free Provider)
1. **URL Protocol & Path**: Formats valid endpoint `https://image.pollinations.ai/prompt/<encoded_prompt>`.
2. **Encoding Fidelity**: Correctly URI-encodes special characters, commas, and parentheses.
3. **Resolution Parameters**: Formats `width=1024` and `height=1024`.
4. **Clean Presentation**: Injects `nologo=true` to suppress third-party branding overlays.
5. **Model & Seed Configuration**: Injects specified model (`model=flux`) and pseudo-random seed parameter.

#### Feature 6: BYOK Providers (Fal.ai & Together AI)
1. **Fal.ai URL Endpoint**: Formats `https://fal.run/fal-ai/flux/schnell`.
2. **Fal.ai Authentication**: Sets header `Authorization: Key <FAL_KEY>`.
3. **Fal.ai JSON Payload**: Validates JSON body containing `prompt`, `image_size: 'square_hd'`, and `num_images: 1`.
4. **Together AI URL & Headers**: Formats `https://api.together.xyz/v1/images/generations` with `Authorization: Bearer <API_KEY>`.
5. **Together AI Payload**: Validates JSON body with `model: 'black-forest-labs/FLUX.1-schnell'` and `steps: 4`.

#### Feature 12: Settings Store Reactive Persistence
1. **Default Configurations**: Verifies initial state (`enabled: true`, `provider: 'pollinations'`, `model: 'flux'`).
2. **Master Switch Toggle**: Mutates `store.imageGenEnabled` and validates reactive state updates.
3. **Provider Selection**: Mutates `store.imageGenProvider` across `pollinations`, `fal`, and `together`.
4. **API Key Security**: Stores BYOK keys in browser localStorage with zero external leakage.
5. **Serialization & Deserialization**: Validates `setData()` and `getData()` roundtrip through `localStorage`.

#### Feature 13: Multilingual i18n Localization
1. **Japanese (`i18n-jp.ts`)**: All required keys present and accurately phrased.
2. **English (`i18n-en.ts`)**: All required keys present and accurately phrased.
3. **Korean (`i18n-kr.ts`)**: All required keys present and accurately phrased.
4. **Simplified Chinese (`i18n-zh.ts`)**: All required keys present and accurately phrased.
5. **Traditional Chinese (`i18n-tw.ts`)**: All required keys present and accurately phrased.

---

### Tier 2: Boundary & Corner Cases (>=5 test cases per feature category)

1. **Boundary: Empty & Whitespace Inputs**:
   - Passing `""`, `"   "`, or special control characters to `detectPhotoIntent()` returns `isPhotoRequested: false`.
2. **Boundary: Unknown / Unregistered Student**:
   - Passing unrecognized ID (e.g. `999999`) or name to `getCharacterVisualProfile()` safely returns `DEFAULT_FALLBACK_PROFILE` without crashing.
3. **Boundary: Malformed `[PHOTO: ...]` Directive**:
   - Stream containing unclosed tags `[PHOTO: selfie` or empty tags `[PHOTO:]` degrades gracefully without dropping the student dialogue text.
4. **Boundary: Special Characters & Prompt Escaping**:
   - Prompts containing quotes (`"`, `'`), parentheses (`(`, `)`), semicolons, or non-Latin text are properly sanitized and encoded for GET URLs.
5. **Boundary: Missing BYOK Credentials**:
   - Calling Fal.ai or Together AI without an API key triggers explicit configuration errors or automatic fallback to Pollinations.ai.
6. **Boundary: Corrupted LocalStorage Data**:
   - Corrupted or non-JSON values in `localStorage.getItem('image-gen-enabled')` fall back safely to defaults.
7. **Boundary: Extremes in Prompt Synthesis Options**:
   - Passing empty scene tags, undefined user message, or non-existent outfit variant defaults to canonical outfit and standard portrait pose.
8. **Boundary: Case-Insensitive Intent Detection**:
   - Uppercase/mixed-case queries (`SELFIE`, `SeNd PhOtO`, `SeLfIe PlEaSe`) correctly match intent.

---

### Tier 3: Cross-Feature Integration Combinations

1. **Combination 1: Intent Detection + LLM Stream Parsing + Prompt Synthesizer + Pollinations URL**:
   - End-to-end transformation from raw user input to final image GET request.
2. **Combination 2: Multilingual Name Lookup + Danbooru Tag Profile + BYOK Request**:
   - Student specified in Korean ("시로코") or English ("Shiroko") correctly maps to Danbooru ID `10010` and populates the Fal.ai JSON request payload.
3. **Combination 3: Feature Toggle Suppression**:
   - When `store.imageGenEnabled` is `false`, intent detector results or chat flow ignores photo generation triggers and behaves as standard text chat.
4. **Combination 4: Provider Fallback on Failure**:
   - If Fal.ai returns an error or 401 Unauthorized, client safely falls back to Pollinations.ai or in-character apology.
5. **Combination 5: Reactive Store Migration & Tab Switching**:
   - Dynamic switching of active provider in settings immediately updates the subsequent request generator output format.

---

### Tier 4: Real-World Application Scenarios

#### Scenario A: Explicit Selfie Request ("自撮り送って")
- **Sensei Action**: Sends "自撮り送って" to Shiroko (`10010`).
- **Phase 1**: Intent detector tags request as `selfie`.
- **Phase 2**: Dialogue-first response emitted (<1.5s): e.g. "自撮り？ちょっと待ってね、今撮るから！".
- **Phase 3**: Loading placeholder bubble (`📷 撮影中...`) is appended to chat.
- **Phase 4**: Visual profile synthesizes prompt (`sunaookami_shiroko_(blue_archive), halo, wolf ears, selfie, holding phone, looking at viewer`).
- **Phase 5**: Image URL resolves and smoothly swaps placeholder talk content.

#### Scenario B: Situational Inquiry ("今何してるの？")
- **Sensei Action**: Sends "今何してるの？写真見せて" to Hina (`10004`).
- **Phase 1**: Intent detector tags request as `activity`.
- **Phase 2**: Immediate dialogue emitted: "執務室で書類仕事中……休憩がてら、写真送るね。".
- **Phase 3**: Placeholder inserted into chat.
- **Phase 4**: Prompt synthesized with office desk situation (`sorasaki_hina_(blue_archive), crown halo, horns, wings, sitting at desk, schale office, paperwork`).
- **Phase 5**: Resolved image displayed in MomoTalk chat.

#### Scenario C: Non-Photo Conversational Flow
- **Sensei Action**: Sends "おはよう、今日の当番よろしくね".
- **Phase 1**: Intent detector evaluates to `isPhotoRequested: false`.
- **Phase 2**: Standard conversational reply generated without placeholder bubbles or background image calls.

#### Scenario D: Network Timeout & In-Character Apology Fallback
- **Sensei Action**: Sends "写真送って".
- **Condition**: Network offline or image provider fails after 15s timeout.
- **Phase 1**: Placeholder bubble `📷 撮影中...` is rendered.
- **Phase 2**: Failure intercepted; placeholder is gracefully replaced with in-character apology text:
  `「あれ、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね」`.
- **Outcome**: Preserves chat immersion without displaying broken image icons or unhandled exceptions.

---

## 5. Verification Commands

```bash
# 1. Run all unit and integration tests
npm test

# 2. Run specifically the student image generation test suite
npx vitest run src/tests/studentImageGeneration.test.ts

# 3. Verify TypeScript type safety with zero compilation errors
npm run type-check

# 4. Verify production bundle build
npm run build-only
```
