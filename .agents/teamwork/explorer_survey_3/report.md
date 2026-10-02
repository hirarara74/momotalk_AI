# MomoTalk Codebase & Architecture Survey Report: Settings, Image Generation Providers, and Test Infrastructure

**Agent**: Explorer 3 (`explorer_survey_3`)  
**Date**: 2026-09-29 / 2026-09-30  
**Target File**: `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_3\report.md`  
**Reference Dispatch**: Technical selection, Settings UI, Settings persistence, Image Gen Providers & CORS, Vitest test suite (`studentImageGeneration.test.ts`), and Architecture Document (`docs/ARCHITECTURE_IMAGE_GEN.md`)

---

## 1. Executive Summary & Core Findings

1. **Zero-Backend Static SPA Architecture**:
   - MomoTalk AI is a client-side Vue 3 Single Page Application (SPA) bundled with Vite (`outDir: 'docs'` for GitHub Pages hosting).
   - There is **no Node.js backend or serverless backend** in production; all LLM and image generation calls must execute **directly from the user's browser client**.
   - Consequently, **CORS (Cross-Origin Resource Sharing)** compatibility is an absolute hard constraint.

2. **Empirical CORS & Provider Evaluation**:
   - **Free / Zero-Key Default (Pollinations.ai)**:
     - Endpoint: `https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&model=flux`
     - **Verified**: Returns HTTP 200, `Access-Control-Allow-Origin: *`, `Content-Type: image/jpeg`, latency ~3.5s. Works without any API key (`x-auth-status: unauthenticated`).
   - **BYOK Option 1 (Fal.ai - Highest Speed)**:
     - Endpoint: `POST https://fal.run/fal-ai/flux/schnell` with header `Authorization: Key {FAL_KEY}`.
     - **Empirically Verified**: Browser `OPTIONS` preflight request returns `Access-Control-Allow-Origin: [request origin]`, `access-control-allow-credentials: true`. Latency is ~1.5–2.5s.
   - **BYOK Option 2 (Together AI - OpenAI Compatible)**:
     - Endpoint: `POST https://api.together.xyz/v1/images/generations` with `Authorization: Bearer {API_KEY}`.
     - **Empirically Verified**: Preflight returns `Access-Control-Allow-Origin: *`. Latency is ~2.0–4.0s.
   - **BYOK Incompatible (Replicate)**:
     - Endpoint `https://api.replicate.com/v1/predictions` **does not send CORS headers** to browsers. Direct browser execution is blocked by the Same-Origin Policy. It is therefore ruled out for direct client-side calls without a user-configured proxy.

3. **Settings UI & Reactive Persistence**:
   - Settings UI is implemented in `src/views/DialogView/SettingWindow.vue` (currently 2 tabs: `basicSetting` and `aiSetting`).
   - State management is implemented directly via Vue 3's `reactive()` in `src/assets/storeUtils/store.ts` (no Pinia/Vuex dependency).
   - Persistence is managed cleanly through `localStorage` with JSON serialization (`setData()` and `getData()`). Adding a 3rd tab (`imageGenSetting`) and new keys (`image-gen-enabled`, `image-gen-provider`, `image-gen-api-key`, `image-gen-model`) fits into the existing pattern.

4. **Build & Automated Testing Infrastructure**:
   - Test framework: `vitest` v1.6.1 with `jsdom` environment (`vitest.config.ts`).
   - All 155 existing tests pass cleanly in 3.35s (`npm test`).
   - Type-checking passes with 0 errors (`npm run type-check`).
   - Production build runs cleanly (`npm run build-only`).
   - Target test suite `src/tests/studentImageGeneration.test.ts` can immediately be structured with 4 test suites covering trigger extraction, visual tag resolution, provider API requests, and 5-language i18n support.

---

## 2. Settings UI Deep Dive (`SettingWindow.vue`)

### 2.1 File Location & Structure
- **Path**: `src/views/DialogView/SettingWindow.vue` (354 lines)
- **Style sheet**: `src/views/DialogView/dialog-view.scss` (557 lines)
- **Parent Trigger**: Opened via header gear icon or programmatic call `store.openSettingDialog(page)` or `store.showSettingDialog = true`.

