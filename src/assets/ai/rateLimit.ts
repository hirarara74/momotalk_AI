import { shallowRef } from 'vue'
import { parseResetDuration } from './groqUsage'

/** A 429 from the AI provider. retryAfterMs is the earliest time the provider says it will accept requests again. */
export class AiRateLimitError extends Error {
    constructor(message: string, public retryAfterMs: number | null) {
        super(message)
        this.name = 'AiRateLimitError'
    }
}

/** Groq sends retry-after (seconds), "Please try again in 7m12.5s" in the body, and x-ratelimit-reset-tokens. */
export function parseRetryAfterMs(headers: Headers | undefined, bodyText = ''): number | null {
    const header = headers?.get('retry-after')?.trim()
    if (header && Number.isFinite(Number(header)) && Number(header) >= 0) return Number(header) * 1000
    const inBody = /try again in ((?:\d+(?:\.\d+)?(?:ms|s|m|h|d))+)/i.exec(bodyText)
    if (inBody) {
        const ms = parseResetDuration(inBody[1])
        if (ms !== null) return ms
    }
    return parseResetDuration(headers?.get('x-ratelimit-reset-tokens') ?? null)
}

/** The earliest known recovery across candidate models (null = unknown). */
export function earliestRetry(a: number | null | undefined, b: number | null): number | null {
    if (a == null) return b
    if (b == null) return a
    return Math.min(a, b)
}

/** Waits shorter than this are ordinary per-minute throttling: the chat message is enough, no popup. */
export const RATE_LIMIT_POPUP_MIN_MS = 60_000

export const rateLimitNotice = shallowRef<{ resetAt: number } | null>(null)

export function notifyRateLimit(err: unknown, now = Date.now()): void {
    if (err instanceof AiRateLimitError && err.retryAfterMs != null && err.retryAfterMs >= RATE_LIMIT_POPUP_MIN_MS) {
        rateLimitNotice.value = { resetAt: now + err.retryAfterMs }
    }
}

export function splitWait(ms: number) {
    const total = Math.max(0, Math.ceil(ms / 1000))
    return { hours: Math.floor(total / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 }
}

export function formatWait(ms: number, t: (key: string, params: { n: number }) => string): string {
    const { hours, minutes, seconds } = splitWait(ms)
    const parts: string[] = []
    if (hours) parts.push(t('rlTimeH', { n: hours }))
    if (minutes) parts.push(t('rlTimeM', { n: minutes }))
    if (!hours && (seconds || !minutes)) parts.push(t('rlTimeS', { n: seconds }))
    return parts.join(' ')
}
