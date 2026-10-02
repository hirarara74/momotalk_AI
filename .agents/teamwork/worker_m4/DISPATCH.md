## 2026-09-29T20:21:33Z

You are Worker M4 (worker_m4).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m4
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Your exclusive write ownership:
- src/components/ImageModalViewer.vue
- src/views/ChatView/ChatDraggable.vue
- src/assets/chatUtils/send.ts
- src/views/ChatView/chat-draggable.scss (if needed for styling)

Reference materials:
- c:\Users\USER\Documents\GitHub\momotalk-ai\docs\ARCHITECTURE_IMAGE_GEN.md (Section 5 Perceived Latency UX Flow & Component Interactions)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_1\report.md (Chat UI touchpoints and message models)
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\assets\imageGen\index.ts (exports generateStudentPhoto, detectPhotoIntent, extractPhotoDirective, buildPhotoPromptDirective, getStudentApologyMessage, isPhotoUrl)
- c:\Users\USER\Documents\GitHub\momotalk-ai\src\assets\storeUtils\store.ts (exports store reactive properties: imageGenEnabled, imageGenProvider, imageGenApiKey, imageGenModel, showImageModal, modalImageUrl, modalStudentName)

Task:
Implement the Perceived Latency UX, Chat UI Integration, and Image Modal Viewer:
1. `src/components/ImageModalViewer.vue`:
   - Create a clean Blue Archive MomoTalk-styled photo lightbox modal component.
   - Binds to `store.showImageModal`, `store.modalImageUrl`, and `store.modalStudentName`.
   - Features:
     - Backdrop overlay with click-to-close and Escape key listener.
     - Header showing photo title: student name + photo ("📷 {studentName}").
     - Centered photo with zoom controls (Zoom In, Zoom Out, Reset).
     - Download/Save button ("ダウンロード" / "Save" using `$t('savePhoto') || '保存'`) that downloads the image to the user's computer.
     - Close button ("✕").
     - Smooth fade/scale animation and responsive mobile-friendly design.
2. `src/views/ChatView/ChatDraggable.vue`:
   - Mount `<image-modal-viewer />` in the template.
   - Detect shooting placeholder message:
     - When `element.content.includes('📷 撮影中') || element.content.includes('takingPhoto') || element.content === '📷 撮影中...'`:
       Render an animated shooting indicator bubble:
       Camera icon 📷 + animated pulsing text ("📷 撮影中...") or typing animation, styled inside the student speech bubble.
     - When `element.content` is an image URL (matches `checkImg(element.content)` or `isPhotoUrl(element.content)`):
       Render `<img :src="element.content" class="chat-img" @click="handleImageClick(element)" />`.
       In `handleImageClick(element)`:
       - If `element.type === 0` (student message): open modal viewer:
         `store.showImageModal = true; store.modalImageUrl = element.content; store.modalStudentName = element.Name;`
       - If `element.type === 1` (Sensei message): invoke `changeImage($event, element.Id)`.
3. `src/assets/chatUtils/send.ts`:
   - In `handleAIReplyTrigger(text: string)` or `triggerAIReply()`:
     - Detect photo intent using `detectPhotoIntent(text)`.
     - If `store.imageGenEnabled !== false` and `intent.isPhotoRequested`:
       - Append `buildPhotoPromptDirective(store.language)` to the system prompt or user prompt so the LLM outputs immediate dialogue and optional `[PHOTO: ...]` tags.
       - The LLM streams student dialogue text ("自撮り？ちょっと待ってね、今撮るから！").
       - When streaming completes (or during chunks):
         Parse dialogue with `extractPhotoDirective(accumulatedText)`.
         Set student dialogue talk content to `cleanText`.
       - Immediately push a student placeholder talk:
         `const placeholderTalk = talkHistory.pushTalk(0, '📷 撮影中...', 0);`
       - Asynchronously trigger `generateStudentPhoto`:
         ```typescript
         generateStudentPhoto(
           targetStudent.Id,
           {
             userMessage: text,
             studentReplyText: cleanText,
             sceneTags: photoTags.length > 0 ? photoTags : (intent.sceneHint ? [intent.sceneHint] : undefined)
           },
           {
             enabled: store.imageGenEnabled !== false,
             provider: store.imageGenProvider || 'pollinations',
             apiKey: store.imageGenApiKey,
             model: store.imageGenModel
           }
         ).then(imageUrl => {
           if (imageUrl) {
             talkHistory.setTalkContent(placeholderTalk.Id, imageUrl);
           }
         }).catch(err => {
           const apology = getStudentApologyMessage(targetStudent.Id, store.language);
           talkHistory.setTalkContent(placeholderTalk.Id, apology);
         });
         ```
       - This guarantees zero perceived latency: student dialogue arrives in ~1.5s, placeholder indicates shooting in progress, and the photo smoothly resolves and replaces the placeholder.
