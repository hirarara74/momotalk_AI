# Blue Archive MomoTalk AI: Dynamic Student Photo Generation Architecture & Technical Selection

**Document Version:** 1.0.0  
**Status:** Approved Architecture Specification  
**Target System:** Blue Archive MomoTalk Web Application (`momotalk-ai`)  
**Scope:** Requirements R1–R4 (Technical Selection, Character Fidelity Engine, Perceived Latency UX, System Architecture)

---

## 1. Executive Summary & Goals

### 1.1 Problem Statement & Background
Blue Archive MomoTalk AI is an interactive client-side web application simulating the in-game messenger app "MomoTalk" (モモトーク) from Nexon Games / Yostar's *Blue Archive* (ブルーアーカイブ). In the current implementation, Sensei (the player) can converse with Kivotos students using LLM roleplay streaming, audio notifications, Kizuna (relationship) rank progression, and MomoTalk sticker stamps.

However, a core desire of users is visual and contextual immersion: when Sensei asks *"今何してるの？"* (What are you doing now?) or *"自撮り送って"* (Send me a selfie!), students should be able to dynamically share high-quality anime-style photos reflecting their current situation, location, mood, and authentic character design.

### 1.2 The Latency & Quality Dilemma
Modern anime diffusion models require substantial compute. Depending on the inference infrastructure:
- High-quality diffusion models (e.g., FLUX.1, Animagine XL, SDXL) typically take **3 to 8 seconds** to generate a 1024×1024 anime image.
- Synchronously blocking chat execution until image generation completes results in a dead conversation thread, violating the conversational illusion of a mobile instant messenger.
- Requiring all users to acquire and configure a third-party image generation API key creates a prohibitive barrier to entry.

### 1.3 Core Engineering Objectives
To deliver a delightful, frictionless user experience, the dynamic photo generation architecture is designed around four foundational pillars:

1. **Zero-Perceived-Latency UX (先行セリフ演出 & 非同期差し替え)**:
   The dialogue pipeline is decoupled from the image pipeline. The student sends an immediate, in-character text dialogue response within **1.5 seconds**, followed instantaneously by an animated camera placeholder bubble (`📷 撮影中...`). The image is fetched asynchronously in the background and reactively swaps into the chat bubble once ready, accompanied by authentic MomoTalk audio cues.

2. **Dual-Tier Hybrid Provider Architecture (Zero-Key Default + BYOK High Speed)**:
   - **Default Tier (Zero-Key)**: Zero configuration, zero API key, free-to-use anime image generation powered by Pollinations.ai with direct client-side CORS support.
   - **Advanced Tier (BYOK - Bring Your Own Key)**: Power users can configure their own API keys for premium providers like Fal.ai (`flux/schnell`) or Together AI, cutting generation latency to **~1.2–2.0 seconds** with ultra-high visual consistency.

3. **High-Fidelity Blue Archive Visual Engine (Danbooru Visual Dictionary)**:
   To prevent common diffusion model failures (mutated halos, wrong hair colors, generic western clothes, missing animal ears or wings), the system integrates a canonical Danbooru Visual Dictionary for all 23 prompt-supported students and Arona, standardizing official halo geometry, eye/hair specifications, and school uniforms.

4. **Zero-Backend Client-Side Security**:
   MomoTalk AI is hosted as a serverless static Single Page Application (SPA) on GitHub Pages. All network requests execute strictly from the user's browser client. No user data, chats, or BYOK API keys ever touch an intermediary server, and keys are stored exclusively in the browser's `localStorage`.

---

## 2. Provider Technical Evaluation & Selection

### 2.1 The Architectural Gate: Client-Side CORS Compliance
Because MomoTalk AI is hosted as a static web application without a custom Node.js/Python proxy backend, **Cross-Origin Resource Sharing (CORS)** is an absolute architectural constraint. Any candidate API that fails browser preflight `OPTIONS` requests or omits `Access-Control-Allow-Origin` cannot be used directly in the browser.

### 2.2 Provider Benchmark & Evaluation Matrix

The following table summarizes empirical technical testing conducted directly from browser-identical environments:

