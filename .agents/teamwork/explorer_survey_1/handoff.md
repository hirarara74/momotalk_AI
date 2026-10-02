# Handoff Report — MomoTalk Chat UI & Message Architecture Survey

**Agent**: Explorer 1 (`explorer_survey_1`)  
**Type**: Hard Handoff  
**Date**: 2026-09-29  
**Deliverable Report**: `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_1\report.md`

---

## 1. Observation

1. **Message List & Bubble Structure**:
   - `src/views/ChatView/ChatDraggable.vue` (lines 28–143): Renders messages using `<draggable :list="tasks" ...>`. Message type classes:
     - `student`: `element.type === 0`
     - `sensei`: `element.type === 1`
     - `story`: `element.type === 2`
     - `choice`: `element.type === 3`
     - `message`: `element.type === 4`
   - Image bubbles:
     ```html
     <!-- lines 99-114 of ChatDraggable.vue -->
     <div class="box img" v-else-if="checkImg(element.content)">
         <typing-animation class="loading" v-if="isMessageTyping(element)"></typing-animation>
         <img v-else :src="element.content" class="chat-img" @click="changeImage($event, element.Id)" />
     </div>
     ```
   - Regular text bubbles:
     ```html
     <!-- lines 116-122 of ChatDraggable.vue -->
     <div class="box" v-else>
         <typing-animation class="loading" v-if="isMessageTyping(element)"></typing-animation>
         <chat-block v-else :element="element"/>
     </div>
     ```

