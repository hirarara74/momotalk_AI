# MomoTalk Chat UI & Message Architecture Survey Report

**Explorer**: Explorer 1 (`explorer_survey_1`)  
**Date**: 2026-09-29  
**Target Project**: MomoTalk AI (`momotalk-ai`)  
**Scope**: MomoTalk Chat UI, Message Data Models, State Management, Typing Indicators, Image Handling & Modal Viewers, Perceived Latency UX Integration Touchpoints.

---

## 1. Executive Summary

This survey provides a comprehensive architectural and code-level investigation of the MomoTalk chat application. The goal is to provide the exact blueprints and integration touchpoints needed to implement **dynamic student photo generation** with **perceived latency UX** (immediate dialogue response → shooting placeholder → seamless image replacement → click-to-enlarge modal viewer).

### Key Architectural Findings:
1. **Frontend Architecture**: Vue 3.3.4 (SFC, Composition & Options API mix), Vite 4.3.9, TypeScript 5.0.4, Sass, and Vue-i18n.
2. **State Management**: Uses native Vue 3 `reactive` stores (`store.ts`, `talkHistory.ts`, `selectList.ts`) rather than Pinia or Vuex. Storage is synchronized with browser `localStorage`.
3. **Message Model**: Centered on the `Talk` interface (`src/assets/requestUtils/interface.ts`). Messages do **not** use a distinct `type` enum for images; images are detected dynamically via regex pattern matching (`checkImg(content)`) on the polymorphic `content` string.
4. **Current Image Interaction**: Clicking an image currently invokes `changeImage()` which triggers a local file upload picker (`<input type="file">` via `readFile`) to overwrite the chat image. **There is currently NO click-to-enlarge modal or lightbox viewer in MomoTalk.**
5. **Typing / Loading Mechanism**: A 3-dot pulse animation (`TypingAnimation.vue`) is conditionally shown if `isMessageTyping(element)` is true. It depends on `store.isAiResponding` and `element.content === ''`.
6. **Perceived Latency UX Ready**: Because `talkHistory` is reactive and messages are rendered dynamically based on `element.content` and properties, a two-stage student response (dialogue bubble + shooting placeholder bubble → async image replacement) integrates cleanly into `send.ts` and `ChatDraggable.vue`.

---

## 2. MomoTalk Chat UI Components

### 2.1 Component Tree & Hierarchy

```
App.vue (Global Layout & Dialog Root)
 ├── PlayerDialog (DialogView/PlayerWindow.vue) - Story replay modal
 ├── SettingDialog (DialogView/SettingWindow.vue) - App & AI settings modal
 ├── HelpDialog (DialogView/HelpWindow.vue) - Markdown guide modal
 ├── header#header / nav#sidebar / section#listcard (Student list)
 └── RouterView#chatcard (ChatView/ChatView.vue)
      ├── .chat-header-bar (Student avatar, name, Kizuna rank, sleep status, clear chat)
      ├── .talk-list#talkList (Scroll container for messages)
      │    └── ChatDraggable.vue (Draggable message list)
      │         ├── .chat-date-divider (Date separators)
      │         ├── .chat-item-wrapper
      │         │    ├── .student / .sensei / .story / .choice / .message
      │         │    │    ├── .avatar + .name (for student messages)
      │         │    │    └── .container
      │         │    │         ├── .box-story -> ChatBlock.vue
      │         │    │         ├── .box-choice -> ReplyBlock.vue
      │         │    │         ├── .box-message -> ChatBlock.vue
      │         │    │         ├── .box.img -> TypingAnimation.vue OR <img class="chat-img">
      │         │    │         └── .box -> TypingAnimation.vue OR ChatBlock.vue
      │         │    ├── .chat-meta (Read receipt "既読", timestamp)
      │         │    └── .action-block (Delete message button "x")
      └── #sendBar (Bottom interaction bar)
           ├── .attachment-bar (Attached image preview thumbnail + delete button)
           └── .input-bar (Sticker popper, textarea, photo button, send button)
```

### 2.2 Detailed Component Inventory