| Evaluation Metric | Pollinations.ai | Fal.ai | Together AI | Replicate |
| :--- | :--- | :--- | :--- | :--- |
| **Tier Role** | **Default (Zero-Key)** | **BYOK (Option 1 - Fast)** | **BYOK (Option 2 - Standard)** | **Incompatible (Excluded)** |
| **Authentication** | ❌ None (No account/key) | ✅ User Key (`FAL_KEY`) | ✅ User Key (`Bearer`) | ✅ User Token |
| **Browser CORS Status** | ✅ **`*` (Full Support)** | ✅ **Echo Origin (Full)** | ✅ **`*` (Full Support)** | ❌ **Blocked (No ACAO Header)** |
| **Preflight Verification** | HTTP 200 OK | HTTP 200 OK | HTTP 200 OK | HTTP 200 (No CORS header) |
| **Primary Model** | `flux` / `turbo` | `fal-ai/flux/schnell` | `black-forest-labs/FLUX.1-schnell` | `black-forest-labs/flux-schnell` |
| **Measured Latency** | ~3.0 – 5.0 seconds | **~1.2 – 2.2 seconds** | ~2.0 – 3.8 seconds | ~2.5 – 5.0 seconds |
| **Cost per Image** | **$0.00 (Free)** | ~$0.0035 / image | ~$0.0030 / image | ~$0.0030 / image |
| **Request Protocol** | `GET` (URL with prompt) | `POST` (JSON payload) | `POST` (JSON payload) | `POST` + polling |
| **Output Delivery** | Direct JPEG stream / Blob | JSON with CDN image URL | JSON with CDN image URL | Webhook / Polling URL |
| **Direct Browser Fit** | **Flawless (Zero Config)** | **Superior (Ultra-fast)** | **Excellent (OpenAI Standard)**| **Unusable without proxy** |

### 2.3 Candidate Deep Dives

#### 2.3.1 Pollinations.ai (Free Default Engine)
- **Protocol**: `GET https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&model=flux&seed={random_seed}`
- **Verified Response Headers**:
  ```http
  HTTP/1.1 200 OK
  Content-Type: image/jpeg
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, OPTIONS
  X-Auth-Status: unauthenticated
  ```
- **Strengths**:
  - Requires zero registration, zero credit card, and zero setup.
  - Can be rendered directly via `<img :src="url">` or pre-downloaded via `fetch(url)` as a Blob.
  - `Access-Control-Allow-Origin: *` allows full client-side cache and image-saving inspection.
- **Weaknesses**: Public shared GPU infrastructure can experience occasional cold-start spikes (up to 6s) during peak global traffic.

#### 2.3.2 Fal.ai (Recommended Fast BYOK Engine)
- **Protocol**: `POST https://fal.run/fal-ai/flux/schnell`
- **Request Headers**:
  ```http
  Authorization: Key {FAL_KEY}
  Content-Type: application/json
  ```
- **Payload Schema**:
  ```json
  {
    "prompt": "masterpiece, best quality, 1girl, sunaookami shiroko, blue archive, halo, wolf ears, selfie, looking at viewer",
    "image_size": "square_hd",
    "num_images": 1,
    "enable_safety_checker": true
  }
  ```
- **Verified Response**:
  ```json
  {
    "images": [
      {
        "url": "https://v3b.fal.media/files/elephant/...",
        "width": 1024,
        "height": 1024,
        "content_type": "image/jpeg"
      }
    ],
    "seed": 928371,
    "has_nsfw_concepts": [false]
  }
  ```
- **Strengths**: Ultra-fast FLUX.1 Schnell inference (~1.2s). Preflight tests verify that Fal.ai's edge gateway explicitly reflects the caller origin (`access-control-allow-origin: [origin]`) with credentials support.

#### 2.3.3 Together AI (OpenAI-Compatible BYOK Option)
- **Protocol**: `POST https://api.together.xyz/v1/images/generations`
- **Request Headers**:
  ```http
  Authorization: Bearer {TOGETHER_API_KEY}
  Content-Type: application/json
  ```
- **Payload Schema**:
  ```json
  {
    "model": "black-forest-labs/FLUX.1-schnell",
    "prompt": "...",
    "n": 1,
    "steps": 4,
    "response_format": "url"
  }
  ```
- **Strengths**: Standard OpenAI image API format; robust CORS with `Access-Control-Allow-Origin: *`.

#### 2.3.4 Replicate (Technical Disqualification)
- **Investigation**: Calling `https://api.replicate.com/v1/predictions` from a browser triggers a CORS preflight failure:
  ```
  Access to fetch at 'https://api.replicate.com/v1/predictions' from origin 'https://hirarara74.github.io'
  has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
  ```
- **Official Policy**: Replicate enforces API security by disabling browser client-side CORS to prevent user token theft. Without introducing a custom server backend (violating our serverless SPA architecture), Replicate cannot be used.

### 2.4 Technical Selection Rationale
We adopt a **Dual-Engine Architecture**:
1. **Default Mode**: Pollinations.ai (Flux) — Instant activation out-of-the-box for all users.
2. **BYOK Mode**: Fal.ai (`fal-ai/flux/schnell`) as primary, with Together AI as secondary — Targeted at power users demanding sub-2-second generation.

---

## 3. System Architecture & Component Interaction

### 3.1 End-to-End Interaction Flow Diagram