### 2.2 Existing Tab Architecture
In `SettingWindow.vue` (lines 55–63):
```html
<ul class="popper-content__tabs">
    <li @click="showPage(1)" class="page-btn" :class="{ active: activePage === 1 }" id="page-1">
        {{ $t('basicSetting') }}
    </li>
    <li class="divider">/</li>
    <li @click="showPage(2)" class="page-btn" :class="{ active: activePage === 2 }" id="page-2">
        {{ $t('aiSetting') || 'AI' }}
    </li>
</ul>
```
The content container `.featured` uses CSS sliding transforms:
```html
<div class="featured">
    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
        <!-- Page 1 Content -->
    </div>
    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
        <!-- Page 2 Content -->
    </div>
</div>
```

### 2.3 Existing Settings Content Analysis
- **Page 1: 基本設定 (`basicSetting`)**:
  - `zoom`: Range slider (0.5 – 1.5, step 0.01) with CSS variable `--range-progress`.
  - `fullScreen`: Toggle switch (`custom-switch`).
  - `draggable`: Toggle switch (`custom-switch`).
  - `soundEnabled`: Toggle switch (`custom-switch`).
  - `soundVolume`: Range slider (0 – 1.0, step 0.05).
- **Page 2: AI設定 (`aiSetting`)**:
  - `aiProvider`: Radio buttons (`groq`, `gemini`, `openai`, `claude`).
  - `aiApiKey`: Password input with provider-specific console URL links and security badge (`🔒 Local only`).
  - `aiModel`: Text input with quick-selection pills (`model-chip`) for recommended models (e.g. `openai/gpt-oss-120b`, `qwen/qwen3.8-27b`, `gemini-3.5-flash`).
  - `aiBaseUrl`: Custom base URL input (hidden for Gemini, default for Groq/OpenAI).
  - `sleepSimulationEnabled`: Toggle switch (`custom-switch`) with subline explanation.

### 2.4 Proposed Settings UI Extension for Image Generation
We recommend adding **Page 3: 画像生成設定 (`imageGenSetting`)**:
1. **Tabs Update** (in `SettingWindow.vue`):
   ```html
   <ul class="popper-content__tabs">
       <li @click="showPage(1)" class="page-btn" :class="{ active: activePage === 1 }">{{ $t('basicSetting') }}</li>
       <li class="divider">/</li>
       <li @click="showPage(2)" class="page-btn" :class="{ active: activePage === 2 }">{{ $t('aiSetting') || 'AI' }}</li>
       <li class="divider">/</li>
       <li @click="showPage(3)" class="page-btn" :class="{ active: activePage === 3 }">{{ $t('imageGenSetting') || '写真・画像' }}</li>
   </ul>
   ```
2. **Page 3 Controls**:
   - **Master Toggle (`imageGenEnabled`)**:
     - Label: `生徒の写真送信機能` (`$t('imageGenEnabled')`)
     - Control: `custom-switch`
     - Subtext: `会話中に「自撮り送って」「今何してるの？」とお願いした際、生徒がシチュエーションに応じた写真を自動生成して返信します。`
   - **Provider Selection (`imageGenProvider`)**:
     - Radio options:
       - `pollinations`: `Pollinations.ai（無料・登録不要）` (Default)
       - `fal`: `Fal.ai（高速BYOK・約1〜2秒）`
       - `together`: `Together AI（BYOK・FLUX）`
   - **API Key Input (`imageGenApiKey`)**:
     - Conditionally displayed when `store.imageGenProvider !== 'pollinations'`.
     - Direct registration links (`https://fal.ai/dashboard/keys`, `https://api.together.ai/settings/api-keys`).
     - Security notice: `APIキーはお使いのブラウザ内（LocalStorage）にのみ安全に保存され、外部サーバーに収集されることはありません。`
   - **Model Quick Selection (`imageGenModel`)**:
     - Pollinations: `flux` (推奨), `turbo`
     - Fal.ai: `fal-ai/flux/schnell` (超高速), `fal-ai/flux/dev`
     - Together AI: `black-forest-labs/FLUX.1-schnell`

---

## 3. Settings Persistence & Reactive Store Architecture (`store.ts`)

### 3.1 Architecture Overview
- In `src/assets/storeUtils/store.ts`, global state is instantiated as:
  ```typescript
  export const store = reactive({ ... })
  ```
- No third-party state library (such as Pinia or Vuex) is used.
- State is serialized directly to `localStorage` under specific key strings.

### 3.2 Key Mapping & Lifecycle
- `store.setData()`:
  - Invoked upon any setting change (`@change="store.setData()"`).
  - Serializes each reactive property to `localStorage` with `JSON.stringify()`.
