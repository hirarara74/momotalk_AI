// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs() })

it('requires a server-only key and excludes the proxy from builds', async () => {
        const { default: config } = await import('../../vite.config')
        const configure = config as (env: { command: string; mode: string }) => any
        vi.stubEnv('GROQ_DEBUG_API_KEY', '')
        expect(() => configure({ command: 'serve', mode: 'debug' })).toThrow('GROQ_DEBUG_API_KEY')
        vi.stubEnv('GROQ_DEBUG_API_KEY', 'gsk_testOnlyNotARealKey')
        const debug = configure({ command: 'serve', mode: 'debug' })
        expect(debug.server.host).toBe('127.0.0.1')
        const proxy = Object.values(debug.server.proxy)[0] as any
        expect(proxy.target).toBe('https://api.groq.com')
        let middleware: any
        debug.plugins[0].configureServer({ middlewares: { use: (handler: any) => { middleware = handler } } })
        const response = { statusCode: 200, end: vi.fn() }
        const next = vi.fn()
        const request = { url: '/momotalk/api/debug-groq/chat/completions', method: 'POST', headers: { 'content-type': 'application/json', host: '127.0.0.1:5174', origin: 'https://untrusted.invalid' } }
        middleware(request, response, next)
        expect(response.statusCode).toBe(403)
        expect(next).not.toHaveBeenCalled()
        request.headers.origin = 'http://127.0.0.1:5174'
        middleware(request, response, next)
        expect(next).toHaveBeenCalledOnce()
        const setHeader = vi.fn()
        proxy.configure({ on: (_event: string, callback: any) => callback({ setHeader }) })
        expect(setHeader.mock.calls[0][0]).toBe('Authorization')
        expect(setHeader.mock.calls[0][1] === 'Bearer gsk_testOnlyNotARealKey').toBe(true)
        expect(configure({ command: 'build', mode: 'debug' }).server.proxy).toBeUndefined()
    })