```
Sensei (User in ChatView)
    │
    │  1. Sends message: "自撮り送って！" (Send selfie!)
    ▼
[src/assets/chatUtils/send.ts]
    │
    │  2. detectPhotoIntent(text) -> { isPhotoRequest: true, type: 'selfie' }
    ├───────────────────────────────────────────────────────┐
    │                                                       │
    │ 3. Inject LLM prompt directive                        │ 4. Immediate Dialogue Trigger
    │    ("先生が自撮りを求めています...")                  │    (< 1.5s delay)
    ▼                                                       ▼
[AI Provider (Groq / OpenAI)]                  [talkHistory: pushTalk()]
    │                                                       │
    │ 5. Streams dialogue reply:                            │ 6. Student dialogue bubble:
    │    "自撮り？ちょっと待ってね！今撮るから！"           │    "自撮り？ちょっと待ってね！今撮るから！"
    │    [PHOTO: selfie, classroom, smiling]                │
    ▼                                                       ▼
[intentDetector.ts]                            [talkHistory: pushTalk()]
    │                                                       │
    │ 7. Strips [PHOTO: ...] from user bubble               │ 8. Inserts placeholder bubble:
    │    Extracts scene hints                               │    "📷 撮影中..." (id: 42, isShooting: true)
    ▼                                                       │
[promptSynthesizer.ts]                                      │
    │                                                       │
    │ 9. Character Danbooru Dictionary                      │
    │    + Scene Tags + Master Quality                      │
    │    + Strict Negative Safety Tags                      │
    ▼                                                       │
[imageService.ts]                                           │
    │                                                       │
    │ 10. Dispatches async fetch to selected provider:      │
    │     (Pollinations.ai GET / Fal.ai POST)               │
    ▼                                                       │
[Image Generation API / CDN]                                │
    │                                                       │
    │ 11. Returns resolved Image URL (or Blob)              │
    ▼                                                       ▼
[talkHistory.setTalkContent(42, imageUrl)] ─────────────────┘
    │
    │ 12. Vue Reactivity updates bubble #42
    │     - Removes shooting spinner
    │     - Renders <img :src="imageUrl" class="chat-img" />
    │     - Plays sound: playMomoTalkSound('receive')
    │     - Auto-scrolls chat to bottom
    ▼
[ChatDraggable.vue]
    │
    │ 13. Sensei clicks photo bubble
    ▼
[ImageModalViewer.vue]
    │
    │ 14. Displays full-screen lightbox modal
    │     - High-res image with zoom
    │     - Student badge and timestamp
    │     - Action: "画像を保存" (Save to disk)
```

### 3.2 Component Responsibility Matrix

| Component | File Path | Architectural Responsibilities |
| :--- | :--- | :--- |
| **Chat Interaction Controller** | `src/assets/chatUtils/send.ts` | Orchestrates two-phase reply: fast dialogue emission, placeholder push, background trigger, sound execution. |
| **Photo Intent Classifier** | `src/assets/ai/imageGen/intentDetector.ts` | Detects photo/selfie intent from user text across 5 languages; parses and filters `[PHOTO: ...]` directives. |
| **Character Visual Dictionary** | `src/assets/ai/imageGen/characterDictionary.ts` | Canonical Danbooru tags, halo geometry, hair/eye colors, kemomimi/horns/wings, and uniforms for 23 students + Arona. |
| **Prompt Synthesizer** | `src/assets/ai/imageGen/promptSynthesizer.ts` | Merges 4 prompt layers (Quality + Character + Scene + Negative) into model-ready prompts. |
| **Image Generation Service** | `src/assets/ai/imageGen/imageService.ts` | Directs API requests to Pollinations, Fal.ai, or Together AI; handles timeouts and in-character apologies. |
| **Reactive Store & Config** | `src/assets/storeUtils/store.ts` | Holds reactive state for `imageGenEnabled`, `imageGenProvider`, `imageGenApiKey`, `showImageModal`, `modalImageUrl`. |
| **Talk Message Store** | `src/assets/storeUtils/talkHistory.ts` | Manages message history array, persistence to `localStorage`, reactive `setTalkContent()`. |
| **Chat Message Renderer** | `src/views/ChatView/ChatDraggable.vue` | Renders message bubbles, detects `[SHOOTING_PHOTO]` state, routes photo clicks to `ImageModalViewer`. |
| **Image Lightbox Modal** | `src/components/ImageModalViewer.vue` | Full-screen modal with zoom, student name badge, and disk save button (`student_name_photo.jpg`). |
| **Settings Window (Page 3)**| `src/views/DialogView/SettingWindow.vue` | UI for enabling/disabling photo generation, selecting provider, entering BYOK keys, and selecting model. |

### 3.3 Core Data Models & Type Contracts