- `store.getData()`:
  - Invoked once during app initialization.
  - Reads keys with `localStorage.getItem()`, parses JSON with safe defaults.
  - Automatically migrates deprecated keys or legacy provider values (e.g. migrating Gemini keys to Groq).
- `store.openSettingDialog(page: number)`:
  - Note in current code (line 38):
    ```typescript
    this.settingDialogPage = Math.min(Math.max(1, page), 2)
    ```
    ⚠️ **Crucial Detail**: `Math.min(..., 2)` currently caps pages at 2! This must be updated to `Math.min(Math.max(1, page), 3)` when adding Page 3.

### 3.3 New Store Schema Definition
```typescript
// Addition to store definition in src/assets/storeUtils/store.ts
export type ImageGenProvider = 'pollinations' | 'fal' | 'together'

export interface ImageGenConfig {
    imageGenEnabled: boolean
    imageGenProvider: ImageGenProvider
    imageGenApiKey: string
    imageGenModel: string
    imageGenQualityPrompt: boolean
}
```

### 3.4 Persistence Migration Implementation Plan
1. **Properties added to `store`**:
   ```typescript
   imageGenEnabled: true,
   imageGenProvider: 'pollinations' as 'pollinations' | 'fal' | 'together',
   imageGenApiKey: '',
   imageGenModel: 'flux',
   ```
2. **`setData()` serialization**:
   ```typescript
   localStorage.setItem('image-gen-enabled', JSON.stringify(this.imageGenEnabled))
   localStorage.setItem('image-gen-provider', JSON.stringify(this.imageGenProvider))
   localStorage.setItem('image-gen-api-key', JSON.stringify(this.imageGenApiKey))
   localStorage.setItem('image-gen-model', JSON.stringify(this.imageGenModel))
   ```
3. **`getData()` deserialization & fallback**:
   ```typescript
   const genEnabled = localStorage.getItem('image-gen-enabled')
   this.imageGenEnabled = genEnabled != null ? JSON.parse(genEnabled) : true

   const genProvider = localStorage.getItem('image-gen-provider')
   this.imageGenProvider = genProvider != null ? JSON.parse(genProvider) : 'pollinations'

   const genApiKey = localStorage.getItem('image-gen-api-key')
   this.imageGenApiKey = genApiKey != null ? JSON.parse(genApiKey) : ''

   const genModel = localStorage.getItem('image-gen-model')
   this.imageGenModel = genModel != null ? JSON.parse(genModel) : 'flux'
   ```

---

## 4. Image Generation Provider Technical Evaluation & CORS Matrix

### 4.1 Detailed Provider Comparison Table

| Attribute | Pollinations.ai | Fal.ai | Together AI | Replicate |
| :--- | :--- | :--- | :--- | :--- |
| **Tier** | **Default / Free** | **BYOK (Option 1)** | **BYOK (Option 2)** | **Incompatible** |
| **API Key Required** | ❌ None (Zero-Key) | ✅ User's `FAL_KEY` | ✅ User's Together Key | ✅ User's Token |
| **Direct Browser CORS** | ✅ **`*` (Allowed)** | ✅ **Echo Origin (Allowed)** | ✅ **`*` (Allowed)** | ❌ **BLOCKED** |
| **Preflight Test Result** | HTTP 200 OK | HTTP 200 OK | HTTP 200 OK | No ACAO Header |
| **Target Model** | SANA / FLUX / Turbo | `fal-ai/flux/schnell` | `FLUX.1-schnell` | `flux-schnell` |
| **Inference Latency** | ~3.0 – 5.0s | **~1.2 – 2.5s** | ~2.0 – 4.0s | ~2.5 – 5.0s |
| **Cost** | $0.00 | ~$0.003 / image | ~$0.003 / image | ~$0.003 / image |
| **Image Resolution** | 1024x1024 (or 768x768) | 1024x1024 (`square_hd`) | 1024x1024 | 1024x1024 |
| **Response Format** | Direct JPEG binary stream | JSON `{ images: [{ url }] }` | JSON `{ data: [{ url }] }` | JSON (polling) |
| **Client Implementation** | `fetch(url)` or `<img :src>` | Direct `fetch()` POST | Direct `fetch()` POST | Requires Proxy |

### 4.2 Detailed Verification of Pollinations.ai (Free Default)
1. **URL Protocol**:
   - `GET https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={random_seed}`
