# Handoff Report — Challenger 2 (Empirical Adversarial Review)

## 1. Observation

### Empirical Test Execution
- Executed `npx vitest run src/tests/challenger_2_stress.test.ts` (22 tests passed, 0 failed, verifying failure modes).
- Executed `npm test` (7 test files, 244 tests passed across the repository).
- Executed `npm run type-check` (0 type errors).
- Executed `npm run build-only` (Production build completed successfully).

### Direct Code Observations & Verbatim Errors

1. **Silent Fallback to Pollinations Prevents Student Apology from Ever Triggering**
   - File: `src/assets/imageGen/imageService.ts`, lines 187–214:
     ```typescript
     if (provider === 'fal') {
       if (!config.apiKey || !config.apiKey.trim()) {
         imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal })
       } else {
         try {
           imageUrl = await generateFalImage(prompt, config.apiKey, { signal: controller.signal })
         } catch (falError) {
           console.warn('[ImageService] Fal.ai generation failed, falling back to Pollinations.ai:', falError)
           imageUrl = await generatePollinationsImage(prompt, { signal: controller.signal })
         }
       }
     }
     ```
   - In `src/assets/imageGen/providers/pollinations.ts`, lines 67–97:
     `generatePollinationsImage` performs 0 network requests and synchronously returns `buildPollinationsUrl(prompt)`. It never rejects unless `signal.aborted` is already set before invocation.
   - In `src/assets/imageGen/imageService.ts`, lines 217–220:
     ```typescript
     } catch (error) {
       console.warn('[ImageService] Failed to generate student photo:', error)
       return getStudentApologyMessage(studentIdOrName, ctx.locale)
     }
     ```
   - Observation: When Fal.ai or Together AI returns HTTP 401 Unauthorized or HTTP 429 Too Many Requests, `imageService.ts` catches the error and invokes `generatePollinationsImage()`, which returns the Pollinations URL in <1ms. As verified in `src/tests/challenger_2_stress.test.ts` Suite 2.1, the result is `https://image.pollinations.ai/...`, and the student apology message is **never returned**.

2. **Unhandled TypeError Crash When Talk is Cleared / Deleted During Background Generation**
   - File: `src/assets/storeUtils/talkHistory.ts`, lines 205–209:
     ```typescript
     setTalkContent(id: number, content: string) {
       const index: number = this.getTalkIndexById(id)
       this.talkHistory[index].content = content
       this.setData()
     }
     ```
   - If `id` does not exist (e.g. user pressed "Clear Chat" or deleted the message bubble while generation was in-flight), `getTalkIndexById(id)` returns `-1`.
   - Direct Error: `TypeError: Cannot set properties of undefined (setting 'content')`.
   - File: `src/assets/chatUtils/send.ts`, lines 646–655:
     ```typescript
     }).catch((err) => {
       console.error('[ImageGen] Photo generation failed:', err)
       const apology = getStudentApologyMessage(targetStudent.Id, store.language)
       if (talkHistory.currentStudentId === replyingStudentId) {
         talkHistory.setTalkContent(placeholderTalk.Id, apology)
         talkHistory.saveCurrentStudentTalks()
       }
     ```
   - In `send.ts`, when `.then()` throws `TypeError` from `setTalkContent`, execution jumps to `.catch()`, where it calls `talkHistory.setTalkContent(placeholderTalk.Id, apology)` with the same non-existent ID. This triggers a second unhandled `TypeError`, resulting in an unhandled Promise rejection and application state crash. Verified empirically in `src/tests/challenger_2_stress.test.ts` Suite 3.1.

3. **Fatal `URIError: URI malformed` on Unpaired Unicode Surrogates**
   - File: `src/assets/imageGen/providers/pollinations.ts`, line 50:
     ```typescript
     const encodedPrompt = encodeURIComponent(prompt)
     ```
   - In ECMAScript, `encodeURIComponent("test \uD800 test")` throws `URIError: URI malformed`.
   - If user input or LLM generation contains an unpaired surrogate, `buildPollinationsUrl` throws an unhandled `URIError`. Verified empirically in `src/tests/challenger_2_stress.test.ts` Suite 1.2.

4. **BYOK Header Injection (CRLF) and Non-String LocalStorage Type Mismatch**
   - File: `src/assets/imageGen/providers/fal.ts`, lines 38–41:
     ```typescript
     headers: {
       Authorization: `Key ${apiKey}`,
       'Content-Type': 'application/json'
     }
     ```
   - File: `src/assets/imageGen/providers/together.ts`, lines 40–42:
     ```typescript
     headers: {
       Authorization: `Bearer ${apiKey}`,
       'Content-Type': 'application/json'
     }
     ```
   - If `apiKey` contains CRLF (`\r\n`), `fetch()` throws `TypeError: Headers.append: ... is an invalid header value`.
   - In `fal.ts` line 65 and `together.ts` line 71:
     `if (!apiKey || !apiKey.trim())`
     When `store.getData()` deserializes a non-string from `localStorage.getItem('image-gen-api-key')` (such as a numeric key `12345`), `apiKey.trim` is undefined, throwing `TypeError: apiKey.trim is not a function`. Verified empirically in `src/tests/challenger_2_stress.test.ts` Suite 1.3 & 3.4.