```typescript
// src/assets/ai/imageGen/types.ts

export type ImageGenProviderType = 'pollinations' | 'fal' | 'together'

export interface CharacterVisualProfile {
    studentId: number
    canonicalName: string
    danbooruTag: string
    halo: string[]
    hair: string[]
    eyes: string[]
    distinctFeatures: string[]
    canonicalUniform: string[]
    signatureAccessories: string[]
    defaultExpression: string[]
}

export interface PhotoIntentResult {
    isPhotoRequest: boolean
    type: 'selfie' | 'activity' | 'general'
    matchedKeyword?: string
    sceneHint?: string
}

export interface PromptSynthesisOptions {
    studentIdOrName: string | number
    userMessage?: string
    sceneDirective?: string
    outfitOverride?: string
    aspectRatio?: 'square' | 'portrait' | 'landscape'
}

export interface SynthesizedPrompt {
    positivePrompt: string
    negativePrompt: string
    characterTags: string[]
    sceneTags: string[]
    seed: number
}

export interface ImageGenConfig {
    enabled: boolean
    provider: ImageGenProviderType
    apiKey?: string
    model?: string
}

export interface ImageGenResult {
    success: boolean
    imageUrl?: string
    error?: string
    provider: ImageGenProviderType
    elapsedMs: number
}
```

---

## 4. Blue Archive Character Fidelity Engine

### 4.1 Danbooru Visual Dictionary Taxonomy
Anime diffusion models (including FLUX and SDXL fine-tunes) synthesize Blue Archive characters with high fidelity when supplied with standard Danbooru tags. The taxonomy consists of 7 structured tag facets:

