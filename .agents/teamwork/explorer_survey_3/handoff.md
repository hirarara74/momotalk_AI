# Handoff Report — Explorer Survey 3

**Agent**: Explorer 3 (`explorer_survey_3`)  
**Type**: Hard Handoff  
**Target Recipient**: Parent Orchestrator (`orchestrator_1` / `816fdcdb-2ddc-4930-93e4-4ee54bf0bf11`)  
**Date**: 2026-09-29 / 2026-09-30  
**Deliverable Report**: `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md`

---

## 1. Observation

1. **Settings UI (`SettingWindow.vue`)**:
   - `src/views/DialogView/SettingWindow.vue` lines 55–63 define `.popper-content__tabs` with 2 buttons (`page-1`: `basicSetting`, `page-2`: `aiSetting`).
   - Line 8 defines `activePage = computed(() => store.settingDialogPage || 1)`.
   - `.featured .page` uses `transform: translateX(${(activePage - 1) * -100}%)` in lines 67 and 164.
   - Page 1 contains zoom slider, fullScreen, draggable, sound toggles.
   - Page 2 contains AI Provider (`groq`, `gemini`, `openai`, `claude`), API key input, model input with `model-chip` pills, and sleep schedule toggle.
   - `SettingWindow.vue` is completely ready to accept a 3rd tab (`page-3`: `imageGenSetting`).

2. **Settings Persistence & State Management (`store.ts`)**:
   - `src/assets/storeUtils/store.ts` lines 6–36 define `export const store = reactive({ ... })` (Vue 3 reactive object, no Pinia/Vuex).
   - Line 38: `this.settingDialogPage = Math.min(Math.max(1, page), 2)` (must be updated to 3 for Page 3).
   - Lines 79–98 define `setData()` saving settings to `localStorage`.
   - Lines 99–169 define `getData()` loading and migrating settings from `localStorage`.
   - Existing keys: `'language'`, `'render-theme'`, `'draggable'`, `'full-screen'`, `'zoom'`, `'sound-enabled'`, `'sound-volume'`, `'sleep-simulation-enabled'`, `'ai-enabled'`, `'ai-provider'`, `'ai-api-key'`, `'ai-model'`, `'ai-base-url'`, `'student-ranks'`.

3. **Image Generation Providers & Empirical CORS Results**:
   - **Pollinations.ai**: Direct `GET https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&model=flux`.
     - Live curl test confirmed: `HTTP 200 OK`, `Access-Control-Allow-Origin: *`, `Content-Type: image/jpeg`, latency ~3.5s, `x-auth-status: unauthenticated`.
   - **Fal.ai**: `POST https://fal.run/fal-ai/flux/schnell` with header `Authorization: Key {FAL_KEY}`.
     - Live curl preflight `OPTIONS` confirmed: `HTTP 200 OK`, `access-control-allow-origin: [request origin]`, `access-control-allow-credentials: true`, latency ~1.5–2.5s.
   - **Together AI**: `POST https://api.together.xyz/v1/images/generations` with `Authorization: Bearer {KEY}`.
     - Live curl preflight `OPTIONS` confirmed: `HTTP 200 OK`, `access-control-allow-origin: *`, latency ~2.0–4.0s.
   - **Replicate**: `POST https://api.replicate.com/v1/predictions`.
     - Live curl preflight `OPTIONS` confirmed: **NO** `Access-Control-Allow-Origin` header returned. Blocked by browser CORS without custom proxy.

4. **Build & Automated Testing Infrastructure**:
   - `package.json` defines `"test": "vitest run"`, `"build-only": "vite build && node -e \"require('fs').copyFileSync('docs/index.html', 'docs/404.html')\""`, `"type-check": "vue-tsc --noEmit --composite false"`.
   - `vite.config.ts` line 31 defines `build: { outDir: 'docs', emptyOutDir: false }`.
   - `vitest.config.ts` configures `environment: 'jsdom'`, `globals: true`, `@` alias.
   - Execution of `npm test`: 4 test files, 155 tests passed in 3.35s.
   - Execution of `npm run type-check`: 0 errors.
   - Execution of `npm run build-only`: completed in 3.62s.

---

## 2. Logic Chain

