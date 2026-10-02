# Handoff Report — Explorer Survey 2

**Type**: Hard Handoff (Task Complete)  
**Agent**: Explorer Survey 2 (`explorer_survey_2`)  
**Target Recipient**: Parent Orchestrator (`orchestrator_1` / `816fdcdb-2ddc-4930-93e4-4ee54bf0bf11`)  
**Date**: 2026-09-29 / 2026-09-30  
**Artifact Reference**: Comprehensive Report at `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_2\report.md`

---

## 1. Observation

1. **Student Data Models**:
   - `src/assets/requestUtils/interface.ts` (lines 1-59): Defines `baseStudent` (Id, Name, Avatar), `studentInfo` (Id, Avatars, Name, Bio, Nickname, Birthday, Age, School, Club, Star, Released, RelatedStudent, cnt), `LocalStudent`, and `Talk` (type, content, flag, time).
   - `src/assets/ai/prompts.ts` (lines 52-467): `STUDENT_CANONICAL_DATA` contains canonical student records with multilingual names across 5 languages (`jp`, `kr`, `en`, `zh`, `tw`), `callSensei`, and initial greetings.
   - `src/assets/ai/prompts.ts` (lines 1099-1123): `PROMPT_SUPPORTED_STUDENT_IDS` enumerates 23 prompt-supported student IDs: `10010` (Shiroko), `10005` (Hoshino), `10004` (Hina), `20008` (Ako), `10000` (Aru), `13010` (Yuuka), `10003` (Hifumi), `23008` (Mari), `10019` (Azusa), `10006` (Iori), `20001` (Karin), `10059` (Mika), `10062` (Toki), `10002` (Haruna), `13006` (Mutsuki), `10052` (Noa), `10063` (Koyuki), `10020` (Koharu), `16001` (Asuna), `10008` (Neru), `10049` (Kazusa), `10048` (Saori), `10011` (Shun). In addition, `public/Arona.webp` defines Arona.
   - `src/assets/ai/prompts.ts` (lines 469-513): `resolveCanonicalStudent(nameOrId)` accurately resolves students by numeric ID, exact name match, or substring match across all 5 languages.

2. **LLM Engine & Invocation**:
   - `src/assets/chatUtils/send.ts` (lines 104-110, 429-584): Sensei chat input (`char === 1`) calls `handleAIReplyTrigger(text)` which calls `triggerAIReply()`.
   - `triggerAIReply` builds the system prompt via `buildSystemPrompt(targetStudent, store.language)`, creates an empty student talk bubble (`type: 0, flag: 2, content: ''`), sets `store.typing = 1` and `store.isAiResponding = true`, introduces a 1.5s typing delay, and calls `aiProvider.streamChat(systemPrompt, history, promptInput, onChunk, signal)`.
   - `onChunk` updates `talkHistory.setTalkContent(replyTalk.Id, re.md2html(accumulatedText))`.
   - `src/assets/ai/index.ts` (lines 8-27): `getAIProvider()` returns `GroqProvider` (default), `OpenAIProvider`, `ClaudeProvider`, or `GeminiProvider`.

3. **Current Image Rendering in Chat UI**:
   - `src/views/ChatView/ChatDraggable.vue` (lines 101-114, 188-192): Detects images using `checkImg(element.content)` matching `(data:image.*)|((http|https)://.*\\.(bmp|jpg|png|tif|gif|svg|webp|jpeg))`. When `isMessageTyping(element)` is true, it renders `<typing-animation class="loading" />`. Once `element.content` contains an image URL, it renders `<img :src="element.content" class="chat-img" />`.
   - `src/assets/chatUtils/send.ts` (lines 586-633): `sendImagePayload(char, imageDataUrl, flag, caption)` demonstrates that `talkHistory.pushTalk` cleanly accepts image talks (`type: 0, content: imageDataUrl`).