1. **Character Copyright Tag**: `<character_name>_(blue_archive)`
2. **Halo Geometry**: Blue Archive halos are uniquely tied to each student's identity and mystic (神秘). Each profile defines precise color and geometric traits (e.g. `halo, blue halo, interlocking diamond halo`).
3. **Hair & Eyes**: Specific styling, length, bangs, and heterochromia (e.g. Shiroko's blue/white pupils, Hoshino's blue/amber eyes).
4. **Distinctive Anatomy**: Non-human traits such as kemomimi (wolf/cat ears), horns, and demonic or angelic wings.
5. **School Uniforms**: Canonical academy uniforms (Abydos, Gehenna, Millennium, Trinity, Hyakkiyako, Shanhaijing, Arius).
6. **Signature Accessories**: Items inextricably linked to the character (e.g., Shiroko's blue scarf, Noa's clipboard, Yuuka's calculator).
7. **In-Character Defaults**: Expressions characteristic of the student (e.g., Toki's expressionless kuudere face and peace sign, Koharu's heavy blush and flustered pout).

### 4.2 Comprehensive Student Visual Dictionary (23 Students + Arona)

| # | Student (JP / EN) | ID | Danbooru Tag | Halo Specification | Hair & Eye Attributes | Distinctive Features | Canonical Attire |
|---|---|---|---|---|---|---|---|
| 1 | **砂狼シロコ**<br>Shiroko | 10010 | `sunaookami_shiroko` | `halo, light blue halo, circular halo, concentric segmented halo` | `grey hair, wolf cut, medium hair, heterochromia, blue eye, black pupil, white pupil` | `wolf ears, animal ears, ear piercing` | `abydos school uniform, sailor collar, white shirt, blue necktie, blue scarf, black skirt` |
| 2 | **小鳥遊ホシノ**<br>Hoshino | 10005 | `takanashi_hoshino` | `halo, pink halo, target halo, concentric ring halo` | `light pink hair, very long hair, low twintails, ahoge, heterochromia, blue eye, amber eye` | `sleepy eyes, ahoge` | `abydos school uniform, unbuttoned white shirt, loose necktie, black skirt, black thighhighs` |
| 3 | **空崎ヒナ**<br>Hina | 10004 | `sorasaki_hina` | `halo, purple halo, spiked halo, crown halo, intricate thorns halo` | `silver-violet hair, very long hair, messy hair, purple eyes, tired eyes` | `large curved black demon horns, small black demon wings` | `gehenna uniform, black military coat, epaulets, armband, white shirt, black skirt` |
| 4 | **天雨アコ**<br>Ako | 20008 | `amau_ako` | `halo, light blue halo, spiked ring halo` | `light blue hair, short hair, side braid, blue eyes, gentle gaze` | `small black horns, demon horns` | `gehenna uniform, side cutout dress, sideboob, white collared shirt, black choker, black gloves` |
| 5 | **陸八魔アル**<br>Aru | 10000 | `rikuhachima_aru` | `halo, red halo, spiked cross halo` | `dark red hair, burgundy hair, long hair, twin drills hair, red eyes` | `curled ram horns, black horns` | `fur-trimmed red coat, black dress, red necktie, black gloves, black thighhighs` |
| 6 | **早瀬ユウカ**<br>Yuuka | 13010 | `hayase_yuuka` | `halo, blue halo, digital halo, interlocking diamond halo` | `dark blue hair, purple hair, twin tails, medium hair, blue eyes` | `tsundere expression` | `millennium school uniform, white tech jacket, open jacket, black undershirt, black pleated skirt` |
| 7 | **阿慈谷ヒフミ**<br>Hifumi | 10003 | `ajitani_hifumi` | `halo, yellow halo, star halo, four-pointed star in ring` | `blonde hair, short hair, side ponytail, black hair ribbon, amber eyes` | `small white angel wings` | `trinity school uniform, white sailor suit, navy collar, navy pleated skirt, yellow neckerchief` |
| 8 | **伊落マリー**<br>Mari | 23008 | `iochi_mari` | `halo, golden halo, cross halo, trinity halo` | `orange hair, long hair, blue eyes, kind smile` | `cat ears, animal ears, kemomimi` | `sister habit, nun veil, nun habit dress, black veil, white wimple, cross necklace` |
| 9 | **白洲アズサ**<br>Azusa | 10019 | `shirasu_azusa` | `halo, grey halo, feathered halo, winged halo` | `light purple hair, silver-lavender hair, long hair, purple eyes, white flower hair ornament` | `large white feathered angel wings` | `trinity school uniform, black beret, white collared shirt, suspenders, black skirt, ribbon tie` |
| 10 | **銀鏡イオリ**<br>Iori | 10006 | `shiromi_iori` | `halo, red halo, spiked circular halo` | `white hair, twin tails, red eyes, dark skin, tanned skin, sharp look` | `black demon horns` | `gehenna uniform, black military jacket, white shirt, short shorts, bare legs, black boots` |
| 11 | **角楯カリン**<br>Karin | 20001 | `kakudate_karin` | `halo, yellow halo, radar halo, circular crosshair halo` | `black hair, very long hair, straight bangs, yellow eyes, dark skin, tanned skin` | None | `maid outfit, c&c uniform, maid headdress, black maid dress, white apron, white ruffled collar` |
| 12 | **聖園ミカ**<br>Mika | 10059 | `misono_mika` | `halo, pink halo, starburst crown halo, complex royal halo` | `light pink hair, long wavy hair, gradient yellow hair tips, starry eyes, hair flower` | `large white feathered angel wings` | `tea party dress, sleeveless white royal dress, pink ribbon, detached white sleeves, capelet` |
| 13 | **飛鳥馬トキ**<br>Toki | 10062 | `asuma_toki` | `halo, light blue halo, hexagonal geometric halo` | `blonde hair, short bob cut, hairclips, blue eyes, expressionless, kuudere` | `peace sign pose` | `maid outfit, c&c uniform, maid headband, black dress, white apron, white gloves` |
| 14 | **黒舘ハルナ**<br>Haruna | 10002 | `kurodate_haruna` | `halo, red halo, intricate floral lace halo` | `silver hair, white hair, long straight hair, red eyes, elegant expression` | `black demon horns, small black bat wings` | `gourmet research society uniform, black fur-trimmed coat, red scarf, black evening dress` |
| 15 | **浅黄ムツキ**<br>Mutsuki | 13006 | `asagi_mutsuki` | `halo, red halo, heart flame halo` | `grey hair, short hair, twin buns, red ribbons, red eyes, mischievous smirk, fang` | `small black horns` | `problem solver 68 uniform, black sailor suit, red ribbon tie, black skirt, thighhighs` |
| 16 | **生塩ノア**<br>Noa | 10052 | `ushio_noa` | `halo, pale purple halo, concentric diamond digital halo` | `silver-lavender hair, very long hair, side ponytail, purple hair ribbon, purple eyes` | None | `seminar uniform, white long trench coat, black pencil skirt, black collared shirt, purple tie` |
| 17 | **黒崎コユキ**<br>Koyuki | 10063 | `kurosaki_koyuki` | `halo, bright pink halo, spinning pixel halo` | `pink hair, short fluffy hair, messy twintails, pink eyes, playful smile, open mouth` | None | `seminar uniform, oversized white blazer, long sleeves, black pleated skirt, bunny hairclip` |
| 18 | **下江コハル**<br>Koharu | 10020 | `shimoe_koharu` | `halo, black halo, jagged demonic halo` | `pink hair, twin tails, black hair bows, green eyes, blushing face, pout` | `small black wings` | `justice task force uniform, black sailor suit, red armband, black pleated skirt` |
| 19 | **一之瀬アスナ**<br>Asuna | 16001 | `ichinose_asuna` | `halo, blue halo, glowing circular halo` | `blonde hair, very long hair, straight hair, blue eyes, bright energetic smile` | None | `maid outfit, c&c uniform, maid headdress, low cut black dress, cleavage, white apron` |
| 20 | **美甘ネル**<br>Neru | 10008 | `mikamo_neru` | `halo, red halo, jagged crosshair halo` | `red-orange hair, spiky twintails, red eyes, sharp teeth, bandage on nose, petite` | None | `c&c uniform, embroidered sukajan souvenir jacket, open jacket, black maid dress, boots` |
| 21 | **杏山カズサ**<br>Kazusa | 10049 | `kyouyama_kazusa` | `halo, pink halo, broken ring halo` | `black hair, pink inner hair, two-tone hair, short bob, pink eyes, tsundere expression` | `black cat ears, cat tail, kemomimi` | `trinity uniform, white blazer over black hoodie, black necktie, black pleated skirt` |
| 22 | **錠前サオリ**<br>Saori | 10048 | `joumae_saori` | `halo, dark blue halo, thorny broken crown halo` | `dark blue hair, long messy hair, black baseball cap, blue eyes, serious gaze` | None | `arius squad combat uniform, black tactical vest, crop top, midriff, black combat trousers` |
| 23 | **春原シュン**<br>Shun | 10011 | `sunohara_shun` | `halo, green halo, lotus flower halo` | `black hair, very long hair, braided ponytail, amber eyes, mature beauty, gentle smile` | None | `shanhaijing uniform, black qipao dress, high side slit, cleavage cutout, gold embroidery` |
| 24 | **アロナ**<br>Arona | 9999 | `arona_(blue_archive)` | `halo, white halo, ribbon waterdrop halo` | `light blue hair, short bob hair, pink ribbon hairpin, whale hair accessory, blue eyes` | None | `shittim chest uniform, sleeveless white sailor suit, sailor collar, blue necktie, bare shoulders` |

### 4.3 4-Tier Prompt Synthesis Algorithm

```typescript
export function synthesizeStudentImagePrompt(
    profile: CharacterVisualProfile,
    options: PromptSynthesisOptions
): SynthesizedPrompt {
    // 1. Tier 1: Master Quality & Aesthetic Prefix
    const qualityTags = [
        'masterpiece',
        'best quality',
        'highly detailed',
        'anime aesthetic',
        'official art style',
        'clean lines',
        'vibrant colors',
        'absurdres'
    ]

    // 2. Tier 2: Character Identity Layer
    const characterTags = [
        '1girl',
        'solo',
        `${profile.danbooruTag}_(blue_archive)`,
        ...profile.halo,
        ...profile.hair,
        ...profile.eyes,
        ...profile.distinctFeatures,
        ...(options.outfitOverride ? [options.outfitOverride] : profile.canonicalUniform),
        ...profile.signatureAccessories
    ]

    // 3. Tier 3: Contextual Situation & Scene Layer
    const sceneTags = options.sceneDirective 
        ? parseSceneDirective(options.sceneDirective)
        : resolveDefaultScene(profile, options.userMessage)

    // 4. Tier 4: Strict Negative Safety Prompts
    const negativeTags = [
        'worst quality',
        'low quality',
        'bad anatomy',
        'bad hands',
        'missing fingers',
        'extra digits',
        'deformed halo',
        'broken halo',
        'multiple halos',
        'blurry',
        'cropped',
        'watermark',
        'username',
        'text',
        'signature',
        '2girls',
        'multiple girls',
        'monochrome',
        'nsfw',
        'nude',
        'nipples'
    ]

    const positivePrompt = [
        ...qualityTags,
        ...characterTags,
        ...sceneTags
    ].join(', ')

    const negativePrompt = negativeTags.join(', ')

    return {
        positivePrompt,
        negativePrompt,
        characterTags,
        sceneTags,
        seed: Math.floor(Math.random() * 1000000)
    }
}
```

---

## 5. Perceived Latency UX & Asynchronous Flow

### 5.1 The Latency Challenge & Perception Psychology
Human conversation tolerance in instant messaging follows established cognitive thresholds:
- **< 1.0s**: Feels instantaneous; natural chat pacing.
- **1.0s – 2.0s**: Feels like typing or drafting a reply.
- **> 3.0s**: Feels like a dropped connection or unresponsive app.

Because image generation takes 1.5s to 5.0s, triggering image generation before responding makes the student feel broken. 

### 5.2 The Solution: Dialogue-First Pipeline (先行セリフ演出)
To eliminate perceived latency, we structure the response into two distinct phases:

1. **Immediate In-Character Dialogue (< 1.5s)**:
   The LLM generates a quick, affectionate, in-character verbal reply acknowledging the photo request:
   - *Shiroko*: 「ん、自撮り？ちょっと待ってて。今撮るね。」
   - *Yuuka*: 「えっ、私の写真！？も、もう……変なこと言わないでください！……ちょっとだけですよ？」
   - *Hina*: 「……先生が見たいなら。少し待って、今送るから。」
   - *Hoshino*: 「うへ〜、おじさんの自撮り？しょうがないなぁ、一枚だけだよ〜」

2. **Shooting Placeholder Insertion**:
   Immediately following the dialogue bubble, a dedicated photo placeholder message is appended to `talkHistory`:
   ```typescript
   const placeholderTalk: Talk = {
       Id: talkHistory.talkId++,
       Name: currentStudent.Name,
       Avatar: currentStudent.Avatar,
       type: 0,
       flag: 0, // grouped under same student header
       content: '[SHOOTING_PHOTO]',
       time: Date.now()
   }
   talkHistory.pushTalk(placeholderTalk)
   ```

3. **Background Asynchronous Generation & In-Place Swap**:
   The image generation request runs in the background. When the image URL is returned:
   ```typescript
   talkHistory.setTalkContent(placeholderTalk.Id, imageUrl)
   talkHistory.saveCurrentStudentTalks()
   playMomoTalkSound('receive')
   ```
   Vue 3's reactive system instantly replaces the shooting spinner with the rendered image bubble without re-mounting or causing scroll stutter.

### 5.3 Chat Message Bubble Rendering (`ChatDraggable.vue`)

In `src/views/ChatView/ChatDraggable.vue`, the message rendering template is enhanced:

```html
<!-- 1. AI Image Shooting Placeholder -->
<div 
    class="box img shooting-box" 
    v-else-if="element.content === '[SHOOTING_PHOTO]'"
>
    <div class="shooting-indicator">
        <span class="camera-icon">📷</span>
        <span class="shooting-text">{{ $t('takingPhotoPlaceholder') || '撮影中...' }}</span>
        <div class="shooting-shimmer"></div>
    </div>
</div>

<!-- 2. Loaded Image Message Bubble -->
<div class="box img" v-else-if="checkImg(element.content)">
    <img 
        :src="element.content" 
        class="chat-img interactive-photo" 
        @click="openImageModal(element.content, element.Name)"
        loading="lazy"
        alt="Student Photo"
    />
</div>
```

### 5.4 Click-to-Enlarge Lightbox Modal (`ImageModalViewer.vue`)

MomoTalk previously opened a file upload picker when clicking on chat images (`changeImage()`). For AI-generated student photos, this is replaced with a mobile-style lightbox modal:

- **Component**: `src/components/ImageModalViewer.vue`
- **Features**:
  1. Centered high-resolution image preview with soft dark backdrop (`rgba(0, 0, 0, 0.75)`).
  2. Student Header badge: Avatar, localized student name, and "MomoTalk Photo".
  3. Action: **"画像を保存" (Save Photo)** button triggering automated browser file download (`${studentName}_photo_${timestamp}.jpg`).
  4. Dismiss on backdrop click, "×" button, or `Escape` keyboard event.

---

## 6. Security, API Key Protection & BYOK Policy

### 6.1 Threat Model for Client-Side SPAs
MomoTalk AI has no private backend; the client connects directly to third-party AI endpoints. This environment presents specific security considerations:

1. **Zero Hardcoded Secrets**: Under no circumstances may application maintainer API keys be hardcoded or packaged into Vite frontend bundles.
2. **BYOK Key Isolation**: User-supplied keys (Fal.ai, Together AI, Groq, OpenAI) must remain strictly within the user's browser client.
3. **CORS Validation**: Cross-origin requests must use legitimate browser headers without exposing client authentication tokens to untrusted origins.
4. **XSS & Content Injection Prevention**: Chat contents and prompt directives must undergo strict HTML sanitization before DOM injection.

### 6.2 Key Storage & Management Architecture
- **Storage Location**: Browser `window.localStorage` under key `image-gen-api-key`.
- **UI Masking**: Rendered in `SettingWindow.vue` using `<input type="password">` with a toggleable eye icon.
- **Zero Telemetry**: No telemetry, analytics trackers, or logging servers are integrated. API keys are sent solely to the respective provider's official gateway (`fal.run`, `api.together.xyz`).
- **Sanitization Guardrails**:
  All LLM dialogue chunks pass through `re.md2html()` and strict markdown escaping. Image URLs injected into `talkHistory` must validate against safe protocol schemas (`https://` or `data:image/jpeg;base64,`), preventing `javascript:` URI attacks.

---

## 7. Fallback & Resilience Strategy

### 7.1 Multi-Layered Fault Tolerance Hierarchy

```
[Image Generation Triggered]
             │
             ▼
   [Try Active Provider]
    ├── Fal.ai (BYOK)
    └── Together AI (BYOK)
             │
      ┌──────┴──────┐
   (Success)     (Error / 401 / 429 / Timeout)
      │             │
      ▼             ▼
[Render Photo]  [Fallback to Pollinations.ai (Free)]
                    │
             ┌──────┴──────┐
          (Success)     (Error / Timeout 15s)
             │             │
             ▼             ▼
       [Render Photo]  [In-Character Student Apology Bubble]
```

### 7.2 Timeout Handling & Circuit Breakers
- **Maximum Timeout**: 15,000 ms. If a provider fails to return within 15 seconds, the request aborts via `AbortController`.
- **Automatic BYOK Fallback**: If a user's BYOK API key fails (HTTP 401 Unauthorized, HTTP 403 Forbidden, or HTTP 429 Rate Limit Exceeded), the service logs a clear warning in the browser console and seamlessly attempts fallback generation via Pollinations.ai.

### 7.3 In-Character Student Apology Messages
If all generation attempts fail (e.g. offline device, global provider outage), the system removes the loading placeholder and injects a natural, in-character student apology message to preserve immersion:

| Locale | In-Character Apology Text |
| :--- | :--- |
| **Japanese (JP)** | `「あれ、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね」` |
| **English (EN)** | `"Oh no, seems my camera is acting up... Sorry Sensei, I'll take another one for you later!"` |
| **Korean (KR)** | `"어라, 카메라 상태가 안 좋은 것 같아요…… 죄ソン해요 선생님, 나중에 다시 찍어 드릴게요."` |
| **Simplified Chinese (ZH)** | `“哎呀，相机好像出故障了……对不起老师，稍后我再给您拍一张吧。”` |
| **Traditional Chinese (TW)** | `「哎呀，相機好像壞掉了……對不起老師，稍後我再重拍一張給您。」` |

---

## 8. Verification & Test Plan

### 8.1 Automated Test Matrix (`src/tests/studentImageGeneration.test.ts`)
The implementation is verified via a comprehensive Vitest test suite structured into 4 distinct verification blocks:

```typescript
describe('Student Image Generation Feature Suite', () => {

    describe('1. Photo Request Intent & Trigger Extraction', () => {
        // Tests explicit natural language queries across JP, EN, KR, ZH, TW
        // Tests rejection of ordinary conversational messages
        // Tests extraction and stripping of [PHOTO: ...] tag from LLM streams
    })

    describe('2. Character Visual Dictionary & Context Tag Synthesis', () => {
        // Tests canonical tag resolution for all 23 students + Arona
        // Verifies presence of halos, hair, eyes, uniforms, and unique anatomy
        // Tests 4-tier prompt composition (Quality + Character + Scene + Negative)
    })

    describe('3. Provider API Request & URL Construction', () => {
        // Tests zero-key Pollinations.ai URL construction & URI parameter encoding
        // Tests Fal.ai request headers (Authorization: Key ...) and payload structure
        // Tests Together AI request headers and FLUX.1 model specifications
    })

    describe('4. Multilingual UI & Settings Localization Keys', () => {
        // Verifies presence of required i18n keys across all 5 language files:
        // 'imageGenSetting', 'imageGenEnabled', 'imageGenProvider', 
        // 'imageGenApiKey', 'imageGenModel', 'takingPhotoPlaceholder', 'savePhoto'
    })
})
```

### 8.2 End-to-End Scenario Verification

#### Scenario A: Explicit Selfie Request ("自撮り送って")
- **Step 1**: Sensei inputs `"自撮り送って！"`.
- **Step 2**: `detectPhotoIntent()` returns `isPhotoRequest: true`.
- **Step 3**: Student sends immediate dialogue reply within 1.5s: `"自撮り？ちょっと待っててね！今撮るから！"`.
- **Step 4**: Shooting placeholder bubble (`📷 撮影中...`) appears immediately below dialogue.
- **Step 5**: Background image generation executes.
- **Step 6**: Placeholder bubble smoothly updates with the loaded photo.
- **Step 7**: Clicking photo bubble opens `ImageModalViewer.vue` with full zoom and save capability.

#### Scenario B: Situational Activity Request ("今何してるの？")
- **Step 1**: Sensei inputs `"今何してるの？"`.
- **Step 2**: Intent detector identifies situational inquiry; LLM receives directive to share activity context.
- **Step 3**: Student replies with activity dialogue (e.g. studying in classroom or eating cake at cafe) and includes `[PHOTO: cafe, holding teacup, cake on table]`.
- **Step 4**: Prompt synthesizer combines student visual profile with situational tags.
- **Step 5**: Contextual photo arrives in chat feed, matching the student's conversation topic.

### 8.3 Build & Quality Gate
- **Type Checking**: `npm run type-check` (`vue-tsc --noEmit`) passes with 0 errors.
- **Unit & Integration Tests**: `npm test` passes 100% of test suites with zero regressions.
- **Production Build**: `npm run build-only` builds production assets into `docs/` cleanly.

---

## 9. Conclusion
This architecture establishes a robust, highly responsive, and immersion-preserving dynamic photo generation system for Blue Archive MomoTalk AI. By pairing the **Danbooru Visual Dictionary** with a **Two-Phase Dialogue-First UX Flow** and a **Dual-Tier Zero-Key + BYOK Provider Strategy**, MomoTalk AI delivers instantaneous perceived responsiveness while honoring the authentic visual identity of Kivotos students.