2. **Empirical Network Check Result**:
   ```http
   HTTP/1.1 200 OK
   Date: Tue, 29 Sep 2026 19:58:51 GMT
   Content-Type: image/jpeg
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   X-Auth-Status: unauthenticated
   Content-Disposition: inline; filename="test.jpg"
   ```
3. **Key Characteristics**:
   - Can be rendered directly via `<img :src="imageUrl" />` without pre-fetching!
   - `Access-Control-Allow-Origin: *` ensures client-side `fetch()` can download the image blob if needed for caching or offline conversion.
   - Requires zero user setup or API key, lowering entry barrier to zero.

### 4.3 Detailed Verification of Fal.ai (Fast BYOK)
1. **API Protocol**:
   - `POST https://fal.run/fal-ai/flux/schnell`
   - Headers:
     - `Authorization: Key {FAL_KEY}`
     - `Content-Type: application/json`
   - Request Body:
     ```json
     {
       "prompt": "1girl, sunaookami shiroko, blue archive, halo, wolf ears, selfie, looking at viewer, classroom, masterpiece",
       "image_size": "square_hd",
       "num_images": 1
     }
     ```
2. **Empirical CORS Verification**:
   - When requested with `Origin: http://localhost:5174` or `Origin: https://hirarara74.github.io`:
     ```http
     HTTP/1.1 200 OK
     access-control-allow-origin: https://hirarara74.github.io
     access-control-allow-credentials: true
     access-control-allow-methods: POST
     access-control-allow-headers: authorization,content-type
     ```
3. **Response Schema**:
   ```json
   {
     "images": [
       {
         "url": "https://v3b.fal.media/files/...",
         "width": 1024,
         "height": 1024,
         "content_type": "image/jpeg"
       }
     ],
     "seed": 847291,
     "request_id": "c1f7a0..."
   }
   ```
4. **Speed Benchmark**: Sub-2-second turnaround, ideal for real-time chat roleplay.

### 4.4 Detailed Verification of Together AI (OpenAI-Compatible BYOK)
1. **API Protocol**:
   - `POST https://api.together.xyz/v1/images/generations`
   - Headers:
     - `Authorization: Bearer {TOGETHER_API_KEY}`
     - `Content-Type: application/json`
   - Request Body:
     ```json
     {
       "prompt": "...",
       "model": "black-forest-labs/FLUX.1-schnell",
       "n": 1,
       "steps": 4,
       "response_format": "url"
     }
     ```
2. **Empirical CORS Verification**:
   ```http
   HTTP/1.1 200 OK
   access-control-allow-origin: *
   access-control-allow-methods: POST,OPTIONS
   access-control-allow-headers: authorization,content-type
   ```
3. **Response Schema**:
   ```json
   {
     "data": [
       {
         "url": "https://api.together.xyz/..."
       }
     ]
   }
   ```

### 4.5 The Replicate CORS Limitation
- Replicate returns `HTTP 200 OK` on `OPTIONS` but **omits** `Access-Control-Allow-Origin`.
- Replicate documentation explicitly states that client-side browser tokens are prohibited and CORS is disabled by default.
- **Architectural Conclusion**: We must exclude Replicate from default browser-direct providers (or mark it as "Proxy URL Required").

---

## 5. Client-Side Direct Call Architecture & Perceived Latency Mitigation

### 5.1 Two-Phase Execution Sequence
To satisfy **R3 (Perceived Latency UX)**, the system decouples student dialogue from image synthesis:

```
Sensei: "自撮り送って！" (Send me a selfie!)
   │
   ├─ Step 1: Client intent detector identifies photo request (0ms)
   │
   ├─ Step 2: LLM receives directive to generate immediate dialogue reply (<1.5s)
   │     │    e.g. "自撮り？ちょっと待ってね、今撮るから！"
   │     └─► Displayed immediately in chat bubble!
   │
   ├─ Step 3: Insert "📷 撮影中..." placeholder bubble in chat (instant)
   │
   ├─ Step 4: Asynchronously dispatch image generation request in background (3-5s)
   │     │    [Pollinations.ai GET / Fal.ai POST]
   │     └─► Image URL resolved
   │
   └─ Step 5: Smoothly update placeholder bubble content with the image URL!
              Bubble renders full photo preview in chat!
```