| File Path | Role | Key Logic / Template Elements |
|---|---|---|
| `src/App.vue` (lines 327–420) | Top-level application shell | Mounts modal dialogs (`PlayerDialog`, `SettingDialog`, `HelpDialog`). Passes `:studentInfo` and `:student` to `<RouterView id="chatcard" />`. |
| `src/views/ChatView/ChatView.vue` (lines 1–95, 341–395) | Main chat container | Manages active student resolution, paste event for images, textarea Enter key submission, photo picker (`_image()`), bottom autoscroll, and sleep periodic check. |
| `src/views/ChatView/ChatDraggable.vue` (lines 28–144) | Message list & bubble renderer | Implements `vuedraggable` over `tasks` (`talkHistory.talkHistory`). Renders bubbles according to message `type` (0=student, 1=sensei, 2=story, 3=choice, 4=system). |
| `src/views/ChatView/ChatBlock.vue` (lines 1–30) | Text bubble content renderer | Renders `v-html="props.element.content"` or `v-text`. Supports in-place `contenteditable` editing and markdown parsing. |
| `src/views/ChatView/ReplyBlock.vue` (lines 1–30) | Choice option item | Renders individual choice button for branching dialogue (`type === 3`). |
| `src/components/TypingAnimation.vue` (lines 1–60) | Typing / loading indicator | 3 bouncing dots (`ball-beat` CSS keyframes animation) rendered when waiting for AI stream. |

### 2.3 Message Bubble Types & Rendering Rules

Defined in `src/views/ChatView/ChatDraggable.vue` (lines 35–140) and styled in `chat-draggable.scss`:

1. **Student Message (`element.type === 0`)**:
   - Layout: Grid `grid-template-columns: zoom(75px) zoom(15px) 1fr`.
   - Avatar: Rendered when `element.flag > 0` (`v-lazy="element.Avatar"`). When `flag === 0` (consecutive message from same student), avatar is hidden and `.student--split` spacer is used.
   - Name: Displayed above bubble when `flag > 0`. Localized via `getLocalizedStudentName(element.Name)` using `resolveCanonicalStudent`.
   - Bubble: Background is light grey (`$grey` / `#ecf2fb`). Left speech bubble notch on first message (`.first .box:not(.img):before`).
2. **Sensei Message (`element.type === 1`)**:
   - Layout: Right-aligned (`flex-direction: row-reverse`).
   - No avatar or name displayed.
   - Bubble: Blue background (`#4a8ac6`), white text. Right notch on first message (`.first .box:not(.img):before`).
3. **Bond Story Banner (`element.type === 2`)**:
   - Pink themed card (`.box-story`), background image `/story.png`, pink left border.
4. **Choice / Reply Options (`element.type === 3`)**:
   - Selection card (`.box-choice`), background image `/reply.png`, blue accent. Options separated by `\n` into `<reply-block>`.
5. **System Notice (`element.type === 4`)**:
   - Centered light pill (`.box-message`).
6. **Image Message Bubble (`checkImg(element.content) === true`)**:
   - Rendered in `.box.img`:
     ```html
     <div class="box img" v-else-if="checkImg(element.content)">
         <typing-animation class="loading" v-if="isMessageTyping(element)"></typing-animation>
         <img v-else :src="element.content" class="chat-img" @click="changeImage($event, element.Id)" />
     </div>
     ```
   - Styled with white background (`background-color: white !important`), border `2px solid $chatborder-color`, and `.chat-img` max dimensions: `max-width: 100%`, `max-height: zoom(200px)`.

---

## 3. Message Data Models & Types

### 3.1 Existing Types in `src/assets/requestUtils/interface.ts`

```typescript
// lines 1-5
interface baseStudent {
    Id: number
    Name: string
    Avatar: string
}

// lines 45-51
interface Talk extends baseStudent {
    type: number // 0: student | 1: sensei | 2: story | 3: choice | 4: system
    content: string
    // Flag for displaying avatar: 
    // 0: not first of same type (hide avatar)
    // 1: not first of diff type (show avatar)
    // 2: first of same type (show avatar)
    flag: number
    time?: number // message timestamp (ms)
}
```

### 3.2 Critical Observations on the Data Model

1. **Polymorphic `content`**:
   - For text messages: `content` holds markdown/HTML string (e.g. `<p>Hello Sensei</p>`).
   - For image messages: `content` holds a base64 Data URL (`data:image/png;base64,...`) or an HTTP(S) image URL.
   - There is **no dedicated `type` enum value for images**. An image sent by a student has `type: 0`; an image sent by Sensei has `type: 1`.
