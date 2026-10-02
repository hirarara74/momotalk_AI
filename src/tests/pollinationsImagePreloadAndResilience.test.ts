import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generatePollinationsImage,
  buildPollinationsUrl,
  fetchPollinationsImageWithResilience
} from '@/assets/imageGen/providers/pollinations'
import { generateStudentPhoto } from '@/assets/imageGen/imageService'
import { STUDENT_VISUAL_PROFILES } from '@/assets/imageGen/characterDictionary'

describe('Pollinations Image Preload and Resilience Test Suite (TDD)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('1. Model propagation & URL configuration', () => {
    it('generatePollinationsImage propagates model parameter correctly into URL', async () => {
      const url = await generatePollinationsImage('masterpiece, 1girl, kakudate_karin_(blue_archive)', {
        model: 'sana'
      })

      expect(url).toContain('model=sana')
      expect(url).toContain('kakudate_karin')
    })
  })

  describe('2. Retry & Model Fallback on HTTP 500 / Transient Errors', () => {
    it('retries automatically when Pollinations returns HTTP 500 on first attempt', async () => {
      const mockBlob = new Blob(['success image'], { type: 'image/jpeg' })
      let attempts = 0

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        attempts++
        if (attempts === 1) {
          // First attempt fails with 500 Internal Server Error (common during cold start/high load)
          return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => '{"error":"Worker temporarily unavailable"}'
          }
        }
        // Second attempt succeeds
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'image/jpeg' }),
          blob: async () => mockBlob
        }
      })

      const result = await fetchPollinationsImageWithResilience(
        'masterpiece, kakudate_karin_(blue_archive)',
        { model: 'flux' }
      )

      expect(attempts).toBe(2)
      expect(result).toBeDefined()
    })

    it('falls back to default flux model when custom model (e.g. sana) fails with 500', async () => {
      const mockBlob = new Blob(['fallback success image'], { type: 'image/jpeg' })
      const requestedUrls: string[] = []

      global.fetch = vi.fn().mockImplementation(async (url: string) => {
        requestedUrls.push(url)
        if (url.includes('model=sana')) {
          // sana repeatedly fails
          return {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => 'sana backend error'
          }
        }
        // fallback model succeeds
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'image/jpeg' }),
          blob: async () => mockBlob
        }
      })

      const result = await fetchPollinationsImageWithResilience(
        'masterpiece, kakudate_karin_(blue_archive)',
        { model: 'sana' }
      )

      expect(result).toBeDefined()
      // Should have attempted sana first, then fallen back
      expect(requestedUrls.some(u => u.includes('model=sana'))).toBe(true)
      expect(requestedUrls.some(u => !u.includes('model=sana') || u.includes('model=flux'))).toBe(true)
    })
  })

  describe('3. Karin (角楯カリン) Generation End-to-End Resilience in imageService', () => {
    it('successfully produces verified photo for Karin (20001) using imageService', async () => {
      const photoResult = await generateStudentPhoto(
        'カリン',
        { userMessage: '自撮り送って', locale: 'jp' },
        { enabled: true, provider: 'pollinations', model: 'sana' }
      )

      expect(photoResult).toBeDefined()
      expect(photoResult).not.toContain('カメラの調子')
      expect(photoResult).toContain('kakudate_karin')
      expect(photoResult).toContain('model=sana')
    })
  })
})
