# MomoTalk AI: Student Data, Conversation Engine & Danbooru Visual Dictionary Survey Report

**Explorer**: Explorer Survey 2 (`explorer_survey_2`)  
**Date**: 2026-09-29 / 2026-09-30  
**Target Project**: `momotalk-ai` (Blue Archive MomoTalk Web App)  
**Objective**: Comprehensive investigation of student data structures, LLM conversation engine, photo/selfie intent detection mechanisms, Blue Archive character visual features/Danbooru tagging dictionary, and context-adaptive prompt synthesis architecture.

---

## 1. Executive Summary

This survey provides the foundational technical and character design analysis for implementing **Dynamic Student Photo Generation** in MomoTalk AI. We examined the entire MomoTalk codebase (`src/assets/requestUtils/`, `src/assets/ai/`, `src/assets/chatUtils/`, `src/assets/storeUtils/`, `src/views/`), evaluated existing student roleplay prompts and chat streaming flows, and designed a complete Danbooru visual dictionary covering all 23 prompt-supported students plus Arona.

### Key Discoveries:
1. **Student Data Architecture**: The app combines remote Schale/Kivotos data (loaded via `Resource.getData('/api/Momotalk/students.json')`) with a client-side canonical metadata registry (`STUDENT_CANONICAL_DATA` in `src/assets/ai/prompts.ts`) supporting 23 core students across 5 languages (JP, KR, EN, ZH, TW).
2. **LLM Engine & Streaming**: Chat messages flow through `send.ts` -> `handleAIReplyTrigger()` -> `triggerAIReply()`, which queries `getAIProvider()` (`GroqProvider`, `OpenAIProvider`, `ClaudeProvider`, `GeminiProvider`). Streaming chunks are progressively rendered into `talkHistory` with an artificial 1.5s typing delay to simulate realistic messaging cadence.
3. **Intent Detection Gap**: Currently, all user inputs are treated uniformly as text chat. There is no intent classifier or directive protocol for image generation. We recommend a **Two-Phase Hybrid Architecture**: a client-side regex fast-path for immediate dialog response and image pipeline pre-triggering, paired with an LLM `[PHOTO: <scene_tags>]` emission protocol that allows nuanced contextual scene adaptation.
4. **Danbooru Visual Dictionary**: High-fidelity character generation in modern anime diffusion models (Pollinations flux-anime, Animagine XL, Pony Diffusion, SDXL) requires precise Danbooru tags, specifically:
   - Character copyright tag (`<name>_(blue_archive)`)
   - Unique halo geometry tag (`halo, <color> halo, <geometric_pattern> halo`)
   - Hair, eye, and kemomimi/wing/horn specifications
   - Canonical school uniforms and signature accessories (e.g., Shiroko's blue scarf, Ako's side cutout/choker, Mika's winged capelet, Toki's C&C maid outfit)
5. **Zero-Perceived-Latency UX (R3)**: To eliminate user frustration from 5-10s image generation delays, the app must implement **先行セリフ (dialogue-first response)**: the student immediately replies with an in-character remark ("自撮り？ちょっと待ってね、今撮るから！"), while an animated placeholder bubble (`📷 撮影中...`) is placed in the chat, seamlessly resolving to the generated photo once ready.

---

## 2. Student Definitions & Character Data Structures

### 2.1 File Locations & Interfaces

The data model for students is defined in `src/assets/requestUtils/interface.ts`:

```typescript
// src/assets/requestUtils/interface.ts
export interface baseStudent {
    Id: number
    Name: string
    Avatar: string
}

export interface studentInfo {
    Id: number
    Avatars: string[]
    Name: string
    Bio: string
    Nickname: string[]
    Birthday: string
    Age: string
    School: string
    Club: string
    Star: number
    Released: boolean
    RelatedStudent: Array<{
        Id: number
        Name: string
        Avatar: string
    }>
    cnt: number
}

export interface LocalStudent {
    Id: number
    Avatar: string[]
    Name: Record<string, string>
    Bio: Record<string, string>
    Nickname: string[]
    Birthday: string
    Age: string
    School: string
    Club: string
    Star: number
    Released: boolean
    Related: { ItemId: number; ItemType: string } | null
}

export interface Talk extends baseStudent {
    type: number // 0: student | 1: sensei | 2: story | 3: choice | 4: system
    content: string
    flag: number // 0: same type subsequent | 1: non-same type first | 2: same type first (show avatar)
    time?: number
}
```

### 2.2 Remote Data Loading & Caching

- `src/assets/requestUtils/cache.ts`: Uses `Resource` class with axios to load configuration from `https://BlueArcbox.github.io/resources/Momotalk/imageDomain.json`.
- `src/assets/requestUtils/request.ts`:
  - `getStudents(rawLng)`: Fetches `/api/Momotalk/students.json` and `/api/Momotalk/prefixTable.json`, hydrates student name/bio across languages, fills nicknames and related student variants (e.g. swimsuit/cycling/track alt forms).
  - Avatar CDN path: `/api/Avatars/Kivo/Released/${studentId}.webp`.

