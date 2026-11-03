import { afterEach, describe, expect, it, vi } from 'vitest'

async function loadProvider(dev: boolean, mode: string) {
    vi.resetModules()
    vi.stubEnv('DEV', dev)
    vi.stubEnv('MODE', mode)
    vi.stubEnv('BASE_URL', '/momotalk/')
    const { store } = await import('../assets/storeUtils/store')
    store.aiProvider = 'openai'
    store.aiApiKey = 'saved-production-key'
    store.aiBaseUrl = 'https://production.invalid/v1'
    store.aiModel = 'saved-model'
    const { getAIProvider } = await import('../assets/ai')
    return { store, provider: getAIProvider() }
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
    localStorage.clear()
})

describe('isolated debug Groq routing', () => {
    it('overrides saved production credentials and sends only to the local proxy', async () => {
        const { store, provider } = await loadProvider(true, 'debug')
        expect(provider.id).toBe('groq')
        const fetchMock = vi.fn().mockResolvedValue(new Response(
            'data: {"choices":[{"delta":{"content":"debug-ok"}}]}\n\ndata: [DONE]\n',
            { headers: { 'Content-Type': 'text/event-stream' } }
        ))
        vi.stubGlobal('fetch', fetchMock)
        expect(await provider.streamChat('test', [], 'test', () => {})).toBe('debug-ok')
        expect(fetchMock.mock.calls[0][0]).toBe('/momotalk/api/debug-groq/chat/completions')
        expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer ')
        expect(store.aiApiKey).toBe('saved-production-key')
        store.aiApiKey = ''
        expect(store.checkAndPromptApiKey()).toBe(false)
        const { hasConfiguredApiKey } = await import('../assets/utils/webAppUtils')
        expect(hasConfiguredApiKey()).toBe(true)
    })

    it.each([[false, 'debug'], [false, 'production'], [true, 'development']])(
        'retains normal routing outside debug development (%s, %s)', async (dev, mode) => {
            const { provider } = await loadProvider(dev, mode)
            expect(provider.id).toBe('openai')
        }
    )

})
