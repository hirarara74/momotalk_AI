import { describe, it, expect } from 'vitest'

import {
  detectPhotoIntent,
  extractPhotoDirective,
  buildPhotoPromptDirective
} from '@/assets/imageGen/intentDetector'

import {
  STUDENT_VISUAL_PROFILES,
  STUDENT_NAME_ALIASES,
  DEFAULT_FALLBACK_PROFILE,
  resolveStudentId,
  isSupportedVisualStudent,
  getCharacterVisualProfile
} from '@/assets/imageGen/characterDictionary'

import {
  SCENE_PRESETS,
  STUDENT_SIGNATURE_TRAITS,
  inferSceneFromContext,
  getTimeOfDayTags,
  getSignatureStudentSceneTags
} from '@/assets/imageGen/sceneTags'

import {
  QUALITY_PROMPT_PREFIX,
  DEFAULT_NEGATIVE_PROMPT,
  synthesizePrompt,
  buildDanbooruPrompt
} from '@/assets/imageGen/promptSynthesizer'

describe('Challenger 1 Adversarial Stress Test Suite', () => {

  // =========================================================================
  // 1. INTENT DETECTION ADVERSARIAL STRESS TESTING
  // =========================================================================
  describe('1. Intent Detection: Adversarial, Boundary & Non-Photo Queries', () => {

    it('PROBE-1A: Non-photo inquiry "写真部について教えて" (Photography club inquiry)', () => {
      const q = '写真部について教えて'
      const result = detectPhotoIntent(q)
      // "写真部について教えて" is asking about the photography club, NOT asking for a photo
      console.log(`[PROBE-1A] Query: "${q}" -> isPhotoRequested: ${result.isPhotoRequested}, trigger: ${result.triggerType}`)
    })

    it('PROBE-1B: Activity with task request "今何してるの？宿題手伝って"', () => {
      const q = '今何してるの？宿題手伝って'
      const result = detectPhotoIntent(q)
      // "今何してるの？宿題手伝って" is asking for homework help, not an image generation trigger
      console.log(`[PROBE-1B] Query: "${q}" -> isPhotoRequested: ${result.isPhotoRequested}, trigger: ${result.triggerType}`)
      // Notice: Does it falsely trigger photo generation?
      if (result.isPhotoRequested) {
        console.warn(`[CHALLENGE FINDING] Falsely triggered photo generation on compound query: "${q}"`)
      }
    })

    it('PROBE-1C: Explicit Negations & Refusals (Do NOT send photos)', () => {
      const negations = [
        '写真送らないでね',
        '自撮りは送らないで',
        '自撮り嫌いだから送らなくていいよ',
        '自撮りは不要です',
        '写真撮らないで',
        'Don\'t send any photos',
        'Do not send me a selfie',
        'No selfies please',
        '别发照片',
        '不要发自拍',
        '사진 보내지 마'
      ]

      const falsePositiveNegations: string[] = []
      for (const q of negations) {
        const result = detectPhotoIntent(q)
        if (result.isPhotoRequested) {
          falsePositiveNegations.push(`"${q}" -> triggerType: ${result.triggerType}`)
        }
      }
      console.log(`[PROBE-1C] Negations triggering false positive: ${falsePositiveNegations.length} of ${negations.length}`)
      for (const fp of falsePositiveNegations) {
        console.warn(`  [FP Negation]: ${fp}`)
      }
    })

    it('PROBE-1D: Contextual Non-Photo Mentions (Sensei showing photo, club, hobbies)', () => {
      const contextualNonPhotos = [
        '写真部を見学したい',
        '写真部に入部をお願いしたい',
        '写真撮るのが趣味なんだ',
        '写真を見せてあげようか？',
        'この写真見て！',
        '画像をダウンロードして保存してください',
        '写真集買ったよ',
        '写真を撮りに行こうよ',
        'Can I show you a picture?',
        'Look at this photo I took',
        'I bought a photo album',
        '我给你看张照片'
      ]

      const falsePositives: string[] = []
      for (const q of contextualNonPhotos) {
        const result = detectPhotoIntent(q)
        if (result.isPhotoRequested) {
          falsePositives.push(`"${q}" -> triggerType: ${result.triggerType}`)
        }
      }
      console.log(`[PROBE-1D] Contextual non-photo inquiries triggering false positives: ${falsePositives.length} of ${contextualNonPhotos.length}`)
      for (const fp of falsePositives) {
        console.warn(`  [FP Contextual]: ${fp}`)
      }
    })

    it('PROBE-1E: Polite & Subtle Photo Requests (False Negative evaluation)', () => {
      const subtleRequests = [
        'お写真拝見できますでしょうか？',
        'お写真いただけますか？',
        '写真よろ',
        '写真pls',
        '写真プリーズ',
        '今の姿が見たいな',
        '今の格好見せて',
        'カメラで撮って送って',
        'What does your outfit look like?',
        'Drop a pic of what you are doing',
        '사진 한장만 보여줄 수 있어?',
        '看看你现在的样子'
      ]

      const missedRequests: string[] = []
      for (const q of subtleRequests) {
        const result = detectPhotoIntent(q)
        if (!result.isPhotoRequested) {
          missedRequests.push(`"${q}"`)
        }
      }
      console.log(`[PROBE-1E] Subtle requests missed (False Negatives): ${missedRequests.length} of ${subtleRequests.length}`)
      for (const miss of missedRequests) {
        console.warn(`  [FN Subtle]: ${miss}`)
      }
    })

    it('PROBE-1F: ReDoS & Large Input Stress Testing', () => {
      const largeNonMatch = '写真' + 'a'.repeat(50000)
      const startTime = performance.now()
      const result = detectPhotoIntent(largeNonMatch)
      const duration = performance.now() - startTime

      console.log(`[PROBE-1F] 50,000-char string regex execution time: ${duration.toFixed(2)}ms (isPhoto: ${result.isPhotoRequested})`)
      expect(duration).toBeLessThan(100) // Must not suffer ReDoS catastrophic backtracking
    })

    it('PROBE-1G: Multiple [PHOTO: ...] directives in single LLM reply', () => {
      const multiDirectiveReply = '自撮り撮ったよ！ [PHOTO: selfie, smile] あとこれも見て！ [PHOTO: cafe, table]'
      const extracted = extractPhotoDirective(multiDirectiveReply)

      console.log(`[PROBE-1G] Multi-directive extract test:`)
      console.log(`  cleanText: "${extracted.cleanText}"`)
      console.log(`  photoTags: "${extracted.photoTags}"`)
      // If regex lacks 'g' flag, second [PHOTO: ...] is not stripped!
      const hasRemainingDirective = /\[PHOTO:/i.test(extracted.cleanText)
      console.log(`  Has unstripped remaining directive in cleanText: ${hasRemainingDirective}`)
      if (hasRemainingDirective) {
        console.warn(`[CHALLENGE FINDING] extractPhotoDirective failed to strip multiple [PHOTO: ...] tags; leaks into chat text!`)
      }
    })
  })

  // =========================================================================
  // 2. DANBOORU DICTIONARY & 24 CHARACTERS AUDIT
  // =========================================================================
  describe('2. Danbooru Dictionary & Character Fidelity Across 24 Students', () => {

    it('PROBE-2A: Check for forbidden characters (e.g. &) in Danbooru tags', () => {
      const forbiddenChars = ['&', '%', '$', '#', '@', '!', '?', '*', '<', '>']
      const flaggedTags: { studentId: number; tag: string; reason: string }[] = []

      for (const [idStr, profile] of Object.entries(STUDENT_VISUAL_PROFILES)) {
        const id = Number(idStr)
        const allTags = [
          profile.characterTag,
          ...profile.halo,
          ...profile.hair,
          ...profile.eyes,
          ...profile.features,
          ...Object.values(profile.outfits).flat()
        ]

        for (const tag of allTags) {
          for (const char of forbiddenChars) {
            if (tag.includes(char)) {
              flaggedTags.push({ studentId: id, tag, reason: `Contains forbidden character "${char}"` })
            }
          }
          if (/\s/.test(tag)) {
            flaggedTags.push({ studentId: id, tag, reason: 'Contains un-normalized space' })
          }
        }
      }

      console.log(`[PROBE-2A] Flagged invalid/broken tags across 24 students: ${flaggedTags.length}`)
      for (const f of flaggedTags) {
        console.warn(`  [Broken Tag] Student ${f.studentId}: "${f.tag}" (${f.reason})`)
      }
    })

    it('PROBE-2B: Canonical Character Trait Verification (Shiroko eyes & Hoshino heterochromia)', () => {
      const shiroko = STUDENT_VISUAL_PROFILES[10010]
      const hoshino = STUDENT_VISUAL_PROFILES[10005]

      console.log(`[PROBE-2B] Shiroko eyes: ${JSON.stringify(shiroko.eyes)}`)
      console.log(`[PROBE-2B] Hoshino eyes: ${JSON.stringify(hoshino.eyes)}`)

      // Blue Archive canon:
      // Hoshino has heterochromia (one blue eye, one amber eye)
      // Shiroko has two light blue eyes. Does Shiroko have heterochromia?
      const shirokoHasHeterochromia = shiroko.eyes.includes('heterochromia')
      if (shirokoHasHeterochromia) {
        console.warn(`[CHALLENGE FINDING] Shiroko (10010) is falsely tagged with 'heterochromia'! Shiroko has two light-blue eyes.`)
      }
    })

    it('PROBE-2C: Twintails tag naming consistency (twin_tails vs twintails)', () => {
      const twintailVariants: Record<string, number[]> = {}

      for (const [idStr, profile] of Object.entries(STUDENT_VISUAL_PROFILES)) {
        const id = Number(idStr)
        for (const tag of profile.hair) {
          if (tag.includes('twin')) {
            twintailVariants[tag] = twintailVariants[tag] || []
            twintailVariants[tag].push(id)
          }
        }
      }

      console.log(`[PROBE-2C] Twintail tag variants across students:`, twintailVariants)
      // On Danbooru, 'twintails' is the canonical primary tag; 'twin_tails' is an alias or variant.
    })

    it('PROBE-2D: Hiragana Student Name Lookup Coverage', () => {
      const hiraganaTestCases = [
        { name: 'しろこ', expectedId: 10010 },
        { name: 'ほしの', expectedId: 10005 },
        { name: 'ひな', expectedId: 10004 },
        { name: 'ゆうか', expectedId: 13010 },
        { name: 'ひふみ', expectedId: 10003 },
        { name: 'まりー', expectedId: 23008 },
        { name: 'あずさ', expectedId: 10019 },
        { name: 'いおり', expectedId: 10006 },
        { name: 'かりん', expectedId: 20001 },
        { name: 'みか', expectedId: 10059 },
        { name: 'とき', expectedId: 10062 },
        { name: 'はるな', expectedId: 10002 },
        { name: 'むつき', expectedId: 13006 },
        { name: 'のあ', expectedId: 10052 },
        { name: 'こゆき', expectedId: 10063 },
        { name: 'こはる', expectedId: 10020 },
        { name: 'あすな', expectedId: 16001 },
        { name: 'ねる', expectedId: 10008 },
        { name: 'かずさ', expectedId: 10049 },
        { name: 'さおり', expectedId: 10048 },
        { name: 'しゅん', expectedId: 10011 },
        { name: 'あろな', expectedId: 9999 }
      ]

      const failedHiragana: string[] = []
      for (const tc of hiraganaTestCases) {
        const resolved = resolveStudentId(tc.name)
        if (resolved !== tc.expectedId) {
          failedHiragana.push(`"${tc.name}" -> resolved: ${resolved}, expected: ${tc.expectedId}`)
        }
      }

      console.log(`[PROBE-2D] Hiragana lookups failed: ${failedHiragana.length} of ${hiraganaTestCases.length}`)
      for (const f of failedHiragana) {
        console.warn(`  [Hiragana Missing]: ${f}`)
      }
    })

    it('PROBE-2E: Substring Matching Poisoning & False Name Resolution', () => {
      // Substring matching in resolveStudentId has alias.includes(normalized) || normalized.includes(alias)
      // When a query contains a common sub-string, does it falsely match an unintended student?
      const poisoningProbes = [
        { query: 'hinata', expectedId: undefined, studentNote: '澄見ヒナタ (Sisterhood)' },
        { query: 'haruka', expectedId: undefined, studentNote: '井沢ハルカ (Problem Solver 68)' },
        { query: 'marina', expectedId: undefined, studentNote: '池倉マリナ (Red Winter)' },
        { query: 'no', expectedId: undefined, studentNote: 'Generic word / abbreviation' },
        { query: 'ar', expectedId: undefined, studentNote: 'Short prefix' },
        { query: 'ka', expectedId: undefined, studentNote: 'Short prefix' }
      ]

      const poisonedMatches: string[] = []
      for (const probe of poisoningProbes) {
        const resolved = resolveStudentId(probe.query)
        if (resolved !== probe.expectedId) {
          poisonedMatches.push(`"${probe.query}" (${probe.studentNote}) -> resolved to ID ${resolved} (${STUDENT_VISUAL_PROFILES[resolved!]?.characterTag})`)
        }
      }

      console.log(`[PROBE-2E] Substring poisoning / false resolution count: ${poisonedMatches.length}`)
      for (const pm of poisonedMatches) {
        console.warn(`  [Poisoned Match]: ${pm}`)
      }
    })

    it('PROBE-2F: Single-character kanji names with honorifics ("時ちゃん", "瞬先生", "梓ちゃん")', () => {
      const honorificProbes = [
        { query: '時ちゃん', expectedId: 10062, name: 'Toki' },
        { query: '瞬先生', expectedId: 10011, name: 'Shun' },
        { query: '梓ちゃん', expectedId: 10019, name: 'Azusa' },
        { query: '白子ちゃん', expectedId: 10010, name: 'Shiroko' },
        { query: '未花ちゃん', expectedId: 10059, name: 'Mika' }
      ]

      const failedHonorifics: string[] = []
      for (const p of honorificProbes) {
        const resolved = resolveStudentId(p.query)
        if (resolved !== p.expectedId) {
          failedHonorifics.push(`"${p.query}" (${p.name}) -> resolved: ${resolved}, expected: ${p.expectedId}`)
        }
      }

      console.log(`[PROBE-2F] Kanji with honorifics resolution failures: ${failedHonorifics.length}`)
      for (const fh of failedHonorifics) {
        console.warn(`  [Honorific Fail]: ${fh}`)
      }
    })
  })

  // =========================================================================
  // 3. PROMPT SYNTHESIS EXTREME STRESS & BOUNDARY TESTING
  // =========================================================================
  describe('3. Prompt Synthesis: Extreme Inputs, Fallbacks & Negative Safety', () => {

    it('PROBE-3A: Fallback behavior on uncataloged / missing student profiles', () => {
      const weirdInputs: any[] = [
        undefined,
        null,
        '',
        '   ',
        999999,
        -1,
        NaN,
        'nonexistent_student_xyz'
      ]

      for (const input of weirdInputs) {
        expect(() => {
          const result = synthesizePrompt({ studentIdOrName: input })
          expect(result.prompt).toBeTruthy()
          expect(result.negativePrompt).toBeTruthy()
          expect(result.characterTags).toBeDefined()
          expect(result.sceneTags).toBeDefined()
        }).not.toThrow()
      }
    })

    it('PROBE-3B: Empty user inputs behavior', () => {
      const result = synthesizePrompt({
        studentIdOrName: 10010,
        userMessage: '',
        studentReply: '',
        sceneTags: []
      })

      expect(result.prompt).toContain('sunaookami_shiroko_(blue_archive)')
      // Since studentId is 10010, should resolve Shiroko signature traits (sports_towel_around_neck or street)
      expect(result.prompt).toContain('sports_towel_around_neck')
      expect(result.prompt.length).toBeGreaterThan(50)
      console.log(`[PROBE-3B] Empty user inputs prompt length: ${result.prompt.length} chars, ${result.prompt.split(',').length} tags`)
    })

    it('PROBE-3C: Extreme long scene tags & dirty strings stress test', () => {
      const dirtyTags = [
        'selfie',
        '   messy   spaces   ',
        '<script>alert("xss")</script>',
        'DROP TABLE students;--',
        'tag with, multiple, embedded, commas',
        'emoji_✨_🎉_🌸',
        'a'.repeat(2000), // Giant single tag
        'UPPERCASE_TAG_TEST'
      ]

      const result = synthesizePrompt({
        studentIdOrName: 10010,
        sceneTags: dirtyTags
      })

      expect(result.prompt).toBeDefined()
      // Verify deduplication works with dirty tags
      const splitTags = result.prompt.split(',').map(s => s.trim())
      console.log(`[PROBE-3C] Synthesized tag count with extreme tags: ${splitTags.length}`)
      expect(splitTags.length).toBeGreaterThan(10)
    })

    it('PROBE-3D: Strict Negative Prompt Safety & NSFW Evaluation', () => {
      const negPrompt = DEFAULT_NEGATIVE_PROMPT.join(', ')

      console.log(`[PROBE-3D] Default Negative Prompt (${DEFAULT_NEGATIVE_PROMPT.length} tags):`)
      console.log(`  "${negPrompt}"`)

      // Check quality tags
      expect(negPrompt).toContain('worst_quality')
      expect(negPrompt).toContain('bad_anatomy')
      expect(negPrompt).toContain('deformed_halo')
      expect(negPrompt).toContain('2girls')

      // Check safety / NSFW tags
      const hasNsfwNegative = /nsfw|nude|nipples|explicit|sex|cleavage|panties/i.test(negPrompt)
      console.log(`  Contains NSFW / safety protection tags in negative prompt: ${hasNsfwNegative}`)
      if (!hasNsfwNegative) {
        console.warn(`[CHALLENGE FINDING] DEFAULT_NEGATIVE_PROMPT contains NO NSFW safety tags! Blue Archive students are minor students.`)
      }
    })
  })
})
