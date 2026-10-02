import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildOpenAiImageRequest,
  generateOpenAiImage
} from '@/assets/imageGen/providers/openai'
import {
  buildStabilityAiRequest,
  generateStabilityImage
} from '@/assets/imageGen/providers/stability'
import { generateStudentPhoto } from '@/assets/imageGen/imageService'

describe('Multi-Provider Image Generation Test Suite (TDD)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('1. OpenAI (DALL-E 3 / DALL-E 2) Provider', () => {
    it('constructs correct OpenAI image generation request body and headers', () => {
      const apiKey = 'sk-mock-openai-key-12345'
      const prompt = 'masterpiece, 1girl, amau_ako_(blue_archive), halo, selfie'

      const req = buildOpenAiImageRequest(prompt, apiKey, {
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard'
      })

      expect(req.url).toBe('https://api.openai.com/v1/images/generations')
      expect(req.method).toBe('POST')
      expect(req.headers['Authorization']).toBe(`Bearer ${apiKey}`)
      expect(req.headers['Content-Type']).toBe('application/json')

      const body = JSON.parse(req.body)
      expect(body.model).toBe('dall-e-3')
      expect(body.prompt).toContain(prompt)
      expect(body.prompt).toContain('Anime illustration style')
      expect(body.size).toBe('1024x1024')
      expect(body.n).toBe(1)
    })

    it('generates image URL from OpenAI API response', async () => {
      const expectedUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/image.png'
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ url: expectedUrl }]
        })
      })

      const result = await generateOpenAiImage('test prompt', 'sk-test-key', {
        model: 'dall-e-3'
      })

      expect(result).toBe(expectedUrl)
      expect(global.fetch).toHaveBeenCalled()
    })

    it('throws descriptive error on OpenAI API failure (e.g. 401 unauthorized)', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => JSON.stringify({ error: { message: 'Incorrect API key provided' } })
      })

      await expect(generateOpenAiImage('prompt', 'bad-key')).rejects.toThrow('OpenAI API error (401)')
    })
  })

  describe('2. Stability AI (Stable Diffusion SDXL) Provider', () => {
    it('constructs correct Stability AI text-to-image request with anime style preset', () => {
      const apiKey = 'sk-mock-stability-key-67890'
      const prompt = 'masterpiece, 1girl, amau_ako_(blue_archive), halo, selfie'

      const req = buildStabilityAiRequest(prompt, apiKey, {
        engineId: 'stable-diffusion-xl-1024-v1-0',
        stylePreset: 'anime'
      })

      expect(req.url).toBe('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image')
      expect(req.method).toBe('POST')
      expect(req.headers['Authorization']).toBe(`Bearer ${apiKey}`)
      expect(req.headers['Content-Type']).toBe('application/json')
      expect(req.headers['Accept']).toBe('application/json')

      const body = JSON.parse(req.body)
      expect(body.text_prompts).toBeDefined()
      expect(body.text_prompts[0].text).toContain(prompt)
      expect(body.style_preset).toBe('anime')
      expect(body.samples).toBe(1)
    })

    it('generates base64 data URI from Stability AI response', async () => {
      const fakeBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          artifacts: [{ base64: fakeBase64, finishReason: 'SUCCESS' }]
        })
      })

      const result = await generateStabilityImage('test prompt', 'sk-stability-key')
      expect(result).toBe(`data:image/png;base64,${fakeBase64}`)
    })
  })

  describe('3. Multi-Provider Integration in imageService', () => {
    it('dispatches to OpenAI provider when openai is configured with apiKey', async () => {
      const expectedUrl = 'https://mock.openai.cdn/photo.png'
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: [{ url: expectedUrl }]
        })
      })

      const result = await generateStudentPhoto(
        20008, // Ako
        { userMessage: '自撮り送って', locale: 'jp' },
        { enabled: true, provider: 'openai', apiKey: 'sk-valid-openai-key' }
      )

      expect(result).toBe(expectedUrl)
    })

    it('dispatches to Stability AI provider when stability is configured with apiKey', async () => {
      const fakeBase64 = 'mockbase64string'
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          artifacts: [{ base64: fakeBase64 }]
        })
      })

      const result = await generateStudentPhoto(
        20008, // Ako
        { userMessage: '自撮り送って', locale: 'jp' },
        { enabled: true, provider: 'stability', apiKey: 'sk-valid-stability-key' }
      )

      expect(result).toBe(`data:image/png;base64,${fakeBase64}`)
    })

    it('falls back to Pollinations when OpenAI API key is missing', async () => {
      const result = await generateStudentPhoto(
        20008, // Ako
        { userMessage: '自撮り送って', locale: 'jp' },
        { enabled: true, provider: 'openai', apiKey: '' }
      )

      expect(result).toContain('https://image.pollinations.ai/prompt/')
    })

    it('falls back to Pollinations when Stability API fails, preventing photo failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Error',
        text: async () => 'Service down'
      })

      const result = await generateStudentPhoto(
        20008, // Ako
        { userMessage: '自撮り送って', locale: 'jp' },
        { enabled: true, provider: 'stability', apiKey: 'sk-test' }
      )

      // Fallback succeeds with Pollinations URL
      expect(result).toContain('https://image.pollinations.ai/prompt/')
    })
  })
})