2. **Image Detection Mechanism (`checkImg`)**:
   - Located in `src/views/ChatView/ChatDraggable.vue` (lines 188–192):
     ```typescript
     checkImg(content: string){
         const suffix = `(bmp|jpg|png|tif|gif|svg|webp|jpeg)`
         var regular = new RegExp(`(data:image.*)|((http|https)://.*\\.${suffix})|(/.*\\.${suffix})`)
         return regular.test(content)
     }
     ```
   - **Crucial Gotcha**: If a generated image URL does not end with a recognized extension (e.g. `https://image.pollinations.ai/prompt/shiroko` or query strings like `?width=512`), `checkImg()` returns `false` and renders it as plain text!
   - **Solution for Implementation**:
     1. Add `.jpg` or `.png` to the generated image URL (e.g. `https://image.pollinations.ai/prompt/${encodedPrompt}.jpg`).
     2. Update `checkImg` regex to accommodate query parameters (`(\?.*)?$`) or recognize Pollinations / image provider hosts.
     3. Alternatively, add an optional property to `Talk`: `isImage?: boolean` or `status?: 'shooting' | 'ready' | 'error'`.
3. **Snippet Detection in `talkHistory.ts`**:
   - Located in `src/assets/storeUtils/talkHistory.ts` (lines 425–427):
     ```typescript
     if (content.startsWith('data:image/') || content.includes('<img')) {
         return '[画像]'
     }
     ```
   - If an external HTTP URL is used directly in `content`, the chat preview snippet on the student sidebar might show the raw URL unless `checkImg` or `content.startsWith('http') && (checkImg(content) || content.includes('image'))` is also handled.

---

## 4. Chat State Management

### 4.1 State Management Architecture

State is managed via native Vue 3 `reactive` stores rather than external libraries (no Pinia or Vuex):

1. **`src/assets/storeUtils/store.ts` (`export const store = reactive({ ... })`)**:
   - Manages UI toggles: `showSettingDialog`, `showPlayerDialog`, `showHelpDialog`, `settingDialogPage`.
   - Manages app config: `language`, `theme`, `zoom`, `fullScreen`, `draggable`, `soundEnabled`, `soundVolume`.
   - Manages AI config: `aiEnabled`, `aiProvider` (`groq`, `gemini`, `openai`, `claude`), `aiApiKey`, `aiModel`, `aiBaseUrl`, `isAiResponding`.
   - Manages active chat: `currentChatStudent`, `studentRanks`.
   - Typing state: `typing` (number countdown timer used for auto-scroll and legacy animations), `text` (active textarea content).
   - Syncs to `localStorage` via `store.setData()` and restores via `store.getData()`.

2. **`src/assets/storeUtils/talkHistory.ts` (`export const talkHistory = reactive({ ... })`)**:
   - Active message array: `talkHistory: Talk[]`.
   - Current student tracker: `currentStudentId: number`.
   - ID generator: `talkId: number`.
   - Interaction timestamps: `studentChatTimes: Record<number, number>`.
   - Sleeping schedule queue: `pendingWakeups: Record<number, PendingWakeupItem>`.
   - History persistence:
     - Active student conversation is saved in `localStorage.getItem('momotalk_chat_' + student.Id)`.
     - Mirrored in `localStorage.getItem('talkHistory')`.
   - Key operations:
     - `pushTalk(talk: Talk)`: Appends message, manages `flag` (avatar grouping), records interaction timestamp, saves to localStorage.
     - `setTalkContent(id: number, content: string)`: Replaces content of message `id` reactively and persists.
     - `loadStudentTalks(student)`: Switches student thread, aborts any ongoing streaming, loads saved talks or creates initial greeting.
     - `clearStudentTalks(student)`: Resets thread back to initial greeting.

3. **`src/assets/chatUtils/send.ts`**:
   - Orchestrates message dispatch and AI generation.
   - Core functions:
     - `sendSenseiMessage(text)`: Appends Sensei's message and triggers AI reply.
     - `sendImagePayload(char, imageDataUrl, flag, caption)`: Sends image talk + optional caption talk.
     - `handleAIReplyTrigger(userMessageText)`: Evaluates sleep schedule; if awake, calls `triggerAIReply`.
     - `triggerAIReply(userMessageText, options)`: Manages streaming lifecycle:
       1. Appends empty student talk: `{ Id: talkHistory.talkId++, Name, Avatar, type: 0, flag: 2, content: '' }`.
       2. Sets `store.isAiResponding = true`.
       3. Sets `store.typing = 1` for scroll & typing animation.
       4. Awaits 1.5s delay for realistic typing cadence.
       5. Calls `aiProvider.streamChat(systemPrompt, history, promptInput, onChunk, signal)`.
       6. On chunk: `talkHistory.setTalkContent(replyTalk.Id, re.md2html(accumulatedText))`.
       7. On completion: saves talks, detects sentiment (`detectInteractionSentiment`), adjusts relationship rank (`store.increaseRelationshipRank` / `decreaseRelationshipRank`), plays sound effects (`'receive'`, `'rankup'`).
       8. In `finally`: `store.isAiResponding = false`, `store.typing = 0`.

