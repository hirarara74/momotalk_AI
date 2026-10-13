import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, reactive } from 'vue'
import i18n from '@/locales/i18n'
import GroqUsage from '@/components/GroqUsage.vue'
import { groqUsage, parseResetDuration, readGroqTokenLimit, recordGroqUsage } from '@/assets/ai/groqUsage'

const headers = () => new Headers({
    'x-ratelimit-limit-tokens': '8000',
    'x-ratelimit-remaining-tokens': '6000',
    'x-ratelimit-reset-tokens': '1m7.66s'
})
afterEach(() => { groqUsage.value = null; vi.useRealTimers() })

describe('Groq organization token quota', () => {
    it('parses compound durations and rejects missing or invalid values', () => {
        expect(parseResetDuration('1h2m3.5s')).toBe(3723500)
        expect(parseResetDuration('12ms')).toBe(12)
        for (const value of [null, '', '-1s', '5s garbage', 'Infinitys']) expect(parseResetDuration(value)).toBeNull()
    })
    it('uses only the returned minute quota and rejects inconsistent headers', () => {
        expect(readGroqTokenLimit(headers(), 1000)).toEqual({ limit: 8000, remaining: 6000, used: 2000, observedAt: 1000, resetAt: 68660 })
        expect(readGroqTokenLimit(new Headers())).toBeNull()
        for (const value of ['-1', '9000', 'NaN', 'Infinity', ' ']) {
            const h = headers(); h.set('x-ratelimit-remaining-tokens', value)
            expect(readGroqTokenLimit(h)).toBeNull()
        }
        const h = headers(); h.delete('x-ratelimit-reset-tokens')
        expect(readGroqTokenLimit(h)?.resetAt).toBeNull()
    })
    it('renders usage, counts down, marks stale data and hides another credential', async () => {
        vi.useFakeTimers(); vi.setSystemTime(1000)
        recordGroqUsage(headers(), 'test-key', '/proxy', 'fallback-model')
        const props = reactive({ apiKey: 'test-key', baseUrl: '/proxy/', visible: true })
        const host = document.createElement('div')
        const app = createApp(GroqUsage, props).use(i18n)
        app.mount(host)
        try {
            expect(host.textContent).toContain('2,000 / 8,000')
            expect(host.textContent).toContain('fallback-model')
            expect(host.textContent).toContain('1分 8秒')
            vi.advanceTimersByTime(68000); await nextTick()
            expect(host.textContent).toContain('次の応答で更新')
            app._instance!.props.apiKey = 'other-key'; await nextTick()
            expect(host.textContent).not.toContain('2,000 / 8,000')
            expect(host.textContent).toContain('まだ取得できていません')
        } finally { app.unmount() }
        expect(vi.getTimerCount()).toBe(0)
    })
    it('clears an old snapshot when the next response has no readable headers', () => {
        recordGroqUsage(headers(), '', '/proxy', 'model')
        recordGroqUsage(undefined, '', '/proxy', 'model')
        expect(groqUsage.value?.tokens).toBeNull()
    })
})