4. **Test Suite Status**:
   - Running `npm test` via vitest executed 155 unit tests across 4 test files (`sleepSchedule.test.ts`, `webAppRelease.test.ts`, `multilingualSupport.test.ts`, `studentChat.test.ts`), with 100% passing (0 failures).

---

## 2. Logic Chain

1. **Intent Detection Feasibility**:
   - Observation 2 shows `send.ts` handles user messages directly in `handleAIReplyTrigger`.
   - Because user messages pass through this entry point, adding a client-side intent classifier (`detectPhotoIntent`) here introduces **0ms latency overhead**.
   - If photo intent is detected, injecting a photo directive into the prompt input (or system prompt) ensures the LLM generates a dialogue response AND appends a scene tag `[PHOTO: <tags>]`.
   - If the LLM omits the tag, a fallback prompt synthesizer can use student default tags and current time context, ensuring 100% trigger reliability.

2. **Zero-Perceived-Latency UX (R3)**:
   - Observation 2 & 3 show `triggerAIReply` streams dialogue directly into `talkHistory`.
   - If we separate the student dialogue from the image generation, the student's text reply ("自撮り？ちょっと待ってね、今撮るから！") appears within 1.5-2 seconds.
   - An image placeholder talk (`📷 撮影中...`) can immediately be pushed below the dialogue.
   - The image generation API (Pollinations.ai or BYOK) is triggered asynchronously in the background (taking 3-8s).
   - Once the image URL is resolved, updating the placeholder talk content immediately displays the photo. The user never perceives an idle freeze.

3. **Danbooru Character Fidelity (R2)**:
   - Observation 1 details the 23 prompt-supported students and Arona.
   - In modern anime diffusion models, raw character names alone often fail to produce accurate halos, eye heterochromia, or unique school accessories.
   - By creating a standardized Danbooru dictionary mapping each student's canonical tag (`<char>_(blue_archive)`), distinct halo pattern (`halo, <color> halo, <geometry> halo`), hair, eyes, and school uniform, and combining them with contextual scene tags (composition, pose, expression, location, lighting), high visual fidelity is achieved.

---

## 3. Caveats

- **Network-dependent image loading**: Pollinations.ai generates images on demand via URL. In environments without internet access, image generation will fail; graceful fallback (alert bubble in character voice) must be tested.
- **Content filtering**: Certain third-party anime models can produce unpredictable fan-art styles; strict negative prompts (`worst quality, bad anatomy, deformed halo, nsfw`) must be enforced.
- **No code modification in `src/` made during this survey**: Per the explorer role constraint, only analysis files in `.agents/teamwork/explorer_survey_2/` were created.

---

## 4. Conclusion

1. The MomoTalk codebase is ideally structured for this feature.
2. The recommended design is a **Two-Phase Hybrid Architecture**:
   - Fast-path regex classifier + LLM `[PHOTO: ...]` tag protocol.
   - Modular `src/assets/imageGen/` directory hosting `characterDictionary.ts` (all 23 students + Arona), `sceneTags.ts`, `intentDetector.ts`, `promptSynthesizer.ts`, `imageService.ts`, and providers (`pollinations.ts`, `fal.ts`, `together.ts`).
   - Dialogue-first asynchronous interaction UX ensuring zero perceived latency.
   - Store settings expansion with localStorage persistence and SettingWindow UI integration.
3. Detailed specifications and character tag mappings are fully documented in `report.md`.

---

## 5. Verification Method

1. **Verify Report & Documentation Artifacts**:
   - Check `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_2\report.md` exists and contains sections 1 through 11.
   - Check `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\explorer_survey_2\progress.md` reflects completed status.
2. **Verify Codebase Integrity**:
   - Run `npm test` from project root (`c:\Users\USER\Documents\GitHub\momotalk-ai`).
   - Expected result: 4 test files pass, 155 tests passing, zero regressions.
3. **Verify Tag Dictionary Accuracy**:
   - Inspect Section 5 of `report.md` to confirm canonical tags for all 23 students + Arona against Danbooru / Blue Archive official designs.
