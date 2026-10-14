import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildFalAiRequest } from '@/assets/imageGen/providers/fal'
import { ClaudeProvider } from '@/assets/ai/claude'
import { getAIProvider } from '@/assets/ai'
import { store } from '@/assets/storeUtils/store'

afterEach(() => { vi.unstubAllGlobals() })

describe('audit fixes', () => {
    it('sends the Fal key only to fal.run', () => {
        expect(() => buildFalAiRequest('p', 'k', { model: 'https://evil.example/x' })).toThrow()
        expect(() => buildFalAiRequest('p', 'k', { model: 'http://fal.run/x' })).toThrow()
        expect(buildFalAiRequest('p', 'k', { model: 'https://fal.run/fal-ai/x' }).url).toBe('https://fal.run/fal-ai/x')
        expect(buildFalAiRequest('p', 'k', { model: 'fal-ai/x' }).url).toBe('https://fal.run/fal-ai/x')
    })
    it('uses the Anthropic browser-access header', async () => {
        const fetchMock = vi.fn(async () => ({ ok: false, status: 400, text: async () => 'x' }))
        vi.stubGlobal('fetch', fetchMock)
        await new ClaudeProvider('k').streamChat('s', [], 'hi', () => {}).catch(() => {})
        const headers = (fetchMock.mock.calls[0] as any)[1].headers
        expect(headers['anthropic-dangerous-direct-browser-access']).toBe('true')
        expect(headers['dangerously-allow-browser']).toBeUndefined()
    })
    it('never points OpenAI/Claude at a leftover Groq base URL', () => {
        store.aiProvider = 'openai'
        store.aiBaseUrl = 'https://api.groq.com/openai/v1'
        expect((getAIProvider() as any).baseUrl).not.toContain('groq.com')
        store.aiProvider = 'claude'
        expect((getAIProvider() as any).baseUrl).not.toContain('groq.com')
    })
    it('keeps image-generation keys per provider', () => {
        store.imageGenProvider = 'fal'; store.imageKeyOwner = 'fal'; store.imageGenApiKey = 'fal-key'
        store.imageGenProvider = 'together'; store.switchImageProviderKey()
        expect(store.imageGenApiKey).toBe('')
        store.imageGenApiKey = 'together-key'
        store.imageGenProvider = 'fal'; store.switchImageProviderKey()
        expect(store.imageGenApiKey).toBe('fal-key')
    })
})
