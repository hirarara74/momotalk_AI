import { describe, it, expect, vi, beforeEach } from 'vitest'

// Core imageGen imports
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
  getStudentApologyMessage,
  isPhotoUrl,
  isPhotoFailed
} from '@/assets/imageGen/imageService'
import {
  detectPhotoIntent,
  extractPhotoDirective,
  buildPhotoPromptDirective
} from '@/assets/imageGen/intentDetector'
import {
  synthesizePrompt
} from '@/assets/imageGen/promptSynthesizer'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'

describe('Adversarial Stress Test Suite — Challenger 2', () => {

  // =========================================================================
  // 1. PROVIDER URL/PAYLOAD GENERATION & BOUNDARY CONDITIONS
  // =========================================================================
  describe('1. Provider URL / Payload Generation & Injection Defense', () => {

    describe('1.1 Seed and Dimension Boundary Conditions in Pollinations', () => {
      it('tests behavior with NaN seed', () => {
        const url = buildPollinationsUrl('test_prompt', NaN)
        // Check if seed=NaN is emitted in query string
        expect(url).toContain('seed=NaN')
      })

      it('tests behavior with negative seed', () => {
        const url = buildPollinationsUrl('test_prompt', -999)
        expect(url).toContain('seed=-999')
      })

      it('tests behavior with floating point seed', () => {
        const url = buildPollinationsUrl('test_prompt', 3.14159)
        expect(url).toContain('seed=3.14159')
      })

      it('tests behavior with extreme options object (NaN seed, negative dimensions)', () => {
        const url = buildPollinationsUrl('test_prompt', {
          seed: NaN,
          width: -100,
          height: 0
        })
        expect(url).toContain('width=-100')
        expect(url).toContain('height=0')
        expect(url).toContain('seed=NaN')
      })
    })

    describe('1.2 Special Characters, Script Injection, and Surrogates in Prompts', () => {
      it('correctly escapes HTML tags and quotes in Pollinations URL', () => {
        const xssPrompt = '<script>alert("xss")</script>, "quoted", 先生 & friends #1'
        const url = buildPollinationsUrl(xssPrompt)
        expect(url).not.toContain('<script>')
        expect(url).toContain(encodeURIComponent(xssPrompt))
        expect(() => new URL(url)).not.toThrow()
      })

      it('safely handles unpaired unicode surrogate in prompt without throwing URIError', () => {
        const invalidSurrogatePrompt = 'test \uD800 invalid surrogate'
        let threwUriError = false
        let url = ''
        try {
          url = buildPollinationsUrl(invalidSurrogatePrompt)
        } catch (e: any) {
          threwUriError = e instanceof URIError
        }
        expect(threwUriError).toBe(false)
        expect(url).toContain('https://image.pollinations.ai/prompt/')
      })

      it('checks JSON payload generation with special characters in Fal and Together', () => {
        const complexPrompt = '1girl, "special quotes", \nnewline\t, <script>alert(1)</script>'
        const falReq = buildFalAiRequest(complexPrompt, 'mock_key')
        const togetherReq = buildTogetherAiRequest(complexPrompt, 'mock_key')

        const falBody = JSON.parse(falReq.body)
        const togetherBody = JSON.parse(togetherReq.body)

        expect(falBody.prompt).toBe(complexPrompt)
        expect(togetherBody.prompt).toBe(complexPrompt)
      })
    })

    describe('1.3 BYOK Header Injection Prevention (CRLF & Header Forgery)', () => {
      it('strips CRLF from API key preventing header injection in Fal request', () => {
        const crlfKey = 'key_123\r\nX-Injected-Header: evil\r\n'
        const req = buildFalAiRequest('prompt', crlfKey)
        expect(req.headers['Authorization']).not.toContain('\r')
        expect(req.headers['Authorization']).not.toContain('\n')
        expect(req.headers['Authorization']).toBe('Key key_123X-Injected-Header: evil')
        // When passed to Headers constructor, this must not throw TypeError
        expect(() => {
          new Headers(req.headers)
        }).not.toThrow()
      })

      it('strips CRLF from API key preventing header injection in Together request', () => {
        const crlfKey = 'key_456\r\nX-Admin-Bypass: true\r\n'
        const req = buildTogetherAiRequest('prompt', crlfKey)
        expect(req.headers['Authorization']).not.toContain('\r')
        expect(req.headers['Authorization']).not.toContain('\n')
        expect(req.headers['Authorization']).toBe('Bearer key_456X-Admin-Bypass: true')
        expect(() => {
          new Headers(req.headers)
        }).not.toThrow()
      })

      it('checks behavior when non-string apiKey is provided (e.g. number from corrupted config)', async () => {
        const numericKey: any = 12345
        await expect(generateFalImage('prompt', numericKey)).rejects.toThrow(TypeError)
        await expect(generateTogetherImage('prompt', numericKey)).rejects.toThrow(TypeError)
      })
    })
  })

  // =========================================================================
  // 2. RESILIENCE, ERROR HANDLING & APOLOGY VERIFICATION
  // =========================================================================
  describe('2. Resilience, Error Handling & Student Apology Fallback', () => {

    describe('2.1 Fal.ai & Together AI Failure Behavior in imageService', () => {
      it('inspects whether Fal HTTP 401 returns student apology or silently falls back to Pollinations', async () => {
        // Mock global fetch to simulate 401 Unauthorized
        const originalFetch = global.fetch
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'Invalid API Key'
        } as any)

        try {
          const result = await generateStudentPhoto(
            10010, // Shiroko
            { userMessage: '自撮り送って！', locale: 'jp' },
            {
              enabled: true,
              provider: 'fal',
              apiKey: 'invalid_key_401'
            }
          )

          // CHALLENGE FINDING: When Fal fails with 401, imageService does NOT return
          // an in-character apology; instead, it silently falls back to Pollinations.ai!
          const isApology = result?.includes('カメラの調子') || result?.includes('ごめんね')
          const isPollinations = result?.includes('pollinations.ai')

          // Document the actual behavior
          expect(isPollinations).toBe(true)
          expect(isApology).toBe(false)
        } finally {
          global.fetch = originalFetch
        }
      })

      it('inspects whether Together AI HTTP 429 returns student apology or falls back to Pollinations', async () => {
        const originalFetch = global.fetch
        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: async () => 'Rate limit exceeded'
        } as any)

        try {
          const result = await generateStudentPhoto(
            13010, // Yuuka
            { userMessage: '写真送って', locale: 'jp' },
            {
              enabled: true,
              provider: 'together',
              apiKey: 'rate_limited_key'
            }
          )

          const isApology = result?.includes('カメラの調子') || result?.includes('撮り直します')
          const isPollinations = result?.includes('pollinations.ai')

          expect(isPollinations).toBe(true)
          expect(isApology).toBe(false)
        } finally {
          global.fetch = originalFetch
        }
      })
    })

    describe('2.2 Pollinations Zero-Network & Timeout Behavior', () => {
      it('verifies that generatePollinationsImage makes 0 network calls and resolves synchronously', async () => {
        const originalFetch = global.fetch
        const fetchSpy = vi.fn()
        global.fetch = fetchSpy

        try {
          const start = Date.now()
          const url = await generatePollinationsImage('test_prompt')
          const duration = Date.now() - start

          // Zero network requests made by generatePollinationsImage
          expect(fetchSpy).not.toHaveBeenCalled()
          // Returned immediately (< 50ms)
          expect(duration).toBeLessThan(50)
          expect(url).toContain('https://image.pollinations.ai/prompt/')
        } finally {
          global.fetch = originalFetch
        }
      })

      it('checks whether imageService ever returns student apology for Pollinations provider', async () => {
        // Even when caller aborts or times out
        const controller = new AbortController()
        controller.abort() // already aborted signal

        const result = await generateStudentPhoto(
          10010,
          { userMessage: '自撮り送って', signal: controller.signal, locale: 'jp' },
          { enabled: true, provider: 'pollinations' }
        )

        // When signal was pre-aborted, it throws and enters catch block, returning student apology!
        expect(result).toBe('「ん、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね。」')
      })
    })

    describe('2.3 API Key Absence Handling', () => {
      it('gracefully falls back to Pollinations when Fal API key is missing or empty', async () => {
        const result = await generateStudentPhoto(
          10010,
          { userMessage: '自撮り送って', locale: 'jp' },
          { enabled: true, provider: 'fal', apiKey: '   ' }
        )
        expect(result).toContain('https://image.pollinations.ai/prompt/')
      })

      it('gracefully falls back to Pollinations when Together API key is missing or empty', async () => {
        const result = await generateStudentPhoto(
          10010,
          { userMessage: '自撮り送って', locale: 'jp' },
          { enabled: true, provider: 'together', apiKey: '' }
        )
        expect(result).toContain('https://image.pollinations.ai/prompt/')
      })
    })
  })

  // =========================================================================
  // 3. UI STATE TRANSITIONS, CONCURRENCY & TALK DELETION BUG
  // =========================================================================
  describe('3. UI State Transitions & Concurrency Edge Cases', () => {

    beforeEach(() => {
      talkHistory.resetData()
    })

    describe('3.1 talkHistory.setTalkContent Unhandled Crash Bug when Message Deleted', () => {
      it('safely handles setTalkContent for non-existent talk ID without crashing', () => {
        // Suppose talkHistory has 1 talk with ID 1
        talkHistory.pushTalk({
          Id: 1,
          Name: 'Sensei',
          Avatar: '',
          type: 1,
          flag: 2,
          content: 'Hello'
        })

        // User clears chat or deletes placeholder (talk ID 999 does not exist)
        expect(() => {
          talkHistory.setTalkContent(999, 'https://image.pollinations.ai/prompt/test')
        }).not.toThrow()
      })

      it('safely completes background generation when talk was cleared/reset', async () => {
        // Setup initial talk with placeholder
        const placeholderId = talkHistory.talkId++
        talkHistory.pushTalk({
          Id: placeholderId,
          Name: '砂狼シロコ',
          Avatar: '',
          type: 0,
          flag: 0,
          content: '📷 撮影中...'
        })

        // Simulate user clearing chat while generation is running in background
        talkHistory.resetData()

        // Background generation resolves and attempts to update placeholder
        let threwError = false
        try {
          talkHistory.setTalkContent(placeholderId, 'https://v3b.fal.media/photo.jpg')
        } catch (e: any) {
          threwError = true
        }

        expect(threwError).toBe(false)
      })
    })

    describe('3.2 Directive Extraction Edge Cases (Multiple Directives & Full-Width)', () => {
      it('tests behavior when LLM outputs multiple [PHOTO: ...] directives', () => {
        const textWithTwo = 'ちょっと待ってね。[PHOTO: selfie, smile] また後でも送るね！ [PHOTO: cafe, tea]'
        const result = extractPhotoDirective(textWithTwo)

        expect(result.hasDirective).toBe(true)
        expect(result.photoTags).toBe('selfie, smile')
        // All [PHOTO: ...] directives are cleanly stripped
        expect(result.cleanText).not.toContain('[PHOTO:')
        expect(result.cleanText).toBe('ちょっと待ってね。 また後でも送るね！')
      })
    })

    describe('3.3 False Positive in isShootingPlaceholder', () => {
      const isShootingPlaceholder = (content: string): boolean => {
        if (!content || typeof content !== 'string') return false
        return (
          content === '📷 撮影中...' ||
          content === '[SHOOTING_PHOTO]' ||
          content === '📷 撮影中'
        )
      }

      it('ensures legitimate student dialogue mentioning camera is not treated as placeholder', () => {
        const normalStudentDialogue = '先生、今「📷 撮影中」だからちょっと待っててね！'
        expect(isShootingPlaceholder(normalStudentDialogue)).toBe(false)
        expect(isShootingPlaceholder('📷 撮影中...')).toBe(true)
        expect(isShootingPlaceholder('[SHOOTING_PHOTO]')).toBe(true)
        expect(isShootingPlaceholder('📷 撮影中')).toBe(true)
      })
    })

    describe('3.4 LocalStorage Serialization Edge Cases', () => {
      it('tests store.getData with corrupted and non-standard localStorage values', async () => {
        localStorage.clear()
        localStorage.setItem('image-gen-enabled', '0') // JSON number 0
        localStorage.setItem('image-gen-provider', '"unknown_provider"')
        localStorage.setItem('image-gen-api-key', '12345') // JSON number
        localStorage.setItem('image-gen-model', '{"nested":"object"}')

        store.getData()

        // Provider defaults to pollinations for unknown provider
        expect(store.imageGenProvider).toBe('pollinations')

        // Notice: store.imageGenApiKey received a number 12345 because JSON.parse('12345') is a number!
        expect(typeof (store.imageGenApiKey as any)).toBe('number')

        // If passed to generateFalImage, it will reject with TypeError: apiKey.trim is not a function
        await expect(
          generateFalImage('prompt', store.imageGenApiKey as any)
        ).rejects.toThrow(TypeError)
      })
    })

    describe('3.5 isPhotoFailed Dead Code Audit', () => {
      it('verifies behavior of isPhotoFailed', () => {
        expect(isPhotoFailed('「ん、カメラの調子が悪いみたい……ごめんね先生、後でもう一回撮るね。」')).toBe(true)
        expect(isPhotoFailed('https://image.pollinations.ai/prompt/test')).toBe(false)
        expect(isPhotoFailed('📷 撮影中...')).toBe(false)
        expect(isPhotoFailed('普通のメッセージ')).toBe(false)
      })
    })
  })
})
