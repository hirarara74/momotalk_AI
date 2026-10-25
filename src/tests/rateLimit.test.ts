import { describe, it, expect, vi, afterEach } from 'vitest'
import { AiRateLimitError, parseRetryAfterMs, earliestRetry, notifyRateLimit, rateLimitNotice, formatWait } from '../assets/ai/rateLimit'
import { GroqProvider } from '../assets/ai/groq'

const t = (k: string, p: { n: number }) => `${p.n}${k.slice(-1).toLowerCase()}`

describe('parseRetryAfterMs', () => {
    it('prefers retry-after seconds', () => {
        expect(parseRetryAfterMs(new Headers({ 'retry-after': '432' }), '')).toBe(432000)
    })
    it('reads "try again in" from the body', () => {
        expect(parseRetryAfterMs(new Headers(), 'Please try again in 7m12.5s. Need more')).toBe(432500)
    })
    it('falls back to x-ratelimit-reset-tokens, then null', () => {
        expect(parseRetryAfterMs(new Headers({ 'x-ratelimit-reset-tokens': '1h2m' }), '')).toBe(3720000)
        expect(parseRetryAfterMs(new Headers(), 'nope')).toBeNull()
    })
})

describe('rate limit notice', () => {
    it('keeps the earliest known recovery', () => {
        expect(earliestRetry(null, 5)).toBe(5)
        expect(earliestRetry(9, 5)).toBe(5)
        expect(earliestRetry(9, null)).toBe(9)
    })
    it('pops up only for waits of a minute or more', () => {
        rateLimitNotice.value = null
        notifyRateLimit(new AiRateLimitError('x', 8000), 1000)
        expect(rateLimitNotice.value).toBeNull()
        notifyRateLimit(new AiRateLimitError('x', null), 1000)
        expect(rateLimitNotice.value).toBeNull()
        notifyRateLimit(new AiRateLimitError('x', 600000), 1000)
        expect(rateLimitNotice.value).toEqual({ resetAt: 601000 })
        notifyRateLimit(new Error('429'), 1000)
    })
    it('formats hours/minutes and seconds', () => {
        expect(formatWait(3720000, t)).toBe('1h 2m')
        expect(formatWait(432500, t)).toBe('7m 13s')
        expect(formatWait(8000, t)).toBe('8s')
    })
})

describe('GroqProvider 429', () => {
    afterEach(() => vi.unstubAllGlobals())
    it('throws AiRateLimitError with the shortest recovery when every candidate is rate limited', async () => {
        let n = 0
        vi.stubGlobal('fetch', vi.fn(async () => {
            n++
            return new Response('{"error":{"message":"Rate limit reached. Please try again in 10m"}}', { status: 429, headers: { 'retry-after': String(n === 1 ? 900 : 600) } })
        }))
        const err: any = await new GroqProvider('k').streamChat('s', [], 'hi', () => {}).catch(e => e)
        expect(err).toBeInstanceOf(AiRateLimitError)
        expect(err.retryAfterMs).toBe(600000)
    })
})