---

## 5. Current Loading & Typing Indicator Mechanisms

### 5.1 Indicator Logic in `send.ts`

```typescript
// src/assets/chatUtils/send.ts lines 37-53
export function isMessageTyping(element: Talk): boolean {
    if (!element) return false
    // 先生の発言は常に即時表示
    if (element.type === 1) return false

    // AIが返信中: 生徒側の空メッセージ枠の場合、返信が届くまで入力中アニメーションを継続
    if (store.isAiResponding && element.type === 0 && (!element.content || element.content.trim() === '')) {
        return true
    }

    // 従来のtypingタイマー用（直近の空メッセージ枠の場合のみ）
    if (store.typing > 0 && element.Id === talkHistory.talkId - 1 && (!element.content || element.content.trim() === '')) {
        return true
    }

    return false
}
```

### 5.2 Component Structure in `TypingAnimation.vue`

```html
<template>
    <div class="loading">
        <div></div>
        <div></div>
        <div></div>
    </div>
</template>
```
- Styled with CSS keyframes `@keyframes ball-beat` creating a rhythmic 3-dot bounce.
- Height is constrained to `zoom(32px)`, dots to `zoom(10px)`.

### 5.3 Limitations for Image Generation
- `isMessageTyping` is binary: it only displays the 3-dot animation when `element.content === ''`.
- For image generation, the user needs contextual feedback: **"📷 撮影中..."** (shooting / preparing photo), rather than just generic typing dots.
- Once text arrives or if a placeholder is placed, standard typing stops.

---

## 6. Image Handling & Modal Viewer

### 6.1 Current In-Chat Image Rendering
- Chat images are styled in `src/views/ChatView/chat-draggable.scss`:
  ```scss
  .chat-img {
      max-width: 100%;
      max-height: zoom(200px);
      width: auto;
  }
  .box.img {
      background-color: white !important;
      border: 2px solid $chatborder-color;
  }
  ```
- Images are constrained to `max-height: 200px`, which is ideal for a mobile messenger feed, but makes detailed anime illustrations and student selfies hard to see in detail without enlargement.

### 6.2 Current Image Click Behavior
- Currently in `ChatDraggable.vue`:
  ```html
  <img
      v-else
      :src="element.content"
      class="chat-img"
      @click="changeImage($event, element.Id)"
  />
  ```
- Method `changeImage(evt, id)` (lines 168–176):
  ```typescript
  changeImage(evt: Event, id: number) {
      var reader = new FileReader()
      reader.addEventListener('load', () => {
          var ele = evt.target! as HTMLImageElement
          ele.src = reader.result as string
          talkHistory.setTalkContent(id, reader.result as string)
      })
      readFile(reader)
  }
  ```
- **Finding**: Clicking any image in the chat opens the OS file picker dialog to overwrite the image with a local file. This is a legacy feature from MomoTalk's original scenario editor origin.
- **Requirement R3 Conflict**: For student-sent AI generated photos, clicking should **open the Click-to-enlarge modal viewer** instead of prompting a file upload!

### 6.3 Existing Modal / Dialog Infrastructure
- MomoTalk uses modal dialogs in `src/views/DialogView/`:
  - `PlayerWindow.vue`: Bond story player modal.
  - `SettingWindow.vue`: Settings modal with tabs (`basicSetting`, `aiSetting`).
  - `HelpWindow.vue`: Help guide modal with markdown renderer.
- All dialogs follow a unified pattern:
  - Mask: `<div v-if="store.show..." class="dialog-mask flex-center" @click="...">`
  - Container: `<div class="popper-content popper-content--..." @click.stop>`
  - Header: `.popper-content__title` with title and `<IconClose class="close-btn" />`
  - Transition: `<transition name="dialog-fade">` defined in `dialog-view.scss`.

---

## 7. Requirements & UI Integration Touchpoints for Perceived Latency UX

The prompt requires a low-latency, responsive user experience for dynamic image generation. The table below details the exact requirements, UI states, and code touchpoints.