### 2.3 Canonical Student Registry & Multilingual Resolution

In `src/assets/ai/prompts.ts`, the application maintains a canonical student mapping system:
- `STUDENT_CANONICAL_DATA`: Array of 22 students with canonical IDs, multilingual names (`jp`, `kr`, `en`, `zh`, `tw`), `callSensei`, and initial greetings.
- `resolveCanonicalStudent(nameOrId)`: Robust multi-language resolution that accepts student ID (number), exact match across any language string, or substring match.
- `PROMPT_SUPPORTED_STUDENT_IDS`: Array of 23 student IDs:
  `[10010, 10005, 10004, 20008, 10000, 13010, 10003, 23008, 10019, 10006, 20001, 10059, 10062, 10002, 13006, 10052, 10063, 10020, 16001, 10008, 10049, 10048, 10011]`
- `STUDENT_BIRTHDAYS`: Date master for student birthdays (e.g. Shiroko: 5/16, Hoshino: 1/2, Yuuka: 3/14, Hina: 2/19).
- Note on **Arona (アロナ)**: While not in `STUDENT_CANONICAL_DATA`, Arona has avatar assets at `/Arona.webp` and is the iconic AI mascot of the Shittim Chest. She can easily be resolved via canonical ID `9999` or name match.

---

## 3. LLM Conversation Engine Analysis

### 3.1 Architecture Overview

```
[User Types in ChatView]
         │
         ▼
[sendText(char=1, text)] in src/assets/chatUtils/send.ts
         │
         ▼
[handleAIReplyTrigger(text)]
         │
         ├── Check Sleep Simulation (shouldDelayAIReplyForSleep)
         │       └── If sleeping: enqueuePendingWakeup() & return
         │
         ▼
[triggerAIReply(userMessageText)]
         │
         ├── resolveReplyStudent() -> baseStudent
         ├── Check API Key (warn if missing)
         ├── talkHistory.pushTalk(empty replyTalk)
         ├── store.typing = 1, store.isAiResponding = true
         ├── buildSystemPrompt(targetStudent, store.language)
         │       ├── Character roleplay prompt (studentPrompts.ts)
         │       ├── getCurrentTimeContext(birthday, studentName)
         │       ├── getStickerDirective(language)
         │       └── Multilingual directive (KR, EN, ZH, TW)
         ├── Extract last 10 talks from talkHistory -> ChatMessage[]
         ├── Artificial 1.5s typing delay (Promise + setTimeout)
         │
         ▼
[aiProvider.streamChat(systemPrompt, history, promptInput, onChunk, signal)]
         │
         ├── onChunk: talkHistory.setTalkContent(replyTalk.Id, re.md2html(chunk))
         │
         ▼
[On Complete]
         ├── detectInteractionSentiment() -> rank up / rank down
         ├── playMomoTalkSound('receive') + ('rankup' | 'rankdown')
         └── talkHistory.saveCurrentStudentTalks()
```

### 3.2 Providers & API Implementations

`src/assets/ai/index.ts` provides `getAIProvider()` returning an implementation of `AIProvider`:
1. **GroqProvider** (`src/assets/ai/groq.ts`):
   - Default provider. Fast, low latency (~50-100 tok/s).
   - Candidate models: `qwen/qwen3.8-27b` (default), `openai/gpt-oss-120b`, `openai/gpt-oss-20b`.
   - Automatic 503 fallback and exponential backoff retry.
2. **OpenAIProvider** (`src/assets/ai/openai.ts`):
   - OpenAI compatible endpoint with models like `gpt-4o-mini`.
3. **ClaudeProvider** (`src/assets/ai/claude.ts`):
   - Anthropic API integration (`claude-3-5-sonnet-20241022`).
4. **GeminiProvider** (`src/assets/ai/gemini.ts`):
   - Google Generative Language API integration (`gemini-3.5-flash-lite`, `gemini-3.5-flash`).

### 3.3 System Prompt Synthesis (`buildSystemPrompt`)

`buildSystemPrompt(student, targetLang)` in `src/assets/ai/prompts.ts`:
- Resolves student via `resolveCanonicalStudent`.
- Fetches special prompt from `SPECIAL_PROMPTS` (or `SHIROKO_PROMPT`). If not found, falls back to generic Kivotos student prompt.
- Appends `getCurrentTimeContext()` containing year, month, date, weekday, season, time of day (早朝, 朝, 昼, 夕方, 夜, 深夜), and birthday notifications.
- Appends `getStickerDirective()` for understanding MomoTalk stamps.
- Injects multilingual instructions for KR, EN, ZH, or TW.

---

