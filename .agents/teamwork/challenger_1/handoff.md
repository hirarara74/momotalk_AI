# Empirical Handoff Report — Adversarial Challenge of Prompt & Intent Engine

**Agent**: Challenger 1 (`challenger_1`)  
**Role**: Empirical Challenger (Critic / Specialist)  
**Date**: 2026-09-29T20:34:00Z  
**Parent Agent**: `816fdcdb-2ddc-4930-93e4-4ee54bf0bf11`  
**Verdict**: **CHALLENGE**

---

## 1. Observation

Direct empirical observations from executing adversarial probes via `src/tests/challengerStressTest.test.ts` (17 tests executed with Vitest v1.6.1):

### Obs 1: Canonical Character Fidelity Violation in Shiroko (10010)
- **File & Line**: `src/assets/imageGen/characterDictionary.ts:14`
- **Code**:
  ```typescript
  10010: {
    characterTag: 'sunaookami_shiroko_(blue_archive)',
    halo: ['halo', 'light_blue_halo', 'circular_halo', 'segmented_halo'],
    hair: ['grey_hair', 'wolf_cut', 'medium_hair', 'hair_between_eyes'],
    eyes: ['heterochromia', 'blue_eyes', 'black_pupil', 'white_pupil'],
  ```
- **Execution Result** (`PROBE-2B`):
  Shiroko is assigned `heterochromia` alongside `blue_eyes`. In Blue Archive canon, Shiroko has two light-blue eyes. Heterochromia is Hoshino's (10005) unique trait (`blue_eye, amber_eye`). Feeding `heterochromia` to image diffusion models forces Shiroko to be drawn with mismatched eye colors.

### Obs 2: 100% Failure Rate on Japanese Hiragana Name Lookups (22/22 Failures)
- **File & Line**: `src/assets/imageGen/characterDictionary.ts:334-621, 646-650`
- **Execution Result** (`PROBE-2D`):
  All 22 Japanese students fail to resolve when typed in Hiragana:
  - `"しろこ"` -> `undefined` (Expected: 10010 Shiroko)
  - `"ほしの"` -> `undefined` (Expected: 10005 Hoshino)
  - `"ひな"` -> `undefined` (Expected: 10004 Hina)
  - `"ゆうか"` -> `undefined` (Expected: 13010 Yuuka)
  - `"あろな"` -> `undefined` (Expected: 9999 Arona)
  - `"こはる"` -> `undefined` (Expected: 10020 Koharu)
  Because `STUDENT_NAME_ALIASES` only indexes Romaji, Katakana, and Kanji, and JavaScript `.includes()` does not map Hiragana to Katakana, casual messaging in Hiragana silently falls back to `DEFAULT_FALLBACK_PROFILE` (`kivotos_student_(blue_archive)`), completely stripping the student's unique halo, hair, eyes, and uniform.

### Obs 3: Substring Matching Poisoning in `resolveStudentId()`
- **File & Line**: `src/assets/imageGen/characterDictionary.ts:646-650`
- **Code**:
  ```typescript
  for (const [alias, id] of Object.entries(STUDENT_NAME_ALIASES)) {
    if (alias.length >= 2 && (normalized.includes(alias) || alias.includes(normalized))) {
      return id
    }
  }
  ```
- **Execution Result** (`PROBE-2E`):
  - `"hinata"` (澄見ヒナタ, Sisterhood) resolves to ID 10004 (Hina, Gehenna Prefect) because `"hinata".includes("hina") === true`.
  - `"haruka"` (井沢ハルカ, Problem Solver 68) resolves to ID 10000 (Aru) because `"haruka".includes("aru") === true`.
  - `"marina"` (池倉マリナ, Red Winter) resolves to ID 23008 (Mari) because `"marina".includes("mari") === true`.
  - `"no"` resolves to ID 10005 (Hoshino) instead of Noa (10052) because `"hoshino".includes("no") === true`.
  - `"ar"` resolves to ID 10000 (Aru) instead of Arona or undefined.
  - `"ka"` resolves to ID 10010 (Shiroko) due to `"sunaookami_shiroko"`.

### Obs 4: False Positive Photo Intent on Multi-Clause Request
- **File & Line**: `src/assets/imageGen/intentDetector.ts:31, 116-123`
- **Code**:
  ```typescript
  '今何してる(?:の|ん|よ)?[？?]?'
  ```