5. **False Positive in `isShootingPlaceholder` Overrides Legitimate Dialogue**
   - File: `src/views/ChatView/ChatDraggable.vue`, line 16 & line 232:
     ```typescript
     const isShootingPlaceholder = (content: string): boolean => {
       if (!content || typeof content !== 'string') return false
       return (
         content === '[SHOOTING_PHOTO]' ||
         content === '📷 撮影中...' ||
         content.includes('📷 撮影中') ||
         content.includes('takingPhoto')
       )
     }
     ```
   - When a student's legitimate dialogue includes the substring `📷 撮影中` (e.g. "先生、今「📷 撮影中」だから待っててね！"), `ChatDraggable.vue` permanently renders it as a loading camera box (`shooting-box`), completely hiding the student's text. Verified empirically in `src/tests/challenger_2_stress.test.ts` Suite 3.3.

6. **Unused Dead Code: `isPhotoFailed`**
   - File: `src/assets/imageGen/imageService.ts`, lines 104–123:
     `export function isPhotoFailed(content: string): boolean` is defined but never invoked anywhere in `src/`.

---

## 2. Logic Chain

1. **From Observation 1**: `imageService.ts` guarantees that any failure from Fal or Together routes into `generatePollinationsImage`. Because `generatePollinationsImage` is synchronous and does not make HTTP calls, it cannot throw network errors or timeouts. Thus, the outer `catch` block returning `getStudentApologyMessage` is dead code under normal API failures.
2. **From Observation 2**: In `send.ts`, asynchronous background generation completes after a variable delay. If the user clears the chat or deletes the placeholder talk before generation resolves, `talkHistory.getTalkIndexById(placeholderTalk.Id)` evaluates to `-1`. Because `talkHistory[index]` is not bounds-checked, accessing `[-1].content` throws a fatal `TypeError` both in the `.then()` block and the subsequent `.catch()` block.
3. **From Observation 3**: `buildPollinationsUrl` invokes standard `encodeURIComponent` without sanitizing unpaired surrogates. Because LLM generation and user input can contain fragmented UTF-16 surrogates, this triggers an uncaught `URIError: URI malformed`.
4. **From Observation 4**: BYOK headers are formatted with raw template literals without removing `\r` or `\n`. In modern Fetch API implementations, invalid header characters trigger immediate client-side `TypeError`. Furthermore, `store.ts` uses `JSON.parse` on localStorage values without coercing them to `String`, resulting in runtime `apiKey.trim is not a function` errors when keys are stored as non-strings.
5. **From Observation 5**: `isShootingPlaceholder` uses loose `includes('📷 撮影中')` matching rather than exact token equality (`content === '📷 撮影中...'` or `content === '[SHOOTING_PHOTO]'`), creating a false positive that swallows legitimate conversational dialogue.

---

## 3. Caveats

- We did not benchmark GPU/VRAM limits of external provider inference engines (Fal / Together / Pollinations servers).
- We did not evaluate browser memory leakage under continuous generation of hundreds of high-resolution images within a single session.

---

## 4. Conclusion: CHALLENGE

**Verdict**: **CHALLENGE**

The image generation feature demonstrates solid architecture and passes basic functional scenarios. However, empirical stress testing has revealed critical resilience and stability defects that violate core requirements:

1. **Resilience Failure**: Fal.ai/Together AI 401/429/timeout errors silently fall back to Pollinations; the promised in-character student apologies are unreachable.
2. **UI Crash Bug**: User clearing chat or deleting a message during image generation triggers an unhandled `TypeError` in `setTalkContent`, crashing the background handler.
3. **Encoding Vulnerability**: Unpaired Unicode surrogates trigger unhandled `URIError` crashes.
4. **Header / Typing Defense**: BYOK API keys lack CRLF stripping and type coercion.
5. **UI False Positive**: Substring placeholder detection hides valid student dialogues.

### Concrete Recommendations for Implementation Team:
1. **Fix Fallback & Apology Routing**: In `imageService.ts`, when a BYOK provider fails with 401 (invalid key), do not silently fall back to Pollinations; instead, surface the error and return `getStudentApologyMessage()`. For Pollinations, verify the image (or attach an `@error` handler on `<img class="chat-img" />` in `ChatDraggable.vue` that swaps the content to the apology message).
2. **Bounds-Check `setTalkContent`**: In `talkHistory.ts`:
   ```typescript
   setTalkContent(id: number, content: string) {
     const index: number = this.getTalkIndexById(id)
     if (index === -1) return
     this.talkHistory[index].content = content
     this.setData()
   }
   ```
3. **Sanitize Surrogates**: Use `prompt.toWellFormed()` or regex stripping before `encodeURIComponent(prompt)`.
4. **Sanitize BYOK Keys**: In `buildFalAiRequest` and `buildTogetherAiRequest`, trim and strip newlines: `String(apiKey).replace(/[\r\n]/g, '').trim()`.
5. **Strict Placeholder Equality**: In `ChatDraggable.vue`:
   ```typescript
   const isShootingPlaceholder = (content: string): boolean => {
     return content === '[SHOOTING_PHOTO]' || content === '📷 撮影中...'
   }
   ```

---

## 5. Verification Method

To independently verify all findings and reproduce the identified defects:

```bash
# Run Challenger 2 empirical stress test suite
npx vitest run src/tests/challenger_2_stress.test.ts

# Run the complete test suite across the project
npm test

# Verify TypeScript compliance and production build
npm run type-check
npm run build-only
```

Inspection files:
- `src/tests/challenger_2_stress.test.ts` (Empirical challenge harness)
- `src/assets/imageGen/imageService.ts` (Fallback hierarchy & unreachable catch block)
- `src/assets/storeUtils/talkHistory.ts` (Unchecked `index = -1` in `setTalkContent`)
- `src/views/ChatView/ChatDraggable.vue` (`isShootingPlaceholder` loose substring match)
