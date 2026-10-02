## 2026-09-29T20:36:27Z
You are Worker Fixer (worker_fixer).
Working directory: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_fixer
Original User Request: c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\ORIGINAL_REQUEST.md
Project root: c:\Users\USER\Documents\GitHub\momotalk-ai
Project Scope: c:\Users\USER\Documents\GitHub\momotalk-ai\PROJECT.md

Challenger reports with full reproduction details:
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\challenger_1\handoff.md (Prompt & Intent Engine Defects)
- c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\challenger_2\handoff.md (Providers, Resilience & UI Defects)

Task:
Remediate all defects identified by Challenger 1 and Challenger 2 across the codebase:

1. `src/assets/imageGen/characterDictionary.ts`:
   - Shiroko (10010): Remove 'heterochromia' from eyes; keep canonical light blue eyes.
   - Add Hiragana aliases to STUDENT_NAME_ALIASES for all 22 Japanese students ("しろこ", "ゆうか", "あろな", "ひな", "ほしの", "ある", "ひふみ", "まり", "あずさ", "いおり", "かりん", "みか", "とき", "はるな", "むつき", "のあ", "こゆき", "こはる", "あすな", "ねる", "かずさ", "さおり", "しゅん").
   - Substring Matching Poisoning: Fix `resolveStudentId()`: exact match first, then clean word boundary match. Avoid bidirectional `.includes()` on short substrings that poisons lookup (e.g. "hinata" must not resolve to Hina, "haruka" must not resolve to Aru, "marina" must not resolve to Mari, "no" must not resolve to Hoshino).
   - Fix single-character kanji names with honorifics ("時ちゃん", "瞬先生", "梓ちゃん"): strip common honorifics (ちゃん, さん, くん, 先生, センセー) before lookup.
   - Replace 'c&c_uniform' with Danbooru-compliant tags ('maid_outfit', 'maid_headdress') for Karin, Toki, Asuna, Neru.

2. `src/assets/imageGen/intentDetector.ts`:
   - Add intent negation filtering: if the user message contains explicit refusal or negation words (送らないで, 不要, 嫌い, 撮らないで, don't, do not, no selfies, 别发, 不要发, 보내지 마), return { isPhotoRequested: false, triggerType: 'none' }.
   - Anchor/qualify ACTIVITY_REGEX so that compound non-photo inquiries (e.g. "今何してるの？宿題手伝って") do not falsely trigger photo generation.
   - Add '/g' flag to PHOTO_DIRECTIVE_REGEX in extractPhotoDirective() so that all '[PHOTO: ...]' directives are stripped, preventing leaks to chat bubbles.

3. `src/assets/imageGen/promptSynthesizer.ts`:
   - Add anti-NSFW safety tags ('nsfw', 'nude', 'explicit') to DEFAULT_NEGATIVE_PROMPT.

4. `src/assets/imageGen/providers/pollinations.ts`:
   - In buildPollinationsUrl: safely handle malformed Unicode surrogates (e.g. sanitize unpaired surrogates before encoding) so encodeURIComponent never throws URIError.

5. `src/assets/imageGen/providers/fal.ts` & `src/assets/imageGen/providers/together.ts`:
   - Sanitize API keys: strip CRLF (\r, \n) and ensure string type check (typeof apiKey === 'string') to avoid header injection and TypeErrors.

6. `src/assets/imageGen/imageService.ts`:
   - Ensure fallback hierarchy properly returns in-character student apologies: if BYOK fails, it attempts Pollinations; if Pollinations also fails (or if Pollinations was chosen and fails/times out), it returns getStudentApologyMessage(studentIdOrName, locale).

7. `src/assets/talkUtils/talkHistory.ts` & `src/assets/chatUtils/send.ts`:
   - In setTalkContent(id, content): ensure index bounds check (`if (index !== -1) { ... }`) so if chat is cleared or message deleted while generation is in progress, it does not throw a fatal TypeError.

8. `src/views/ChatView/ChatDraggable.vue`:
   - `isShootingPlaceholder(content)`: Ensure exact/strict match (`content === '📷 撮影中...' || content === '[SHOOTING_PHOTO]' || content === '📷 撮影中'`) to avoid hiding normal user/student messages.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

After applying the fixes:
1. Run `npm run type-check` (verify 0 errors).
2. Run `npm test` (verify all test suites pass, including existing suites and challenger stress test suites).
3. Run `npm run build-only` (verify clean production build).
4. Write your handoff report to `c:\Users\USER\Documents\GitHub\momotalk-ai\.agents\teamwork\worker_fixer\handoff.md`.
5. Update `progress.md`.
6. Notify parent (id: 816fdcdb-2ddc-4930-93e4-4ee54bf0bf11) via send_message when done.