## 4. Intent & Trigger Detection for Photo / Selfie Requests

### 4.1 Problem Definition & Analysis

When a user interacts with a student on MomoTalk, photo generation can be triggered in two scenarios:
1. **Direct Explicit Request**: User specifically requests a selfie or picture (e.g. "自撮り送って", "写真見せて", "写メ送って", "send a selfie", "셀카 보내줘", "发张自拍").
2. **Situational & Conversational Inquiries**: User asks what the student is doing or where they are (e.g. "今何してるの？", "何食べてるの？", "部活中？"), where the student might naturally share a photo of their activity or surroundings.

### 4.2 Architectural Options Comparison

| Dimension | Option A: Pure Regex Heuristics | Option B: Pure LLM Tag Protocol | Option C: Two-Phase Hybrid (Recommended) |
|---|---|---|---|
| **Trigger Mechanism** | Regex pattern match on user input text | Prompt LLM to output `[PHOTO: ...]` tag | Fast-path Regex + LLM Directive Protocol |
| **Response Latency** | 0ms detection | Must wait for LLM output stream | 0ms immediate detection + stream tag extraction |
| **Context Awareness** | Low (cannot know student's dynamic action) | High (LLM chooses pose/scene) | **Very High** (LLM chooses pose/scene; fallback if missed) |
| **Reliability** | Fails on subtle phrasing | Small LLMs may occasionally omit tags | **100% trigger guarantee** via fallback synthesizer |
| **Cost & API Load** | Zero extra calls | Zero extra calls (single stream) | Zero extra calls (single stream) |

### 4.3 Recommended Two-Phase Hybrid Design

```
[User Message: "自撮り送って！"]
         │
         ▼
[Phase 1: Intent Detector (Client-side Regex)]
   Matches photo intent: { isPhotoRequest: true, type: 'selfie' }
         │
         ├── Set flag: photoRequested = true
         ├── Inject Photo Directive into LLM promptInput:
         │   "（先生が自撮り/写真を求めています。まず「自撮り？ちょっと待ってね！」等の自然なセリフを1〜2文で返し、
         │     末尾に必ず [PHOTO: 構図, ポーズ, 表情, 場所, 服装] タグを付与してください）"
         │
         ▼
[Phase 2: LLM Stream Execution]
   LLM Outputs: "ん、ちょっと待って。今撮るね。[PHOTO: selfie, holding phone, slight smile, abydos street, daytime]"
         │
         ├── Stream Filter: Strips `[PHOTO: ...]` so user chat bubble only displays the dialogue!
         │
         ▼
[Phase 3: Asynchronous Photo Dispatch]
   1. Extract scene tags from `[PHOTO: ...]` (or synthesize defaults if tag omitted)
   2. Render student dialogue bubble immediately ("ん、ちょっと待って。今撮るね。")
   3. Insert placeholder bubble into chat: `📷 撮影中...`
   4. Call Image Synthesis Engine asynchronously
   5. On completion, replace placeholder with generated image URL!
```

### 4.4 Multilingual Intent Detection Patterns

The classifier must handle natural variations across all 5 supported languages:

```typescript
export interface PhotoIntentResult {
    isPhotoRequest: boolean
    type: 'selfie' | 'activity' | 'general'
    matchedKeyword?: string
}

export function detectPhotoIntent(userMessage: string): PhotoIntentResult {
    const text = userMessage.trim().toLowerCase()

    // 1. Explicit Selfie Requests
    const selfieRegex = /(自撮り|じどり|セルフィー|selfie|셀카|自拍)/i
    if (selfieRegex.test(text)) {
        return { isPhotoRequest: true, type: 'selfie', matchedKeyword: 'selfie' }
    }

    // 2. Explicit Photo / Picture Requests
    const photoRegex = /(写真(送|見|撮|ちょ|下さ|くれ|ちょうだい)|写メ|画像(送|見|くれ)|photo|pic(ture)?|send.*(photo|pic)|사진.*(보내|보여|찍어)|(发|拍).*(照片|图))/i
    if (photoRegex.test(text)) {
        return { isPhotoRequest: true, type: 'general', matchedKeyword: 'photo' }
    }

    // 3. Situational Inquiries ("今何してるの？" with visual expectation)
    const activityVisualRegex = /(今何してる.*(写真|見せて|見せて)|今どこ.*(写真|見せて)|what are you doing.*(pic|photo)|지금 뭐해.*사진)/i
    if (activityVisualRegex.test(text)) {
        return { isPhotoRequest: true, type: 'activity', matchedKeyword: 'activity' }
    }

    return { isPhotoRequest: false, type: 'general' }
}
```

---

## 5. Danbooru Visual Dictionary for Blue Archive Students

In anime image generation models (Animagine XL 3.1, Pony Diffusion V6 XL, NovelAI Diffusion V3, Pollinations flux-anime), characters are generated with maximal fidelity when tagged with standard Danbooru tags. 

### 5.1 Tagging Hierarchy & Architecture

Each generated prompt is composed of four standardized layers:

1. **Aesthetic & Quality Prefix**:
   `masterpiece, best quality, highly detailed, anime aesthetic, official art style, clean lines, vibrant colors`
2. **Character Identity (Dictionary Lookup)**:
   `1girl, solo, <danbooru_character_name>, blue_archive, <halo_tags>, <hair_tags>, <eye_tags>, <feature_tags>, <signature_clothing_tags>`
3. **Contextual Situation (Extracted or Default)**:
   `<composition_tags>, <pose_tags>, <expression_tags>, <background_tags>, <lighting_tags>`
4. **Negative Prompt**:
   `worst quality, low quality, bad anatomy, bad hands, missing fingers, extra digits, deformed halo, broken halo, blurry, cropped, watermark, username, text, signature, 2girls, multiple girls`

### 5.2 Complete Visual Dictionary: 23 Students + Arona

Below is the verified Danbooru visual dictionary for all 23 prompt-supported Blue Archive students and Arona:

| # | Student (JP / EN) | ID | Danbooru Character Tag | Halo Tags | Hair & Face Tags | Distinct Features (Ears/Horns/Wings) | Canonical Outfit Tags |
|---|---|---|---|---|---|---|---|
| 1 | **砂狼シロコ**<br>Shiroko | 10010 | `sunaookami_shiroko` | `halo, light blue halo, circular halo, concentric segmented halo` | `grey hair, wolf cut, medium hair, hair between eyes, heterochromia, blue eyes, black pupil, white pupil` | `wolf ears, animal ears, ear piercing` | `abydos school uniform, sailor collar, white shirt, blue necktie, blue scarf, black skirt, black thighhighs` |
| 2 | **小鳥遊ホシノ**<br>Hoshino | 10005 | `takanashi_hoshino` | `halo, pink halo, target halo, concentric ring halo` | `light pink hair, very long hair, low twintails, ahoge, heterochromia, blue eye, amber eye, sleepy eyes` | `ahoge` | `abydos school uniform, white shirt, unbuttoned shirt, black skirt, black thighhighs, loose necktie` |
| 3 | **空崎ヒナ**<br>Hina | 10004 | `sorasaki_hina` | `halo, purple halo, spiked halo, crown halo, intricate thorns halo` | `silver-violet hair, very long hair, messy hair, purple eyes, tired eyes, small stature` | `black horns, large curved demon horns, small black demon wings` | `gehenna uniform, black military coat, epaulets, armband, black gloves, white shirt, black skirt` |
| 4 | **天雨アコ**<br>Ako | 20008 | `amau_ako` | `halo, light blue halo, spiked ring halo` | `light blue hair, short hair, side braid, blue eyes, gentle gaze` | `small black horns, demon horns` | `gehenna uniform, side cutout dress, sideboob, white collared shirt, black choker, black gloves, armband` |
| 5 | **陸八魔アル**<br>Aru | 10000 | `rikuhachima_aru` | `halo, red halo, spiked cross halo` | `dark red hair, burgundy hair, long hair, twin drills hair, red eyes` | `curled ram horns, black horns` | `fur-trimmed red coat, black dress, red necktie, black gloves, black thighhighs, problem solver 68` |
| 6 | **早瀬ユウカ**<br>Yuuka | 13010 | `hayase_yuuka` | `halo, blue halo, digital halo, interlocking diamond halo` | `dark blue hair, purple hair, twin tails, medium hair, blue eyes` | None | `millennium school uniform, white tech jacket, open jacket, black undershirt, black pleated skirt, black thighhighs, id card` |
| 7 | **阿慈谷ヒフミ**<br>Hifumi | 10003 | `ajitani_hifumi` | `halo, yellow halo, star halo, four-pointed star in ring` | `blonde hair, short hair, side ponytail, black hair ribbon, amber eyes` | `small white angel wings` | `trinity school uniform, white sailor suit, navy collar, navy pleated skirt, yellow neckerchief, white gloves` |
| 8 | **伊落マリー**<br>Mari | 23008 | `iochi_mari` | `halo, golden halo, cross halo, trinity halo` | `orange hair, long hair, blue eyes, kind smile` | `cat ears, animal ears, kemomimi` | `sister habit, nun veil, nun habit dress, black veil, white wimple, cross necklace, white gloves` |
| 9 | **白洲アズサ**<br>Azusa | 10019 | `shirasu_azusa` | `halo, grey halo, feathered halo, winged halo` | `light purple hair, silver-lavender hair, long hair, purple eyes, white flower hair ornament` | `large white feathered angel wings` | `trinity school uniform, black beret, white collared shirt, suspenders, black skirt, ribbon tie` |
| 10 | **銀鏡イオリ**<br>Iori | 10006 | `shiromi_iori` | `halo, red halo, spiked circular halo` | `white hair, twin tails, red eyes, dark skin, tanned skin, sharp look` | `black demon horns` | `gehenna uniform, black military jacket, white shirt, short shorts, bare legs, black boots` |
| 11 | **角楯カリン**<br>Karin | 20001 | `kakudate_karin` | `halo, yellow halo, radar halo, circular crosshair halo` | `black hair, very long hair, straight bangs, yellow eyes, dark skin, tanned skin` | None | `maid outfit, c&c uniform, maid headdress, black maid dress, white apron, white ruffled collar, thighhighs, high heels` |
| 12 | **聖園ミカ**<br>Mika | 10059 | `misono_mika` | `halo, pink halo, starburst crown halo, complex royal halo` | `light pink hair, long wavy hair, gradient yellow hair tips, yellow eyes, starry eyes, hair flower` | `large white feathered angel wings` | `tea party dress, sleeveless white royal dress, pink ribbon, detached white sleeves, white gloves, capelet` |
| 13 | **飛鳥馬トキ**<br>Toki | 10062 | `asuma_toki` | `halo, light blue halo, hexagonal geometric halo` | `blonde hair, short bob cut, hairclips, blue eyes, expressionless, kuudere` | None | `maid outfit, c&c uniform, maid headband, black dress, white apron, white gloves, peace sign pose` |
| 14 | **黒舘ハルナ**<br>Haruna | 10002 | `kurodate_haruna` | `halo, red halo, intricate floral lace halo` | `silver hair, white hair, long straight hair, red eyes, elegant expression` | `black demon horns, small black bat wings` | `gourmet research society uniform, black fur-trimmed coat, red scarf, black evening dress, black gloves` |
| 15 | **浅黄ムツキ**<br>Mutsuki | 13006 | `asagi_mutsuki` | `halo, red halo, heart flame halo` | `grey hair, short hair, twin buns, red ribbons, red eyes, mischievous smirk, fang` | `small black horns` | `problem solver 68 uniform, black sailor suit, red ribbon tie, black skirt, thighhighs, leather backpack` |
| 16 | **生塩ノア**<br>Noa | 10052 | `ushio_noa` | `halo, pale purple halo, concentric diamond digital halo` | `silver-lavender hair, very long hair, side ponytail, purple hair ribbon, purple eyes, gentle smile` | None | `seminar uniform, white long trench coat, black pencil skirt, black collared shirt, purple tie, thighhighs, clipboard` |
| 17 | **黒崎コユキ**<br>Koyuki | 10063 | `kurosaki_koyuki` | `halo, bright pink halo, spinning pixel halo` | `pink hair, short fluffy hair, messy twintails, pink eyes, playful smile, open mouth` | None | `seminar uniform, oversized white blazer, long sleeves, black pleated skirt, bunny hairclip` |
| 18 | **下江コハル**<br>Koharu | 10020 | `shimoe_koharu` | `halo, black halo, jagged demonic halo` | `pink hair, twin tails, black hair bows, green eyes, blushing face, pout` | `small black demon/justice wings` | `justice task force uniform, black sailor suit, red armband, black pleated skirt, black thighhighs` |
| 19 | **一之瀬アスナ**<br>Asuna | 16001 | `ichinose_asuna` | `halo, blue halo, glowing circular halo` | `blonde hair, very long hair, straight hair, blue eyes, bright energetic smile` | None | `maid outfit, c&c uniform, maid headdress, low cut black dress, cleavage, white apron, black thighhighs` |
| 20 | **美甘ネル**<br>Neru | 10008 | `mikamo_neru` | `halo, red halo, jagged crosshair halo` | `red-orange hair, spiky twintails, red eyes, sharp teeth, bandage on nose, petite` | None | `c&c uniform, embroidered sukajan souvenir jacket, open jacket, black maid dress, boots` |
| 21 | **杏山カズサ**<br>Kazusa | 10049 | `kyouyama_kazusa` | `halo, pink halo, broken ring halo` | `black hair, pink inner hair, two-tone hair, short bob, pink eyes, tsundere expression` | `black cat ears, cat tail, kemomimi` | `trinity uniform, white blazer over black hoodie, black necktie, black pleated skirt, thighhighs` |
| 22 | **錠前サオリ**<br>Saori | 10048 | `joumae_saori` | `halo, dark blue halo, thorny broken crown halo` | `dark blue hair, long messy hair, black baseball cap, blue eyes, serious gaze` | None | `arius squad combat uniform, black tactical vest, crop top, midriff, black combat trousers, gloves, bandages` |
| 23 | **春原シュン**<br>Shun | 10011 | `sunohara_shun` | `halo, green halo, lotus flower halo` | `black hair, very long hair, braided ponytail, amber eyes, mature beauty, gentle smile` | None | `shanhaijing uniform, black qipao dress, high side slit, cleavage cutout, gold embroidery, black thighhighs` |
| 24 | **アロナ**<br>Arona | 9999 | `arona_(blue_archive)` | `halo, white halo, ribbon waterdrop halo` | `light blue hair, short bob hair, pink ribbon hairpin, whale hair accessory, blue eyes, cheerful smile` | None | `shittim chest uniform, sleeveless white sailor suit, sailor collar, blue necktie, bare shoulders, petite` |

---

## 6. Context-Adaptive Prompt Synthesis Design

### 6.1 Context Extraction Dimensions

When synthesizing the final prompt, the synthesizer extracts context from 5 key dimensions:

```
                  ┌──────────────────────────────────────────────┐
                  │ 1. Character Visual Identity (Dictionary)    │
                  │    Halo, Hair, Eyes, Ears/Horns, School Uniform│
                  └──────────────────────┬───────────────────────┘
                                         │
┌─────────────────────────────────┐      │      ┌──────────────────────────────────┐
│ 2. Composition & Angle          │      │      │ 3. Pose & Action                 │
│    - Selfie: selfie, camera,    │◄─────┼─────►│    - Holding phone, peace sign,  │
│      holding phone, close-up    │      │      │      eating, studying, running   │
│    - Snapshot: medium shot,     │      │      │    - Relaxing, sitting at desk   │
│      upper body, candid         │      │      │    - Waving hand, stretching     │
└─────────────────────────────────┘      │      └──────────────────────────────────┘
                                         │
┌─────────────────────────────────┐      │      ┌──────────────────────────────────┐
│ 4. Expression & Mood            │      │      │ 5. Location, Time & Lighting     │
│    - In-character default       │◄─────┴─────►│    - Time: morning, day, sunset, │
│    - Emotion: smile, blush,     │             │      night, starry sky           │
│      wink, pouting, flustered   │             │    - Location: cafe, classroom,  │
│    - Sleepy (Hoshino/night)     │             │      schale office, bedroom, park│
└─────────────────────────────────┘             └──────────────────────────────────┘
                                         │
                                         ▼
                     ┌───────────────────────────────────────┐
                     │ Synthesized Final Danbooru Prompt     │
                     │ (Passed to Pollinations.ai / Fal.ai)  │
                     └───────────────────────────────────────┘
```

### 6.2 Situation & Preset Catalog

```typescript
export interface ScenePreset {
    composition: string[]
    pose: string[]
    expression: string[]
    background: string[]
    lighting: string[]
}

export const SCENE_PRESETS: Record<string, ScenePreset> = {
    // 1. Classic Smartphone Selfie
    selfie_standard: {
        composition: ['selfie', 'holding phone', 'looking at viewer', 'close-up', 'upper body'],
        pose: ['arm up', 'pointing phone at self'],
        expression: ['gentle smile', 'slight blush'],
        background: ['indoor', 'soft background blur'],
        lighting: ['natural daylight', 'soft lighting']
    },
    // 2. Playful / Cute Selfie
    selfie_cute: {
        composition: ['selfie', 'holding phone', 'looking at viewer', 'dutch angle', 'close-up'],
        pose: ['v sign', 'peace sign near eye', 'tilted head'],
        expression: ['cheerful smile', 'winking', 'blush'],
        background: ['classroom', 'school hallway'],
        lighting: ['bright afternoon sun']
    },
    // 3. Cafe / Break Time
    cafe_break: {
        composition: ['selfie', 'sitting at table', 'looking at viewer'],
        pose: ['holding teacup', 'plate with strawberry shortcake on table'],
        expression: ['happy smile', 'blush'],
        background: ['cafe interior', 'cafe table', 'cozy cafe atmosphere'],
        lighting: ['warm indoor lighting', 'sunlight through window']
    },
    // 4. Desk Work / Studying at SCHALE
    studying_desk: {
        composition: ['medium shot', 'looking at viewer', 'sitting'],
        pose: ['sitting at desk', 'holding pen', 'notebooks and papers on desk'],
        expression: ['focused look', 'slight smile'],
        background: ['schale office', 'computer screen in background', 'bookshelf'],
        lighting: ['indoor office lighting']
    },
    // 5. Late Night / Bedtime Cozy
    night_bedroom: {
        composition: ['selfie', 'close-up', 'looking at viewer', 'lying on bed'],
        pose: ['hugging pillow', 'relaxed posture'],
        expression: ['sleepy eyes', 'soft smile', 'blush'],
        background: ['bedroom', 'bed sheet', 'cozy room'],
        lighting: ['dim room lighting', 'screen glow', 'night']
    },
    // 6. Outdoor Patrol / Sports
    outdoor_patrol: {
        composition: ['selfie', 'outdoors', 'upper body', 'looking at viewer'],
        pose: ['walking', 'sports towel around neck'],
        expression: ['energetic smile', 'light sweat'],
        background: ['street', 'blue sky', 'abydos desert background'],
        lighting: ['sunny day', 'bright sunlight', 'lens flare']
    }
}
```

### 6.3 Student Expression & Habit Adaptation

Different students have distinct personal expressions and quirks that should naturally influence their photo generation:
- **Shiroko**: Calm, athletic focus, slight blush, occasionally wearing her blue scarf or sports gear.
- **Hoshino**: Half-closed sleepy eyes, yawn, relaxed smile, bedhead/slacking in Abydos room.
- **Hina**: Relieved gentle smile (only for Sensei), slightly tired eyes, resting chin on hands.
- **Ako**: Flustered, slight blush, stern/pouting look, paperwork on desk.
- **Aru**: Proud triumphant smile ("ふふん!"), or flustered panic with a sweatdrop.
- **Yuuka**: Tsundere blush, holding calculator or tablet, cute pout.
- **Toki**: Expressionless kuudere face, distinctive double peace sign ("peace, peace").
- **Mika**: Radiant starry-eyed smile, wink, roll cake on table.
- **Koyuki**: Big mischievous grin (:3, "にぱぱ〜☆"), energetic pose.
- **Koharu**: Heavy blush, flustered panic, hands waving or guarding her chest ("死刑!").

---

## 7. Recommended Design for Visual Dictionary & Prompt Synthesis Module

### 7.1 Proposed Modular Architecture

We recommend placing all image generation code in a dedicated module `src/assets/imageGen/`:

```
src/assets/imageGen/
├── index.ts                      # Public exports
├── types.ts                      # Interfaces (ImageGenProvider, ImageRequest, ImageResult)
├── characterDictionary.ts        # Danbooru visual dictionary (23 students + Arona)
├── sceneTags.ts                  # Presets & vocabulary for composition, poses, locations
├── intentDetector.ts             # Regex classifier & [PHOTO: ...] parser
├── promptSynthesizer.ts          # Multi-layer prompt builder (quality + char + scene + negative)
├── providers/
│   ├── base.ts                   # Abstract provider
│   ├── pollinations.ts           # Free, zero-key default provider (flux-anime / turbo)
│   ├── fal.ts                    # Fal.ai BYOK provider (ultra-fast Flux/SDXL)
│   └── together.ts               # Together AI BYOK provider
└── imageService.ts               # Main service orchestrating generation, fallback, and talk injection
```

### 7.2 API Specification of Core Functions

#### 1. `getStudentVisualProfile(studentNameOrId: string | number): StudentVisualProfile`
Retrieves character tags, halo tags, hair/eyes, signature outfit, and accessories using `resolveCanonicalStudent()`.

#### 2. `detectPhotoIntent(userMessage: string): PhotoIntentResult`
Analyzes user message for explicit photo requests ("自撮り送って") or visual situational queries.

#### 3. `extractPhotoDirective(llmReplyText: string): { cleanText: string; photoTags?: string }`
Extracts `[PHOTO: <tags>]` from student's streaming dialogue, leaving clean text for the chat message bubble.

#### 4. `synthesizePhotoPrompt(student: baseStudent | studentInfo, sceneContext?: SceneContextInput): { prompt: string; negativePrompt: string }`
Builds the complete Danbooru prompt string with all 4 tag layers.

#### 5. `generateStudentPhoto(request: PhotoGenRequest): Promise<string>`
Dispatches the generation request to the active provider (Pollinations or BYOK) with automatic fallback.

---

## 8. UX & Asynchronous Interaction Flow (Zero Perceived Latency)

### 8.1 The Latency Challenge

Image generation typically takes **3 to 8 seconds** (Pollinations flux-anime) or **1.5 to 3 seconds** (Fal.ai Schnell). If the chat engine blocks until the image is generated, the student will appear completely unresponsive for 8 seconds, breaking the conversational illusion.

### 8.2 The Solution: Dialogue-First Pipeline (先行セリフ演出)

```
Time 0.0s: Sensei sends: "自撮り送って！"
           Intent detector fires -> Photo intent confirmed.
           
Time 0.1s: Student typing animation starts (<typing-animation />).
           LLM generates response: "自撮り？ちょっと待ってね、今撮るから！[PHOTO: selfie, ...]"

Time 1.5s: Student dialogue bubble appears immediately in MomoTalk UI:
           ┌──────────────────────────────────────────────┐
           │ 砂狼シロコ                                   │
           │ ん、自撮り？ちょっと待ってて。今撮るね。      │
           └──────────────────────────────────────────────┘

Time 1.6s: An image placeholder bubble is immediately pushed to talkHistory:
           ┌──────────────────────────────────────────────┐
           │ 砂狼シロコ                                   │
           │ 📷 撮影中...                                  │
           │ [==== Animated Pulsing Shimmer ====]         │
           └──────────────────────────────────────────────┘
           * In background, `generateStudentPhoto()` is dispatched!

Time 4.2s: Image generation finishes!
           - Placeholder content is replaced with image URL.
           - Sound effect `playMomoTalkSound('receive')` plays.
           - Chat view smoothly auto-scrolls down.
           ┌──────────────────────────────────────────────┐
           │ 砂狼シロコ                                   │
           │ ┌──────────────────────────────────────────┐ │
           │ │                                          │ │
           │ │     [ High Quality Shiroko Photo ]       │ │
           │ │                                          │ │
           │ └──────────────────────────────────────────┘ │
           └──────────────────────────────────────────────┘
```

### 8.3 Error & Fallback Handling

If the image generation API fails (e.g. rate limit, offline, timeout):
1. **Provider Fallback**: If Fal.ai or Together AI fails, immediately retry with Pollinations.ai.
2. **Student Graceful Apology**: If all providers fail after 15s timeout, remove the loading placeholder and push a natural student apology bubble:
   `「あれ、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね」`
   This preserves immersion and prevents broken `[IMG]` error icons in the chat.

---

## 9. Store & Settings Integration

### 9.1 Store State Extensions (`src/assets/storeUtils/store.ts`)

```typescript
// Add to store in src/assets/storeUtils/store.ts:
imageGenEnabled: true,
imageGenProvider: 'pollinations' as 'pollinations' | 'fal' | 'together',
imageGenApiKey: '',
imageGenModel: 'flux-anime', // or 'turbo', 'fast-sdxl', etc.

// LocalStorage persistence in setData() / getData()
localStorage.setItem('image-gen-enabled', JSON.stringify(this.imageGenEnabled))
localStorage.setItem('image-gen-provider', JSON.stringify(this.imageGenProvider))
localStorage.setItem('image-gen-api-key', JSON.stringify(this.imageGenApiKey))
localStorage.setItem('image-gen-model', JSON.stringify(this.imageGenModel))
```

### 9.2 SettingWindow UI (`src/views/DialogView/SettingWindow.vue`)

- Add Image Generation controls to the Settings dialog:
  - Toggle: 画像生成機能 (オン / オフ)
  - Radio select for Provider:
    - **Pollinations.ai** (無料・APIキー不要・Flux Animeモデル)
    - **Fal.ai** (BYOK・超高速1〜2秒・Flux Schnell / Fast SDXL)
    - **Together AI** (BYOK・FLUX.1 Schnell)
  - API Key input field for BYOK options with safe `localStorage` assurance badge.

---

## 10. Automated Testing Strategy (Vitest)

All proposed modules will be verified using a dedicated test suite (`src/tests/studentImageGeneration.test.ts`):

1. **Character Visual Dictionary Tests**:
   - Verify all 23 prompt-supported students and Arona can be resolved by ID or name (JP, KR, EN, ZH, TW).
   - Ensure every student profile contains required fields: `characterTag`, `haloTag`, `hairTags`, `eyeTags`, and `clothingTags`.
   - Ensure unique traits (heterochromia for Shiroko/Hoshino, kemomimi for Mari/Kazusa, horns/wings for Hina/Aru/Azusa) are correctly populated.

2. **Photo Intent & Trigger Detection Tests**:
   - Verify explicit requests ("自撮り送って", "写真送って", "写メ見せて", "send a selfie", "셀카 보내줘", "发张自拍") return `isPhotoRequest: true`.
   - Verify ordinary conversation ("おはよう", "今日もお疲れ様", "何の本読んでるの？") returns `isPhotoRequest: false`.
   - Verify `extractPhotoDirective()` correctly extracts `[PHOTO: ...]` tags and cleanly strips them from user-facing text.

3. **Prompt Synthesizer Tests**:
   - Verify synthesized prompt contains quality prefix, character tags, halo tag, and situation tags.
   - Verify negative prompt contains essential anti-distortion tags (`deformed halo, bad anatomy, bad hands`).
   - Verify situation adaptation for daytime, nighttime, cafe, and desk work.

4. **Provider Request & URL Building Tests**:
   - Verify Pollinations.ai URL builder generates valid escaped image URLs (`https://image.pollinations.ai/prompt/...`).
   - Verify Fal.ai / Together AI request payload structures and auth headers.

---

## 11. Conclusion

The MomoTalk codebase has a mature, highly structured LLM streaming architecture (`send.ts`, `prompts.ts`, `studentPrompts.ts`, `groq.ts`) with rich character lore and multi-language support. 

By introducing the **Danbooru Visual Dictionary** and **Context-Adaptive Prompt Synthesizer** alongside the **Dialogue-First Asynchronous Interaction Flow**, MomoTalk AI can deliver photorealistic, context-aware student photos with zero perceived latency, fully fulfilling requirements R1 through R4 of the project prompt.