### 7.1 UX Interaction Flow Diagram

```
Sensei: "自撮り送って！" (Send selfie request)
  │
  ├─▶ [Step 1: Immediate Dialogue Response (~1.0s)]
  │     Student Bubble 1 (Text):
  │     "自撮り？ちょっと待っててね、今撮るから！"
  │     (Sound: 'receive' + Kizuna rank up)
  │
  ├─▶ [Step 2: Shooting Placeholder Inserted (~1.2s)]
  │     Student Bubble 2 (Photo Placeholder):
  │     [ 📷 撮影中... ] (Pulsing camera indicator / shutter animation)
  │
  ├─▶ [Step 3: Background Generation & Fetch (~3-8s)]
  │     Client-side async request to Pollinations.ai or BYOK provider
  │     Image preloads in memory via new Image()
  │
  ├─▶ [Step 4: Seamless Replacement]
  │     Student Bubble 2 transitions smoothly from [📷 撮影中...] to <img src="..."/>
  │     (Sound: 'receive' notification)
  │     Talk saved to localStorage
  │
  └─▶ [Step 5: Interactive Image Viewer]
        User clicks image bubble -> ImageModalViewer opens
        - Full-screen high-res display
        - Student name & photo caption
        - "画像を保存" (Save image to disk) button
        - Close on click-outside or "×" button
```

### 7.2 Detailed Touchpoint Analysis

#### Touchpoint 1: Immediate Dialogue Response (First Message)
- **Location**: `src/assets/chatUtils/send.ts` in `handleAIReplyTrigger` / `triggerAIReply`.
- **Mechanism**:
  - Detect image request intent from Sensei's message (e.g. keywords "自撮り", "写真", "今何してる", or LLM prompt extraction).
  - When triggered, the student sends an immediate dialogue text bubble *first* (e.g., "自撮り？ちょっと待ってね、今撮るから！").
  - This can be generated quickly via LLM or via character-specific photo prelude phrases from the visual dictionary.
  - Perceived latency drops from 8–15 seconds to under 1.5 seconds.

#### Touchpoint 2: Shooting Placeholder Bubble ('📷 撮影中...')
- **Location**: `src/views/ChatView/ChatDraggable.vue` & `chat-draggable.scss`.
- **Message Representation**:
  - Add a talk item to `talkHistory`:
    ```typescript
    const photoTalk: Talk = {
        Id: talkHistory.talkId++,
        Name: student.Name,
        Avatar: student.Avatar,
        type: 0,
        flag: 0, // grouped with preceding student message
        content: '[SHOOTING_PHOTO]',
        time: Date.now()
    }
    talkHistory.pushTalk(photoTalk)
    ```
- **UI Rendering in `ChatDraggable.vue`**:
  ```html
  <!-- 撮影中プレースホルダー -->
  <div class="box img shooting-box" v-else-if="element.content === '[SHOOTING_PHOTO]' || element.isShooting">
      <div class="shooting-indicator">
          <span class="camera-icon">📷</span>
          <span class="shooting-text">{{ $t('shootingPhoto') }}</span>
          <div class="shooting-pulse"></div>
      </div>
  </div>
  ```
- **Styling**:
  - Camera shutter / pulse effect with MomoTalk theme pink/blue accent.
  - Matches the dimension footprint of a chat image bubble so layout does not jump abruptly when loaded.

#### Touchpoint 3: Seamless Image Replacement & Error Fallback
- **Location**: Async completion handler in `send.ts` or a new dedicated service `src/assets/ai/studentImageService.ts`.
- **Replacement Logic**:
  ```typescript
  try {
      const imageUrl = await generateStudentPhoto(student, prompt)
      // Preload image in memory to ensure zero flicker
      await preloadImage(imageUrl)
      // Seamlessly update reactive talkHistory
      talkHistory.setTalkContent(photoTalk.Id, imageUrl)
      talkHistory.saveCurrentStudentTalks()
      playMomoTalkSound('receive')
  } catch (error) {
      // Graceful fallback to student dialog
      talkHistory.setTalkContent(
          photoTalk.Id, 
          '（ごめんね先生、カメラの調子が悪くて写真がうまく撮れなかったみたい…もう一回お願いできる？）'
      )
  }
  ```