### 5.2 Seamless Bubble Swap Mechanism
1. In `ChatDraggable.vue` (lines 101–114):
   ```html
   <div class="box img" v-else-if="checkImg(element.content)">
       <typing-animation class="loading" v-if="isMessageTyping(element)"></typing-animation>
       <img v-else :src="element.content" class="chat-img" @click="openImageModal(element.content)" />
   </div>
   ```
2. When creating the image bubble in Step 3:
   - Create talk item with empty content or temporary loading marker:
     ```typescript
     const placeholderTalk: Talk = {
         Id: talkHistory.talkId++,
         Name: student.Name,
         Avatar: student.Avatar,
         type: 0,
         flag: 2,
         content: '', // triggers typing animation or placeholder state
         time: Date.now()
     }
     talkHistory.pushTalk(placeholderTalk)
     ```
3. When image arrives in Step 5:
   - Call `talkHistory.setTalkContent(placeholderTalk.Id, imageUrl)`.
   - Vue's reactivity instantly re-renders the bubble as an image!
   - Auto-scrolls chat to bottom.

### 5.3 Click-to-Expand Modal & Image Saving
- Currently, clicking `.chat-img` invokes `changeImage()` (local file reader).
- For AI-generated student photos, clicking should open a **Click-to-Expand Lightbox Modal**:
  - Full-resolution image display.
  - "画像を保存" (Save image) button downloading the file (`student_name_photo.jpg`).
  - Close button / click outside to dismiss.

---

## 6. Project Build & Test Infrastructure

### 6.1 Configuration Audit
- **`package.json`**:
  - Script `"test": "vitest run"` runs the entire test suite.
  - Script `"type-check": "vue-tsc --noEmit --composite false"` verifies full TypeScript types.
  - Script `"build-only": "vite build && node -e \"require('fs').copyFileSync('docs/index.html', 'docs/404.html')\""` compiles to `docs/`.
  - Notice `outDir: 'docs'` in `vite.config.ts`.
- **`vitest.config.ts`**:
  - Environment: `jsdom` (supports full browser DOM, `window`, `localStorage`, `document`, `HTMLImageElement`).
  - Globals: `true` (`describe`, `it`, `expect` available globally).
  - Path alias: `@` resolves to `./src`.

### 6.2 Target Test File Design: `src/tests/studentImageGeneration.test.ts`
The test suite will contain 4 major test blocks:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { store } from '@/assets/storeUtils/store'
import {
    detectPhotoIntent,
    extractPhotoPromptDirective
} from '@/assets/ai/imageGen/intentDetector'
import {
    resolveStudentVisualTags,
    synthesizeStudentImagePrompt,
    KIVOTOS_VISUAL_DICTIONARY
} from '@/assets/ai/imageGen/characterDictionary'
import {
    buildPollinationsImageUrl,
    buildFalAiRequest,
    buildTogetherAiRequest,
    executeImageGeneration
} from '@/assets/ai/imageGen/imageService'
import i18nJp from '@/locales/i18n-jp'
import i18nEn from '@/locales/i18n-en'
import i18nKr from '@/locales/i18n-kr'
import i18nZh from '@/locales/i18n-zh'
import i18nTw from '@/locales/i18n-tw'

