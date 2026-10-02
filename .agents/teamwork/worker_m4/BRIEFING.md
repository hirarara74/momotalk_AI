# BRIEFING — 2026-09-30T05:30:00Z

## Mission
Implement Perceived Latency UX, Chat UI Integration, and Image Modal Viewer for MomoTalk AI photo generation.

## 🔒 My Identity
- Archetype: worker_m4
- Roles: implementer, qa, specialist
- Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_m4
- Original parent: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Milestone: M4 Perceived Latency UX & Chat UI Integration

## 🔒 Key Constraints
- Exclusive write ownership:
  - src/components/ImageModalViewer.vue
  - src/views/ChatView/ChatDraggable.vue
  - src/assets/chatUtils/send.ts
  - src/views/ChatView/chat-draggable.scss
- Zero perceived latency UX flow: student dialogue first, shooting placeholder bubble, photo replaces placeholder asynchronously.
- Lightbox modal with zoom, download/save, escape key, click-outside, mobile friendly.
- Pass npm run type-check, npm test, and npm run build-only.
- Integrity: no cheating, real implementations.

## Current Parent
- Conversation ID: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11
- Updated: 2026-09-29T20:21:33Z

## Task Summary
- **What to build**: ImageModalViewer.vue, ChatDraggable.vue modal integration & shooting indicator, send.ts two-stage photo trigger
- **Success criteria**:
  - Modal viewer handles zoom, download, escape/backdrop closing, title display
  - ChatDraggable displays shooting placeholder animated bubble, opens modal on student photo click
  - send.ts triggers dialogue first, inserts shooting placeholder, resolves photo asynchronously
  - All tests and type checks pass
- **Interface contracts**: docs/ARCHITECTURE_IMAGE_GEN.md
- **Code layout**: src/components/, src/views/ChatView/, src/assets/chatUtils/

## Key Decisions Made
- Implemented `ImageModalViewer.vue` with zoom controls (0.5x to 3.0x), reset, Escape key dismiss, backdrop click dismiss, title with localized student name, and robust blob/CORS download with fallback.
- Mounted `<image-modal-viewer />` in `ChatDraggable.vue`.
- Added `isShootingPlaceholder` in `ChatDraggable.vue` covering `'[SHOOTING_PHOTO]'`, `'📷 撮影中...'`, and substring matches.
- Styled `.box.shooting-box` and `.shooting-indicator` in `chat-draggable.scss` with camera pulse and text pulse animations.
- Implemented `handleImageClick`: student photos open the modal viewer (`store.showImageModal = true`, `store.modalImageUrl`, `store.modalStudentName`); Sensei photos invoke `changeImage`.
- Updated `triggerAIReply` in `send.ts`:
  - When `isPhotoFeatureActive && photoIntent.isPhotoRequested`, appends `buildPhotoPromptDirective(store.language)` to system prompt.
  - Dynamically strips `[PHOTO: ...]` directives during streaming using `extractPhotoDirective(chunk).cleanText` so raw tags are never shown to user.
  - Emits in-character dialogue immediately in Phase 1.
  - In Phase 2, pushes `placeholderTalk` with content `'📷 撮影中...'` and `flag: 0`.
  - In Phase 3, calls `generateStudentPhoto` in the background; swaps placeholder content with resolved `imageUrl` and plays `'receive'` sound, or in-character apology on failure.
  - Handles background storage updates if the user switches active students during generation.
  - Exported `pushStudentPlaceholderTalk` helper.

## Artifact Index
- `src/components/ImageModalViewer.vue`: Full lightbox modal component
- `src/views/ChatView/ChatDraggable.vue`: Chat renderer updated with shooting placeholder and image modal click
- `src/views/ChatView/chat-draggable.scss`: Shooting bubble & animation styles
- `src/assets/chatUtils/send.ts`: Two-stage dialogue-first photo trigger pipeline

## Change Tracker
- **Files modified**:
  - `src/components/ImageModalViewer.vue`: Created lightbox modal
  - `src/views/ChatView/ChatDraggable.vue`: Added shooting placeholder & image click handler
  - `src/views/ChatView/chat-draggable.scss`: Added shooting animation styles
  - `src/assets/chatUtils/send.ts`: Implemented two-stage photo trigger & placeholder push
- **Build status**: PASS (`vue-tsc` 0 errors, `vitest` 205 passed, `vite build` 0 errors)
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pass (205 tests passing)
- **Lint status**: Clean (type-check passes with 0 errors)
- **Tests added/modified**: Verified against all test suites including simulation suite in `studentImageGeneration.test.ts`

## Loaded Skills
- None