#### Touchpoint 4: Click-to-Enlarge Modal Viewer (`ImageModalViewer.vue`)
- **Location**:
  - Create new component: `src/components/ImageModalViewer.vue` (or `src/views/DialogView/ImageModalWindow.vue`).
  - Register in `src/App.vue` alongside `<PlayerDialog>`, `<SettingDialog>`, `<HelpDialog>`.
  - State in `src/assets/storeUtils/store.ts`:
    ```typescript
    showImageModal: false,
    modalImageUrl: '',
    modalImageTitle: '',
    openImageModal(url: string, title?: string) {
        this.modalImageUrl = url
        this.modalImageTitle = title || ''
        this.showImageModal = true
    },
    closeImageModal() {
        this.showImageModal = false
        this.modalImageUrl = ''
    }
    ```
- **Click Routing in `ChatDraggable.vue`**:
  ```html
  <img
      v-else
      :src="element.content"
      class="chat-img"
      @click="handleImageClick(element)"
  />
  ```
  ```typescript
  handleImageClick(element: Talk) {
      // If student photo or external image, open modal viewer
      if (element.type === 0 || !store.draggable) {
          store.openImageModal(element.content, element.Name)
      } else {
          // If in edit mode / sensei image, offer edit or enlarge
          store.openImageModal(element.content, element.Name)
      }
  }
  ```
- **Modal Features**:
  - Centered high-resolution image with `max-height: 85vh`, `max-width: 90vw`.
  - Header with student name badge and timestamp.
  - "画像を保存" (Save Image) action button triggering direct file download (`student-photo-[timestamp].png`).
  - Background overlay click or Escape key closes the modal.

#### Touchpoint 5: Settings Window Integration (SettingWindow.vue)
- **Location**: `src/views/DialogView/SettingWindow.vue` (Page 2: AI settings).
- **Settings to add**:
  1. Toggle: `imageGenerationEnabled` (default: true).
  2. Provider selector: Pollinations.ai (Default / Free / No key) vs BYOK (Fal.ai, Together AI, Replicate).
  3. API key field for BYOK (stored in `localStorage`).
  4. i18n keys across all 5 locale files (`i18n-jp.ts`, `i18n-en.ts`, `i18n-kr.ts`, `i18n-tw.ts`, `i18n-zh.ts`).

---

## 8. Summary Table of Files to Modify / Create

| File | Purpose | Action |
|---|---|---|
| `src/assets/requestUtils/interface.ts` | Add optional `isShooting?: boolean` or `status?: string` to `Talk` | Update interface |
| `src/views/ChatView/ChatDraggable.vue` | Add shooting placeholder bubble, update `checkImg` regex, route image click to modal viewer | Edit template & methods |
| `src/views/ChatView/chat-draggable.scss` | Add `.shooting-box`, `.shooting-indicator`, camera animation styles | Add CSS rules |
| `src/assets/storeUtils/store.ts` | Add image modal state (`showImageModal`, `modalImageUrl`) and image gen settings | Extend reactive store |
| `src/components/ImageModalViewer.vue` | Full-screen image viewer with save/download button | **New component** |
| `src/App.vue` | Mount `<ImageModalViewer />` | Mount component |
| `src/assets/chatUtils/send.ts` | Integrate immediate dialogue reply + shooting placeholder + async photo trigger | Orchestration logic |
| `src/assets/ai/studentImageService.ts` | Character visual dictionary, prompt builder, Pollinations/BYOK fetcher | **New service** |
| `src/views/DialogView/SettingWindow.vue` | Add image generation provider & toggle controls in AI settings tab | Update settings UI |
| `src/locales/i18n-*.ts` (jp, en, kr, tw, zh) | Localization for '📷 撮影中...', '画像保存', settings keys | Add locale keys |
| `src/tests/studentImageGeneration.test.ts` | Vitest suite for prompt resolution, placeholder transition, and image modal state | **New test file** |

---

## 9. Conclusion

The MomoTalk codebase has a clean, reactive foundation that readily supports dynamic student photo generation. Because state is driven by Vue 3 `reactive` stores (`talkHistory.ts`), mutating a talk bubble's content from a shooting placeholder (`📷 撮影中...`) to an image URL instantly updates the DOM with zero page reload.

By intercepting student image requests, immediately replying with an in-character dialogue bubble, rendering an animated camera placeholder, and swapping in the loaded image asynchronously, the perceived latency will remain under 1.5 seconds regardless of network generation time. Adding `ImageModalViewer.vue` resolves the current deficiency where clicking an image opens an unwanted file upload dialog, completing the authentic MomoTalk mobile experience.