- **Execution Result** (`PROBE-1B`):
  - Input: `"今何してるの？宿題手伝って"` (What are you doing? Help me with homework).
  - Result: `isPhotoRequested: true, triggerType: 'activity'`.
  - Cause: Regex is unanchored. Any message beginning with "今何してるの？" even when followed by a completely non-photo request immediately hijacks the dialogue into photo generation mode (`📷 撮影中...`).

### Obs 5: 100% False Positive Rate on Negations & Refusals (11/11 Failures)
- **File & Line**: `src/assets/imageGen/intentDetector.ts:9, 12-26`
- **Execution Result** (`PROBE-1C`):
  All 11 tested negative/refusal sentences triggered photo generation:
  - `"写真送らないでね"` -> `triggerType: direct` (Photo requested: `true`)
  - `"自撮りは送らないで"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"自撮り嫌いだから送らなくていいよ"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"自撮りは不要です"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"写真撮らないで"` -> `triggerType: direct` (Photo requested: `true`)
  - `"Don't send any photos"` -> `triggerType: direct` (Photo requested: `true`)
  - `"Do not send me a selfie"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"No selfies please"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"别发照片"` -> `triggerType: direct` (Photo requested: `true`)
  - `"不要发自拍"` -> `triggerType: selfie` (Photo requested: `true`)
  - `"사진 보내지 마"` -> `triggerType: direct` (Photo requested: `true`)

### Obs 6: Secondary `[PHOTO: ...]` Tag Leaks in Dialogue Bubble
- **File & Line**: `src/assets/imageGen/intentDetector.ts:134, 148`
- **Code**:
  ```typescript
  const PHOTO_DIRECTIVE_REGEX = /(?:\[|【)\s*PHOTO\s*:\s*([^\]】]+)\s*(?:\]|】)/i
  ...
  const cleanText = llmReplyText.replace(PHOTO_DIRECTIVE_REGEX, '').trim()
  ```
- **Execution Result** (`PROBE-1G`):
  - Input: `"自撮り撮ったよ！ [PHOTO: selfie, smile] あとこれも見て！ [PHOTO: cafe, table]"`
  - Output `cleanText`: `"自撮り撮ったよ！  あとこれも見て！ [PHOTO: cafe, table]"`
  - Cause: `PHOTO_DIRECTIVE_REGEX` lacks the global (`g`) flag. Only the first tag is stripped; subsequent directives leak directly to the user in the chat message bubble.

### Obs 7: Forbidden Character (`&`) in Danbooru Tags for 4 Students
- **File & Line**: `src/assets/imageGen/characterDictionary.ts:149, 174, 249, 262`
- **Code**:
  `'c&c_uniform'` present in Karin (20001), Toki (10062), Asuna (16001), Neru (10008).
- **Execution Result** (`PROBE-2A`):
  Danbooru tag rules strictly disallow ampersand `&`. In HTTP GET requests (such as Pollinations.ai), `&` serves as a query parameter separator (`...&c_uniform`), corrupting prompt encoding and parsing.

### Obs 8: Single-Character Kanji Names with Honorifics Fail to Resolve
- **File & Line**: `src/assets/imageGen/characterDictionary.ts:489-490, 601, 612, 647`
- **Execution Result** (`PROBE-2F`):
  - `"時ちゃん"` (Toki) -> `undefined`
  - `"瞬先生"` (Shun) -> `undefined`
  - `"梓ちゃん"` (Azusa) -> `undefined`
  - Cause: Loop enforces `if (alias.length >= 2)`. Single kanji aliases (`'時'`, `'瞬'`, `'梓'`) are bypassed, so appending honorifics (`ちゃん`, `先生`) prevents exact and substring match.

### Obs 9: Complete Absence of Safety / Anti-NSFW Tags in `DEFAULT_NEGATIVE_PROMPT`
- **File & Line**: `src/assets/imageGen/promptSynthesizer.ts:27-48`
- **Execution Result** (`PROBE-3D`):
  `DEFAULT_NEGATIVE_PROMPT` contains 20 tags (`worst_quality`, `bad_anatomy`, `deformed_halo`, `2girls`, etc.) but zero safety or anti-NSFW tags (`nsfw`, `nude`, `explicit`, `erotic`). Blue Archive characters are underage students; in night/bedroom and swimsuit presets, models without negative safety tags risk generating inappropriate imagery.