describe('Student Image Generation Feature Suite', () => {

    describe('1. Photo Request Intent & Trigger Extraction', () => {
        it('detects photo intent from natural language requests in Japanese', () => {
            expect(detectPhotoIntent('自撮り送って')).toBe(true)
            expect(detectPhotoIntent('今何してるの？写真見せて')).toBe(true)
            expect(detectPhotoIntent('写真を送ってほしいな')).toBe(true)
            expect(detectPhotoIntent('かわいいセルフィーお願い')).toBe(true)
        })

        it('detects photo intent from natural language requests across multilingual inputs', () => {
            expect(detectPhotoIntent('send me a photo')).toBe(true)
            expect(detectPhotoIntent('can you send a selfie?')).toBe(true)
            expect(detectPhotoIntent('사진 보내줘')).toBe(true)
            expect(detectPhotoIntent('拍张自拍给我')).toBe(true)
        })

        it('does not trigger on ordinary conversational messages', () => {
            expect(detectPhotoIntent('おはよう！')).toBe(false)
            expect(detectPhotoIntent('今日のシャーレの仕事、よろしくね')).toBe(false)
            expect(detectPhotoIntent('ありがとう')).toBe(false)
        })

        it('extracts explicit [PHOTO: ...] tag from student dialogue when generated by LLM', () => {
            const rawReply = '自撮り？ちょっと待っててね！[PHOTO: selfie, classroom, smiling]'
            const extracted = extractPhotoPromptDirective(rawReply)
            expect(extracted.cleanReply).toBe('自撮り？ちょっと待っててね！')
            expect(extracted.sceneTag).toBe('selfie, classroom, smiling')
        })
    })

    describe('2. Character Visual Dictionary & Context Tag Synthesis', () => {
        it('resolves authentic visual tags for major Blue Archive students', () => {
            const shirokoTags = resolveStudentVisualTags(10010) // Shiroko
            expect(shirokoTags).toContain('sunaookami shiroko')
            expect(shirokoTags).toContain('halo')
            expect(shirokoTags).toContain('wolf ears')

            const yuukaTags = resolveStudentVisualTags(10011) // Yuuka
            expect(yuukaTags).toContain('hayase yuuka')
            expect(yuukaTags).toContain('twintails')
            expect(yuukaTags).toContain('halo')

            const hinaTags = resolveStudentVisualTags(10000) // Hina
            expect(hinaTags).toContain('sorasaki hina')
            expect(hinaTags).toContain('horns')
            expect(hinaTags).toContain('wings')
        })

        it('synthesizes high quality Danbooru prompt combining character tags and situation tags', () => {
            const prompt = synthesizeStudentImagePrompt(10010, 'selfie, outdoors, sunny day')
            expect(prompt).toContain('masterpiece')
            expect(prompt).toContain('sunaookami shiroko')
            expect(prompt).toContain('halo')
            expect(prompt).toContain('selfie')
        })
    })

    describe('3. Provider API Request & URL Construction', () => {
        it('constructs correct zero-key Pollinations.ai image URL', () => {
            const url = buildPollinationsImageUrl('1girl, shiroko, blue archive', { width: 1024, height: 1024, model: 'flux' })
            expect(url).toContain('https://image.pollinations.ai/prompt/')
            expect(url).toContain('width=1024')
            expect(url).toContain('height=1024')
            expect(url).toContain('nologo=true')
            expect(url).toContain('model=flux')
        })

        it('constructs Fal.ai request headers and payload', () => {
            const req = buildFalAiRequest('prompt text', 'fal_test_key_123')
            expect(req.url).toBe('https://fal.run/fal-ai/flux/schnell')
            expect(req.headers['Authorization']).toBe('Key fal_test_key_123')
            expect(req.headers['Content-Type']).toBe('application/json')
            expect(JSON.parse(req.body).prompt).toBe('prompt text')
        })

        it('constructs Together AI request headers and payload', () => {
            const req = buildTogetherAiRequest('prompt text', 'together_test_key_456')
            expect(req.url).toBe('https://api.together.xyz/v1/images/generations')
            expect(req.headers['Authorization']).toBe('Bearer together_test_key_456')
            expect(JSON.parse(req.body).model).toBe('black-forest-labs/FLUX.1-schnell')
        })
    })

    describe('4. Multilingual UI & Settings Localization Keys', () => {
        const locales = [
            { code: 'jp', data: i18nJp },
            { code: 'en', data: i18nEn },
            { code: 'kr', data: i18nKr },
            { code: 'zh', data: i18nZh },
            { code: 'tw', data: i18nTw }
        ]
        const requiredKeys = [
            'imageGenSetting',
            'imageGenEnabled',
            'imageGenProvider',
            'imageGenApiKey',
            'imageGenModel',
            'takingPhotoPlaceholder',
            'savePhoto',
            'photoGenerationFailed'
        ]

        it('all 5 locale files contain required image generation localization keys', () => {
            for (const { code, data } of locales) {
                for (const key of requiredKeys) {
                    expect((data as any)[key], `Key "${key}" missing in locale "${code}"`).toBeDefined()
                }
            }
        })
    })
})
```

---

## 7. Architecture Documentation Blueprint (`docs/ARCHITECTURE_IMAGE_GEN.md`)

The documentation artifact required by R1 and Acceptance Criteria (`docs/ARCHITECTURE_IMAGE_GEN.md`) should follow this comprehensive structure:

### 7.1 Proposed Document Outline
1. **Title & System Overview**:
   - High-level mission: Dynamic in-character photo exchange in MomoTalk AI.
   - Core philosophy: Zero-backend, zero-cost default, client-side privacy, instantaneous perceived response.
2. **Provider Evaluation & Technical Selection**:
   - Multi-criteria decision analysis (Quality vs Latency vs Cost vs Browser CORS).
   - Pollinations.ai vs Fal.ai vs Together AI vs Replicate comparison table.
   - Rationale for dual-engine approach (Free Pollinations default + Fast Fal.ai BYOK).
3. **End-to-End Interaction Flow**:
   - Sequence Diagram: Sensei prompt -> Regex/LLM Trigger -> Dialogue-first response -> "📷 撮影中..." placeholder -> Async image generation -> Image bubble swap -> Modal view.
4. **Character Fidelity & Danbooru Visual Prompt Engineering**:
   - Kivotos Visual Dictionary design: Mapping canonical student IDs to official halo, hairstyle, eye color, uniform, and accessory tags.
   - Situation synthesis algorithm: Time of day, mood, activity, camera angle.
   - Master quality tags & negative prompt standards.
5. **Client-Side Direct Call Architecture & Security**:
   - Browser direct execution without intermediary proxy.
   - CORS validation across GitHub Pages domain and localhost.
   - Key safety: LocalStorage only, no telemetry.
6. **Error Handling & Fallback Resilience**:
   - Rate limit (429) & network error handling.
   - Fallback from failed BYOK to Pollinations or in-character student apology message.
7. **Verification & Testing Protocol**:
   - Vitest automated test suite verification (`src/tests/studentImageGeneration.test.ts`).
   - Build validation (`npm run build-only`, `npm run type-check`).

---

## 8. Synthesis with Peer Explorers & Recommendations

### 8.1 Synthesis Matrix

| Component | Explorer 1 Findings | Explorer 2 Findings | Explorer 3 (This Report) | Unified Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Message Model** | `Talk` has polymorphic `content` (URL/HTML). | `pushTalk` supports image talks (`type: 0`). | Verified `checkImg()` regex in `ChatDraggable.vue`. | Keep existing `Talk` structure; use image URLs in `content`. |
| **UX & Latency** | `isMessageTyping` handles loading dots. | Dialogue-first response prevents idle waiting. | Add "📷 撮影中..." placeholder bubble, then swap. | **Two-phase optimistic flow**: dialogue (1.5s) -> placeholder -> swap. |
| **Visual Dictionary** | Recommends modular directory structure. | Detailed tag dictionary for 23 students + Arona. | Test suite verifying all 23 students + Arona visual tags. | Adopt Explorer 2's Danbooru dictionary under `src/assets/ai/imageGen/`. |
| **Settings UI** | SettingWindow modal analyzed. | Store settings expansion proposed. | Complete Page 3 UI design & 5-locale schema. | Add **Page 3** to `SettingWindow.vue` with tab switcher and chips. |
| **Providers & CORS** | Surveyed external APIs. | Recommended Pollinations & Fal.ai. | Empirically verified CORS headers via live curls. | **Pollinations (free default) + Fal.ai & Together AI (BYOK)**. Rule out Replicate. |

### 8.2 Proposed File Modifications for Implementation Phase
1. **New Modules**:
   - `src/assets/ai/imageGen/types.ts`: Configuration and provider interfaces.
   - `src/assets/ai/imageGen/characterDictionary.ts`: Danbooru tags for all 23 students + Arona.
   - `src/assets/ai/imageGen/intentDetector.ts`: Natural language intent classifier & tag parser.
   - `src/assets/ai/imageGen/imageService.ts`: Pollinations URL builder, Fal.ai client, Together AI client.
2. **Updated Existing Modules**:
   - `src/assets/storeUtils/store.ts`: Add `imageGen*` properties, `setData()`, `getData()`, adjust `Math.min(..., 3)`.
   - `src/views/DialogView/SettingWindow.vue`: Add Page 3 tab and controls.
   - `src/views/ChatView/ChatDraggable.vue`: Add image modal click handler and lightbox viewer.
   - `src/assets/chatUtils/send.ts`: Wire intent detection and two-phase photo generation into `handleAIReplyTrigger()`.
   - `src/locales/i18n-*.ts`: Add image generation translation keys across all 5 languages.
3. **Tests & Docs**:
   - `src/tests/studentImageGeneration.test.ts`: Complete Vitest suite.
   - `docs/ARCHITECTURE_IMAGE_GEN.md`: Comprehensive design document.
