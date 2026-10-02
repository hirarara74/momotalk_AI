import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buildStabilityAiRequest,
  generateStabilityImage,
  checkStabilityBalance,
  parseStabilityErrorMessage
} from '@/assets/imageGen/providers/stability'
import { testImageProviderConnection } from '@/assets/imageGen/imageService'

describe('Stability AI Error Handling & Balance Checking Suite (TDD)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('1. checkStabilityBalance', () => {
    it('successfully retrieves credits when balance is positive', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ credits: 25.5 })
      } as any)

      const result = await checkStabilityBalance('sk-valid-key')
      expect(result.valid).toBe(true)
      expect(result.credits).toBe(25.5)
      expect(result.message).toContain('25.5')
    })

    it('identifies insufficient balance when credits are 0', async () => {
      // Exactly simulating user real scenario: status 200 with credits: 0
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ credits: 0 })
      } as any)

      const result = await checkStabilityBalance('sk-vO0Y7eJVJ97PCDBcu5iAuR09kvu1rfOtgTAx9cAJv06cpciL')
      expect(result.valid).toBe(true)
      expect(result.credits).toBe(0)
      expect(result.hasEnoughCredits).toBe(false)
      expect(result.message).toContain('残高が不足')
    })

    it('identifies invalid API key on HTTP 401', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '{"message":"Invalid API Key"}'
      } as any)

      const result = await checkStabilityBalance('sk-bad-key')
      expect(result.valid).toBe(false)
      expect(result.credits).toBe(0)
      expect(result.hasEnoughCredits).toBe(false)
      expect(result.message).toContain('無効')
    })
  })

  describe('2. parseStabilityErrorMessage & generateStabilityImage on Insufficient Balance', () => {
    it('parses insufficient_balance 429 response into helpful user instruction', () => {
      const rawError = JSON.stringify({
        id: '3be7103ebd2a68a9f6e6c5207ed04420',
        message: 'Your organization does not have enough balance to request this action (need $0.009, have $0 in active grants, $0 in balance).',
        name: 'insufficient_balance'
      })

      const formatted = parseStabilityErrorMessage(429, rawError)
      expect(formatted).toContain('クレジット残高が不足')
      expect(formatted).toContain('$0.009')
    })

    it('throws descriptive error containing balance guidance when generateStabilityImage hits 429 insufficient_balance', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: async () => JSON.stringify({
          id: '3be7103ebd2a68a9f6e6c5207ed04420',
          message: 'Your organization does not have enough balance to request this action (need $0.009, have $0 in active grants, $0 in balance).',
          name: 'insufficient_balance'
        })
      } as any)

      await expect(
        generateStabilityImage('Shiroko anime', 'sk-vO0Y7eJVJ97PCDBcu5iAuR09kvu1rfOtgTAx9cAJv06cpciL')
      ).rejects.toThrow(/クレジット残高が不足/)
    })
  })

  describe('3. testImageProviderConnection orchestration', () => {
    it('returns structured result for Stability AI with balance details', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ credits: 0 })
      } as any)

      const res = await testImageProviderConnection('stability', 'sk-vO0Y7eJVJ97PCDBcu5iAuR09kvu1rfOtgTAx9cAJv06cpciL')
      expect(res.success).toBe(true)
      expect(res.warning).toBe(true) // balance is 0
      expect(res.message).toContain('残高が不足')
    })

    it('returns failure when API key is missing for BYOK provider', async () => {
      const res = await testImageProviderConnection('stability', '')
      expect(res.success).toBe(false)
      expect(res.message).toContain('APIキーが入力されていません')
    })
  })
})