---

## 2. Logic Chain

1. **Character Fidelity (Obs 1, Obs 7)**:
   - Premise: `PROJECT.md` § F2 mandates authentic Danbooru visual dictionary profiles for all students.
   - Inference: Tagging Shiroko with `heterochromia` generates contradictory and incorrect eye colors. Using `c&c_uniform` introduces invalid characters (`&`) rejected by Danbooru standards and URL query parsers.
   - Conclusion: Worker M2's dictionary contains canonical and syntax defects that impair image generation fidelity.

2. **Multilingual Robustness (Obs 2, Obs 3, Obs 8)**:
   - Premise: MomoTalk supports Japanese, English, Korean, and Chinese users.
   - Inference: In Japanese chat, names like "しろこ" or "ゆうか" are typed in Hiragana. Missing Hiragana lookups causes complete fallback to generic Kivotos students. Furthermore, bidirectional substring matching (`alias.includes(normalized) || normalized.includes(alias)`) causes severe collisions (e.g. Hinata -> Hina, Haruka -> Aru, "no" -> Hoshino).
   - Conclusion: Student resolution logic is fragile and prone to false identifications.

3. **Conversational Intent Naturalness (Obs 4, Obs 5, Obs 6)**:
   - Premise: Photo generation must feel like an organic student response, not an intrusive bot interruption.
   - Inference: When a user explicitly says "写真送らないで" (Do not send photos) or asks "今何してるの？宿題手伝って" (What are you doing? Help with homework), triggering a photo shoot violates user intent. When LLMs emit multiple photo tags, unstripped tags leak into chat bubbles.
   - Conclusion: Intent detection regexes lack boundary constraints, negation checks, and global sanitization flags.

---

## 3. Caveats

- **Pollinations Server Uptime**: Provider network latency and third-party upstream availability were tested in provider suites; empirical stress testing here focused strictly on local intent classification, dictionary integrity, and prompt synthesis.
- **Model Training Data Variability**: Some newer diffusion models have implicit safety filters, but client-side negative prompt hygiene remains essential.
- No other caveats.

---

## 4. Conclusion

**Verdict: CHALLENGE**

The Prompt & Intent Engine implementation possesses a sound architectural foundation, but contains **9 empirical defects** (3 High, 3 Medium-High, 2 Medium, 1 Low-Medium) that must be addressed:
1. Remove `heterochromia` from Shiroko (10010) and correct `blue_eyes`.
2. Add Hiragana aliases to `STUDENT_NAME_ALIASES` for all 22 Japanese-named students.
3. Fix substring matching in `resolveStudentId`: restrict matching to exact word boundary matches, prioritize longer matches, and remove `alias.includes(normalized)` for short strings (<3 chars).
4. Add negation detection filter in `detectPhotoIntent` (rejecting patterns with `送らないで`, `不要`, `嫌い`, `don't`, `not`, `no`, `别`, `不要`, `지 마`).
5. Anchor or qualify `ACTIVITY_REGEX` to prevent false photo triggers on compound task inquiries like "宿題手伝って".
6. Add global `/g` flag to `PHOTO_DIRECTIVE_REGEX` in `extractPhotoDirective` so all `[PHOTO: ...]` directives are stripped.
7. Replace `'c&c_uniform'` with valid Danbooru tags (e.g. `'maid_outfit', 'maid_headdress'`).
8. Add honorific normalization or support single-character Kanji aliases.
9. Add baseline safety negative tags (`nsfw, nude, explicit`) to `DEFAULT_NEGATIVE_PROMPT`.

---

## 5. Verification Method

To independently reproduce all empirical findings:

1. **Run the Challenger Stress Test Harness**:
   ```powershell
   npx vitest run src/tests/challengerStressTest.test.ts
   ```
   *Expected output*: Runs all 17 empirical probes across intent detection, dictionary audit, and prompt synthesis, outputting the exact findings in stdout and stderr.

2. **Run Full Test Suite & Type-Check**:
   ```powershell
   npm test
   npm run type-check
   ```
   *Expected output*: All 222 tests execute in <4s with 0 TypeScript compiler errors.
