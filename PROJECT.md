# Project: Dynamic Student Photo Generation in Blue Archive MomoTalk

## Architecture
Dynamic Student Photo Generation extends MomoTalk Web app with an asynchronous, zero-perceived-latency AI photo generation system.

```
Sensei Input ("自撮り送って" / "今何してるの？")
  │
  ▼
[Intent Detector] ──(Photo intent detected)──► Injects [PHOTO: <scene_tags>] prompt instruction
  │
  ▼
[Student LLM Generation (send.ts)]
  ├── Immediate dialogue reply (1.5s): "自撮り？ちょっと待ってね、今撮るから！"
  └── Pushes placeholder talk bubble: "📷 撮影中..." (Talk ID: X)
  │
  ▼
[Scene & Character Prompt Synthesizer]
  ├── Resolves Canonical Student -> Danbooru Visual Dictionary (Halo, Hair, Eyes, Uniform, Accessories)
  ├── Extracts/synthesizes contextual scene tags (Pose, Expression, Location, Time)
  └── Produces complete positive & negative prompt
  │
  ▼
[Image Service & Providers]
  ├── Default / Free: Pollinations.ai (Flux/SANA, Zero-Key, CORS friendly)
  └── BYOK: Fal.ai (Flux Schnell, 1.5s), Together AI (Flux.1 Schnell)
  │
  ▼
[Reactive Talk History Update]
  └── talkHistory.setTalkContent(X, imageUrl) -> Replaces "📷 撮影中..." with <img>
  │
  ▼
[Chat UI Interaction (ChatDraggable.vue & ImageModalViewer.vue)]
  └── Click photo bubble -> Opens full-size modal viewer with zoom & save controls
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | Technical Selection & Architecture Document | Provider comparison (Pollinations, Fal, Together), CORS validation, latency benchmarks, security & architecture document in `docs/ARCHITECTURE_IMAGE_GEN.md` | M1 | ORIGINAL_REQUEST §R1 |
| F2 | Blue Archive Danbooru Visual Dictionary | Comprehensive visual dictionaries for all 23 prompt-supported students + Arona covering halos, hair, eyes, uniforms, accessories | M2 | ORIGINAL_REQUEST §R2 |
| F3 | Context-Adaptive Scene Tag & Intent Detector | Multilingual intent classifier ("自撮り送って", "今何してるの？", etc.) + scene tag extractor (time, location, mood, pose) | M2 | ORIGINAL_REQUEST §R2 |
| F4 | 4-Tier Prompt Synthesizer | Combines quality aesthetic tags, character Danbooru dictionary tags, scene tags, and strict negative safety prompts | M2 | ORIGINAL_REQUEST §R2 |
| F5 | Zero-Key Free Provider (Pollinations.ai) | Client-side direct GET URL generator for anime/flux model with zero authentication | M3 | ORIGINAL_REQUEST §R1 |
| F6 | BYOK Providers (Fal.ai & Together AI) | Direct browser-based API callers for fast/high-quality image generation with user-provided API keys | M3 | ORIGINAL_REQUEST §R1 |
| F7 | Image Service & Fault-Tolerant Fallback | Central client service managing generation, timeout (15s), and student in-character failure apology message | M3 | ORIGINAL_REQUEST §R1, R3 |
| F8 | Dialogue-First Immediate Reply UX | Student text response emitted in <1.5s before image generation begins, eliminating perceived latency | M4 | ORIGINAL_REQUEST §R3 |
| F9 | Shooting Placeholder Indicator ("📷 撮影中...") | Real-time loading placeholder bubble inserted below student dialogue, replaced reactively upon image resolution | M4 | ORIGINAL_REQUEST §R3 |
| F10 | Image Modal Viewer Component | Click-to-enlarge photo lightbox modal with zoom, close, and download action | M4 | ORIGINAL_REQUEST §R3 |
| F11 | SettingWindow Image Generation Tab | 3rd settings tab in SettingWindow for toggling image generation, choosing provider, and entering BYOK API keys | M5 | ORIGINAL_REQUEST §R4 |
| F12 | Settings Store Reactive Persistence | Store extension in `store.ts` with localStorage migration and persistence for image generation configs | M5 | ORIGINAL_REQUEST §R1, R4 |
| F13 | Multilingual i18n Localization | Translations for all 5 supported locales (JA, EN, ZH-CN, ZH-TW, KO) for settings and UI prompts | M5 | ORIGINAL_REQUEST §Verification |
| F14 | Automated Vitest Test Suite | Comprehensive automated tests in `src/tests/studentImageGeneration.test.ts` testing intent, dictionary, providers, i18n | M6 | ORIGINAL_REQUEST §R4 |
| F15 | Production Build & Integration Verification | Complete verification passing `npm test`, `npm run type-check`, and `npm run build-only` | M6 | ORIGINAL_REQUEST §Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architecture & Technical Selection Document | `docs/ARCHITECTURE_IMAGE_GEN.md` covering providers, latency, CORS, security, UI flow | none | DONE |
| M2 | Danbooru Visual Dictionary & Prompt Synthesizer | `src/assets/imageGen/types.ts`, `characterDictionary.ts`, `sceneTags.ts`, `intentDetector.ts`, `promptSynthesizer.ts` | none | DONE |
| M3 | Image Generation Providers & Client Service | `src/assets/imageGen/providers/pollinations.ts`, `fal.ts`, `together.ts`, `imageService.ts` | M2 | DONE |
| M4 | Perceived Latency UX & Chat UI Integration | `src/assets/chatUtils/send.ts`, `src/views/ChatView/ChatDraggable.vue`, `src/components/ImageModalViewer.vue` | M2, M3 | DONE |
| M5 | Settings UI & Multilingual BYOK Persistence | `src/assets/storeUtils/store.ts`, `src/views/DialogView/SettingWindow.vue`, `src/assets/i18n/*.json` | M3 | DONE |
| M6 | Automated Testing & Build Hardening | `src/tests/studentImageGeneration.test.ts`, all Vitest tests passing, production build pass | M1, M2, M3, M4, M5 | DONE |

## Interface Contracts

### 1. `src/assets/imageGen/types.ts`
```typescript
export type ImageGenProviderType = 'pollinations' | 'fal' | 'together';

export interface CharacterVisualProfile {
  characterTag: string; // e.g., 'sunaookami_shiroko_(blue_archive)'
  halo: string[];       // e.g., ['halo', 'blue_halo', 'geometric_halo']
  hair: string[];       // e.g., ['grey_hair', 'short_hair', 'wolf_cut']
  eyes: string[];       // e.g., ['heterochromia', 'blue_eye', 'amber_eye']
  features: string[];   // e.g., ['wolf_ears', 'animal_ears']
  outfits: Record<string, string[]>; // e.g., { default: ['abydos_school_uniform', 'blue_scarf'] }
}

export interface PhotoIntentResult {
  isPhotoRequested: boolean;
  sceneHint?: string;
  triggerType: 'selfie' | 'activity' | 'outfit' | 'direct' | 'none';
}

export interface PromptSynthesisOptions {
  studentIdOrName: string | number;
  sceneTags?: string[];
  userMessage?: string;
  studentReply?: string;
  locale?: string;
  outfitVariant?: string;
}

export interface SynthesizedPrompt {
  prompt: string;
  negativePrompt: string;
  characterTags: string[];
  sceneTags: string[];
}

export interface ImageGenConfig {
  enabled: boolean;
  provider: ImageGenProviderType;
  apiKey?: string;
  model?: string;
}
```

### 2. `src/assets/imageGen/imageService.ts`
```typescript
export async function generateStudentPhoto(
  studentIdOrName: string | number,
  context: {
    userMessage: string;
    studentReplyText?: string;
    sceneTags?: string[];
  },
  config: ImageGenConfig
): Promise<string>;
```

### 3. `src/assets/chatUtils/send.ts` ↔ Image Pipeline
```typescript
// When photo intent is detected during handleAIReplyTrigger:
// 1. LLM streams student dialogue text
// 2. Placeholder talk pushed: pushTalk(0, "📷 撮影中...", 0)
// 3. Background call to generateStudentPhoto()
// 4. On resolve: talkHistory.setTalkContent(placeholderId, imageUrl)
// 5. On error: talkHistory.setTalkContent(placeholderId, fallbackApology)
```

## Code Layout
- `docs/ARCHITECTURE_IMAGE_GEN.md`: Architecture design & technical selection specification
- `src/assets/imageGen/`:
  - `types.ts`: TypeScript contracts for visual profiles, prompts, providers
  - `characterDictionary.ts`: Danbooru tags for all 23 prompt-supported students + Arona
  - `sceneTags.ts`: Contextual scene, pose, expression, lighting, background tags
  - `intentDetector.ts`: Multilingual fast regex + trigger extraction
  - `promptSynthesizer.ts`: 4-tier prompt composition & negative prompt assembly
  - `imageService.ts`: Central orchestration service with timeout & in-character error fallback
  - `providers/`:
    - `pollinations.ts`: Zero-key Pollinations.ai generator
    - `fal.ts`: Fal.ai Flux Schnell browser caller
    - `together.ts`: Together AI browser caller
- `src/components/ImageModalViewer.vue`: Lightbox modal viewer for chat photos
- `src/views/ChatView/ChatDraggable.vue`: Chat bubble rendering, placeholder detection, click-to-enlarge modal trigger
- `src/assets/chatUtils/send.ts`: Two-stage dialogue-first photo trigger & reactive update
- `src/assets/storeUtils/store.ts`: Settings store extension and localStorage serialization
- `src/views/DialogView/SettingWindow.vue`: Image generation settings page UI (Page 3)
- `src/assets/i18n/*.json`: Multilingual translation strings for all 5 locales
- `src/tests/studentImageGeneration.test.ts`: Automated Vitest test suite