2. **Image Detection & Click Handling**:
   - In `ChatDraggable.vue` (lines 188–192):
     ```typescript
     checkImg(content: string){
         const suffix = `(bmp|jpg|png|tif|gif|svg|webp|jpeg)`
         var regular = new RegExp(`(data:image.*)|((http|https)://.*\\.${suffix})|(/.*\\.${suffix})`)
         return regular.test(content)
     }
     ```
   - In `ChatDraggable.vue` (lines 168–176): Clicking a chat image triggers `changeImage`:
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
     This opens a file dialog to replace the image. There is **no existing modal or lightbox image viewer**.

3. **Message Data Model**:
   - In `src/assets/requestUtils/interface.ts` (lines 45–51):
     ```typescript
     interface Talk extends baseStudent {
         type: number // 0: student | 1: sensei | 2: story | 3: choice | 4: system
         content: string
         flag: number // 0: non-first same type, 1: non-first diff type, 2: first same type
         time?: number // message timestamp (ms)
     }
     ```
   - No separate `type` exists for images. The `content` string is polymorphic (HTML or image URL/Data URL).

4. **Typing & Loading Mechanism**:
   - In `src/assets/chatUtils/send.ts` (lines 37–53):
     ```typescript
     export function isMessageTyping(element: Talk): boolean {
         if (!element) return false
         if (element.type === 1) return false
         if (store.isAiResponding && element.type === 0 && (!element.content || element.content.trim() === '')) {
             return true
         }
         if (store.typing > 0 && element.Id === talkHistory.talkId - 1 && (!element.content || element.content.trim() === '')) {
             return true
         }
         return false
     }
     ```
   - In `src/components/TypingAnimation.vue` (lines 1–60): 3 bouncing dots (`ball-beat` animation, 32px height, 10px dots).

5. **State Management**:
   - In `src/assets/storeUtils/talkHistory.ts`: `talkHistory` is a Vue 3 `reactive` object (`talkHistory: Talk[]`, `talkId: number`, `currentStudentId: number`).
   - `talkHistory.pushTalk(talk: Talk)` appends a message and saves to `localStorage` under `'momotalk_chat_' + student.Id`.
   - `talkHistory.setTalkContent(id: number, content: string)` mutates the talk content reactively and updates `localStorage`.
   - In `src/assets/storeUtils/store.ts`: `store` is a Vue 3 `reactive` object containing UI dialog states (`showSettingDialog`, `showPlayerDialog`, `showHelpDialog`) and AI settings (`aiEnabled`, `aiProvider`, `aiApiKey`).

6. **Current Test & Build Status**:
   - Command `npm test` passed: 4 test files, 155 tests passed.
   - Command `npm run build-only` passed: Vite production build completed in 6.13s with zero errors.

---

## 2. Logic Chain

1. **From Observation 1 & 3 (Message Rendering & Data Model)**:
   - Message bubbles in `ChatDraggable.vue` are conditionally rendered based on `checkImg(element.content)`.
   - Because `Talk.content` is reactive and dynamically tested, inserting a message with a placeholder like `[SHOOTING_PHOTO]` or `📷 撮影中...` and later updating `element.content` to a valid image URL will cause Vue 3 to seamlessly switch from the placeholder state to `<img class="chat-img">`.
2. **From Observation 2 (Image Click Handler)**:
   - Clicking an image currently opens `readFile` to overwrite the picture from the local filesystem.
   - In an AI chat context where students send photos, this is jarring and unintuitive.
   - A dedicated `ImageModalViewer.vue` component connected to `store.showImageModal` must be created, and `ChatDraggable.vue`'s `@click` must be redirected to open this modal for student photos.
3. **From Observation 2 (Regex Gotcha)**:
   - `checkImg` requires the string to match `(data:image.*)|((http|https)://.*\\.(bmp|jpg|png|tif|gif|svg|webp|jpeg))|(/.*\\.(bmp|jpg|png|tif|gif|svg|webp|jpeg))`.
   - If an AI image provider URL lacks an extension (e.g. `https://image.pollinations.ai/prompt/...`), `checkImg` will evaluate to `false` and render the URL as raw text.
   - Therefore, either the generated URLs must include an extension (e.g. `.jpg`), or `checkImg` regex must be adjusted to support query parameters / image provider hostnames.
4. **From Observation 4 & 5 (Streaming & Perceived Latency UX)**:
   - Currently, `triggerAIReply` in `send.ts` pushes an empty message and streams text chunks.
   - For student photos, a two-message sequence can be cleanly orchestrated:
     1. Immediate dialogue bubble (text): "自撮り？ちょっと待ってね、今撮るから！" (~1s).
     2. Shooting placeholder bubble: "📷 撮影中..." with camera indicator.
     3. Async image generation runs in background.
     4. On completion, `talkHistory.setTalkContent(photoTalk.Id, imageUrl)` is invoked, instantly replacing the placeholder with the photo.
   - This eliminates all perceived waiting time, meeting requirement R3.

---

## 3. Caveats

1. **CORS & Chat Screenshot Export**:
   - `src/assets/imgUtils/download.ts` uses `domtoimage.toPng` to export screenshots of `.talk-list`. If student images come from external domains without permissive CORS headers, `domtoimage` can fail. Generating images via Pollinations.ai or proxying/preloading them as base64 Data URLs prevents tainted canvas issues.
2. **Persistence of In-Flight Shooting States**:
   - If the user reloads the browser while a photo is in `[SHOOTING_PHOTO]` state, `localStorage` will contain that placeholder. The loader or `talkHistory.loadStudentTalks` should sanitize unresolved shooting placeholders into a polite retry notice on restart.
3. **i18n Completeness**:
   - Any new text keys (e.g., `shootingPhoto`, `saveImage`, `imageModalTitle`, image settings) must be added across all 5 locale files (`i18n-jp.ts`, `i18n-en.ts`, `i18n-kr.ts`, `i18n-tw.ts`, `i18n-zh.ts`) to avoid breaking `src/tests/multilingualSupport.test.ts`.

---

## 4. Conclusion

The MomoTalk frontend architecture is well-suited for dynamic student photo generation.
- **UI Extension**: Create `ImageModalViewer.vue` and mount in `App.vue`; add shooting placeholder branch in `ChatDraggable.vue`.
- **State Extension**: Add `showImageModal`, `modalImageUrl` to `store.ts`.
- **Interaction Flow**: Orchestrate immediate dialogue response + shooting placeholder in `send.ts`, with async image generation updating the bubble via `talkHistory.setTalkContent`.
- All baseline tests (155 tests) and production build are passing. Full blueprint and line-by-line touchpoint inventory is documented in `report.md`.

---

## 5. Verification Method

To independently verify all findings and baseline behavior:

1. **Verify Unit Tests**:
   ```bash
   npm test
   ```
   *Expected*: All 4 test suites (`multilingualSupport.test.ts`, `sleepSchedule.test.ts`, `studentChat.test.ts`, `webAppRelease.test.ts`) pass with 155 green tests.

2. **Verify Production Build**:
   ```bash
   npm run build-only
   ```
   *Expected*: `vite build` completes with exit code 0 and outputs production assets to `docs/`.

3. **Verify File Inspection**:
   - Confirm `ChatDraggable.vue` lines 99–114 and 168–176 for image bubble structure and `changeImage` logic.
   - Confirm `send.ts` lines 37–53 for `isMessageTyping` definition and lines 465–540 for AI streaming lifecycle.
   - Confirm `interface.ts` lines 45–51 for the `Talk` interface.
