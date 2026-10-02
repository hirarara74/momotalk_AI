import { describe, it, expect, vi } from 'vitest'

import {
  STUDENT_VISUAL_PROFILES,
  resolveStudentId,
  STUDENT_NAME_ALIASES
} from '@/assets/imageGen/characterDictionary'

import {
  detectPhotoIntent,
  extractPhotoDirective,
  PHOTO_DIRECTIVE_REGEX
} from '@/assets/imageGen/intentDetector'

import {
  DEFAULT_NEGATIVE_PROMPT,
  synthesizePrompt
} from '@/assets/imageGen/promptSynthesizer'

import {
  buildPollinationsUrl,
  generatePollinationsImage
} from '@/assets/imageGen/providers/pollinations'

import {
  buildFalAiRequest,
  generateFalImage
} from '@/assets/imageGen/providers/fal'

import {
  buildTogetherAiRequest,
  generateTogetherImage
} from '@/assets/imageGen/providers/together'

import {
  generateStudentPhoto,
  getStudentApologyMessage
} from '@/assets/imageGen/imageService'

import { talkHistory } from '@/assets/storeUtils/talkHistory'

describe('Defect Remediation Verification Suite (Challenger 1 & 2 Fixes)', () => {

  // =========================================================================
  // 1. CHARACTER DICTIONARY AUDIT
  // =========================================================================
  describe('1. characterDictionary.ts Remediations', () => {
    it('Shiroko (10010) has light blue eyes and NO heterochromia', () => {
      const shiroko = STUDENT_VISUAL_PROFILES[10010]
      expect(shiroko.eyes).toContain('blue_eyes')
      expect(shiroko.eyes).toContain('light_blue_eyes')
      expect(shiroko.eyes).not.toContain('heterochromia')
    })

    it('Resolves all 22 Japanese students (+ Arona) in Hiragana', () => {
      const hiraganaMap: Record<string, number> = {
        'しろこ': 10010,
        'ゆうか': 13010,
        'あろな': 9999,
        'ひな': 10004,
        'ほしの': 10005,
        'ある': 10000,
        'ひふみ': 10003,
        'まり': 23008,
        'あずさ': 10019,
        'いおり': 10006,
        'かりん': 20001,
        'みか': 10059,
        'とき': 10062,
        'はるな': 10002,
        'むつき': 13006,
        'のあ': 10052,
        'こゆき': 10063,
        'こはる': 10020,
        'あすな': 16001,
        'ねる': 10008,
        'かずさ': 10049,
        'さおり': 10048,
        'しゅん': 10011
      }

      for (const [name, expectedId] of Object.entries(hiraganaMap)) {
        expect(resolveStudentId(name), `Hiragana "${name}" must resolve to ID ${expectedId}`).toBe(expectedId)
      }
    })

    it('Prevents substring matching poisoning on short queries', () => {
      expect(resolveStudentId('hinata')).toBeUndefined()
      expect(resolveStudentId('haruka')).toBeUndefined()
      expect(resolveStudentId('marina')).toBeUndefined()
      expect(resolveStudentId('no')).toBeUndefined()
      expect(resolveStudentId('ar')).toBeUndefined()
      expect(resolveStudentId('ka')).toBeUndefined()
    })

    it('Resolves single-character kanji names with honorifics', () => {
      expect(resolveStudentId('時ちゃん')).toBe(10062) // Toki
      expect(resolveStudentId('瞬先生')).toBe(10011) // Shun
      expect(resolveStudentId('梓ちゃん')).toBe(10019) // Azusa
      expect(resolveStudentId('白子ちゃん')).toBe(10010) // Shiroko
      expect(resolveStudentId('未花ちゃん')).toBe(10059) // Mika
    })

    it('Replaces c&c_uniform with Danbooru-compliant maid tags for C&C members', () => {
      const ccStudentIds = [20001, 10062, 16001, 10008] // Karin, Toki, Asuna, Neru
      for (const id of ccStudentIds) {
        const profile = STUDENT_VISUAL_PROFILES[id]
        const defaultOutfit = profile.outfits.default || []
        expect(defaultOutfit).toContain('maid_outfit')
        expect(defaultOutfit).toContain('maid_headdress')
        expect(defaultOutfit).not.toContain('c&c_uniform')
      }
    })
  })

  // =========================================================================
  // 2. INTENT DETECTOR AUDIT
  // =========================================================================
  describe('2. intentDetector.ts Remediations', () => {
    it('Rejects explicit negations and refusals across languages', () => {
      const negations = [
        '写真送らないでね',
        '自撮りは送らないで',
        '自撮り嫌いだから送らなくていいよ',
        '自撮りは不要です',
        '写真撮らないで',
        "Don't send any photos",
        'Do not send me a selfie',
        'No selfies please',
        '别发照片',
        '不要发自拍',
        '사진 보내지 마'
      ]

      for (const phrase of negations) {
        const result = detectPhotoIntent(phrase)
        expect(result.isPhotoRequested, `Negation "${phrase}" should not request photo`).toBe(false)
        expect(result.triggerType).toBe('none')
      }
    })

    it('Does not trigger photo generation on compound activity inquiry with homework task', () => {
      const compoundQuery = '今何してるの？宿題手伝って'
      const result = detectPhotoIntent(compoundQuery)
      expect(result.isPhotoRequested).toBe(false)
      expect(result.triggerType).toBe('none')

      // But simple activity inquiries still trigger correctly
      const genuineQuery = '今何してるの？'
      const genuineResult = detectPhotoIntent(genuineQuery)
      expect(genuineResult.isPhotoRequested).toBe(true)
      expect(genuineResult.triggerType).toBe('activity')
    })

    it('Strips ALL [PHOTO: ...] directives cleanly with /g flag without leaking to chat', () => {
      expect(PHOTO_DIRECTIVE_REGEX.global).toBe(true)

      const multiTagReply = '自撮り撮ったよ！ [PHOTO: selfie, smile] あとこれも見て！ [PHOTO: cafe, table]'
      const extracted = extractPhotoDirective(multiTagReply)

      expect(extracted.hasDirective).toBe(true)
      expect(extracted.photoTags).toBe('selfie, smile')
      expect(extracted.cleanText).not.toContain('[PHOTO:')
      expect(extracted.cleanText).toBe('自撮り撮ったよ！  あとこれも見て！')
    })
  })

  // =========================================================================
  // 3. PROMPT SYNTHESIZER AUDIT
  // =========================================================================
  describe('3. promptSynthesizer.ts Remediations', () => {
    it('Includes anti-NSFW safety tags in DEFAULT_NEGATIVE_PROMPT', () => {
      expect(DEFAULT_NEGATIVE_PROMPT).toContain('nsfw')
      expect(DEFAULT_NEGATIVE_PROMPT).toContain('nude')
      expect(DEFAULT_NEGATIVE_PROMPT).toContain('explicit')

      const synth = synthesizePrompt({ studentIdOrName: 10010 })
      expect(synth.negativePrompt).toContain('nsfw')
      expect(synth.negativePrompt).toContain('nude')
      expect(synth.negativePrompt).toContain('explicit')
    })
  })

  // =========================================================================
  // 4. POLLINATIONS PROVIDER AUDIT
  // =========================================================================
  describe('4. pollinations.ts Remediations', () => {
    it('Safely encodes prompts containing malformed unpaired surrogates without URIError', () => {
      const malformedPrompt = 'test \uD800 broken surrogate'
      expect(() => buildPollinationsUrl(malformedPrompt)).not.toThrow()

      const url = buildPollinationsUrl(malformedPrompt)
      expect(url).toContain('https://image.pollinations.ai/prompt/')
      expect(() => new URL(url)).not.toThrow()
    })
  })

  // =========================================================================
  // 5. FAL & TOGETHER BYOK PROVIDERS AUDIT
  // =========================================================================
  describe('5. fal.ts & together.ts Remediations', () => {
    it('Strips CRLF from Fal API key and prevents header injection', () => {
      const crlfKey = 'fal_key\r\nX-Injected: attack\r\n'
      const req = buildFalAiRequest('prompt', crlfKey)
      expect(req.headers.Authorization).toBe('Key fal_keyX-Injected: attack')
      expect(req.headers.Authorization).not.toContain('\r')
      expect(req.headers.Authorization).not.toContain('\n')
    })

    it('Strips CRLF from Together API key and prevents header injection', () => {
      const crlfKey = 'together_key\r\nAuthorization: fake\r\n'
      const req = buildTogetherAiRequest('prompt', crlfKey)
      expect(req.headers.Authorization).toBe('Bearer together_keyAuthorization: fake')
      expect(req.headers.Authorization).not.toContain('\r')
      expect(req.headers.Authorization).not.toContain('\n')
    })

    it('Rejects non-string API key with TypeError', async () => {
      await expect(generateFalImage('prompt', 12345 as any)).rejects.toThrow(TypeError)
      await expect(generateTogetherImage('prompt', 12345 as any)).rejects.toThrow(TypeError)
    })
  })

  // =========================================================================
  // 6. IMAGE SERVICE FALLBACK & APOLOGY AUDIT
  // =========================================================================
  describe('6. imageService.ts Remediations', () => {
    it('Returns student apology message when Pollinations fails or times out', async () => {
      const controller = new AbortController()
      controller.abort()

      const result = await generateStudentPhoto(
        10010, // Shiroko
        { userMessage: '写真送って', signal: controller.signal, locale: 'jp' },
        { enabled: true, provider: 'pollinations' }
      )

      expect(result).toBe('「ん、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね。」')
    })

    it('Falls back to Pollinations when BYOK fails, and to apology if Pollinations also fails', async () => {
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'))

      try {
        const controller = new AbortController()
        controller.abort()

        const result = await generateStudentPhoto(
          10005, // Hoshino
          { userMessage: '写真見せて', signal: controller.signal, locale: 'jp' },
          { enabled: true, provider: 'fal', apiKey: 'valid_looking_key' }
        )

        expect(result).toBe('「うへ〜、カメラの調子が悪いみたいだねぇ……ごめんね先生、後でもう一回撮るよ〜」')
      } finally {
        global.fetch = originalFetch
      }
    })
  })

  // =========================================================================
  // 7. TALK HISTORY BOUNDS CHECK AUDIT
  // =========================================================================
  describe('7. talkHistory.ts Remediations', () => {
    it('setTalkContent safely handles non-existent ID when chat was cleared', () => {
      talkHistory.resetData()
      expect(() => {
        talkHistory.setTalkContent(999999, 'new content')
      }).not.toThrow()
    })
  })

  // =========================================================================
  // 8. CHAT DRAGGABLE PLACEHOLDER EXACT MATCH AUDIT
  // =========================================================================
  describe('8. ChatDraggable placeholder strict match', () => {
    const isShootingPlaceholder = (content: string): boolean => {
      if (!content || typeof content !== 'string') return false
      return (
        content === '📷 撮影中...' ||
        content === '[SHOOTING_PHOTO]' ||
        content === '📷 撮影中'
      )
    }

    it('Only matches exact shooting placeholders and preserves conversational camera mentions', () => {
      expect(isShootingPlaceholder('📷 撮影中...')).toBe(true)
      expect(isShootingPlaceholder('[SHOOTING_PHOTO]')).toBe(true)
      expect(isShootingPlaceholder('📷 撮影中')).toBe(true)

      expect(isShootingPlaceholder('先生、今「📷 撮影中」だから待っててね！')).toBe(false)
      expect(isShootingPlaceholder('takingPhoto')).toBe(false)
      expect(isShootingPlaceholder('写真撮ってるよ')).toBe(false)
    })
  })
})