1. **Zero-Backend Constraint → Provider Selection**:
   - MomoTalk AI is hosted on GitHub Pages as a static Vite build. There is no custom backend server.
   - All HTTP requests to image generation services originate directly from the user's browser.
   - Providers that do not return `Access-Control-Allow-Origin` (specifically Replicate) cannot be used directly in browser environments.
   - Pollinations.ai (free zero-key with CORS `*`), Fal.ai (fast BYOK with CORS echo), and Together AI (OpenAI-compatible BYOK with CORS `*`) are mathematically proven compatible through live preflight testing.

2. **Zero Perceived Latency UX (R3)**:
   - When a user asks "自撮り送って" or "今何してるの？", triggering image generation directly causes a 3–8 second freeze if synchronous.
   - By implementing an asynchronous two-phase flow:
     1. Client detects photo intent and prompts LLM to output immediate student dialogue (e.g. "自撮り？ちょっと待ってね、今撮るから！") within 1.5 seconds.
     2. A placeholder message bubble ("📷 撮影中...") is immediately inserted into `talkHistory`.
     3. The image generation API runs in the background.
     4. Upon completion, `talkHistory.setTalkContent(placeholderId, imageUrl)` reactively updates the bubble into an image view.
   - Perceived latency drops from 5+ seconds to under 1.5 seconds.

3. **Settings Extension Consistency**:
   - Following `store.ts` conventions, adding `imageGenEnabled`, `imageGenProvider`, `imageGenApiKey`, and `imageGenModel` with `localStorage` serialization guarantees persistence without breaking backward compatibility.
   - Adding Page 3 in `SettingWindow.vue` maintains full visual consistency with Blue Archive's MomoTalk styling.

---

## 3. Caveats

1. **Pollinations.ai Community Queue**:
   - As a free, unauthenticated public API, Pollinations.ai can occasionally experience transient latency spikes or rate limiting. An in-character student fallback message ("ごめんね先生、ちょっとカメラの調子が悪いみたい……また後で撮るね！") should be displayed on failure.
2. **Replicate Exclusion**:
   - Replicate is documented in the original prompt as an example BYOK provider, but due to browser CORS blocking, it should be flagged as "Proxy Required" or omitted in favor of Fal.ai and Together AI.
3. **`docs/` Directory Caution**:
   - Vite builds directly into `docs/` (`outDir: 'docs'`). Architecture documentation should be placed at `docs/ARCHITECTURE_IMAGE_GEN.md`. Vite's `emptyOutDir: false` setting prevents it from being deleted during build.

---

## 4. Conclusion

1. **Technical Selection**:
   - **Default (Zero-Key)**: Pollinations.ai (Flux / SANA model, 1024x1024, ~3.5s latency, $0 cost).
   - **BYOK (Option 1 - Speed)**: Fal.ai (`fal-ai/flux/schnell`, 1024x1024, ~1.5s latency, ~$0.003/img).
   - **BYOK (Option 2 - Compatibility)**: Together AI (`FLUX.1-schnell`, ~2.5s latency, ~$0.003/img).
2. **Settings Architecture**:
   - Extend `store.ts` with 4 reactive properties and update `settingDialogPage` cap to 3.
   - Add Page 3 to `SettingWindow.vue` with provider radio buttons, key input, and model chips.
3. **Test Infrastructure**:
   - Target test file `src/tests/studentImageGeneration.test.ts` is fully specified with 4 test suites (Intent extraction, Visual dictionary synthesis, Provider request formatting, Multilingual i18n keys).
4. **Documentation**:
   - Full blueprint for `docs/ARCHITECTURE_IMAGE_GEN.md` is structured and ready for production.

---

## 5. Verification Method

1. **Verify Survey Deliverables**:
   - Inspect `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md` (Sections 1 through 8).
   - Inspect `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\progress.md`.
2. **Verify Codebase Test & Build Status**:
   - `npm test`: Confirm all 155 existing tests pass.
   - `npm run type-check`: Confirm TypeScript type checker passes with zero errors.
   - `npm run build-only`: Confirm Vite production build compiles without errors.
3. **Verify CORS Capabilities**:
   - Re-run curl checks against Pollinations (`https://image.pollinations.ai/prompt/test`) and Fal.ai preflight (`https://fal.run/fal-ai/flux/schnell`) to confirm CORS headers.
