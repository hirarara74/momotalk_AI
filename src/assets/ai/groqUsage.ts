import { shallowRef } from 'vue'

export function parseResetDuration(value: string | null): number | null {
    if (!value || !/^(?:\d+(?:\.\d+)?(?:ms|s|m|h|d))+$/.test(value)) return null
    const units: Record<string, number> = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }
    const duration = [...value.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h|d)/g)]
        .reduce((sum, match) => sum + Number(match[1]) * units[match[2]], 0)
    return Number.isFinite(duration) ? duration : null
}

export function readGroqTokenLimit(headers: Headers, now = Date.now()) {
    const limitText = headers.get('x-ratelimit-limit-tokens')
    const remainingText = headers.get('x-ratelimit-remaining-tokens')
    if (!limitText?.trim() || !remainingText?.trim()) return null
    const limit = Number(limitText)
    const remaining = Number(remainingText)
    if (!Number.isFinite(limit) || limit <= 0 || !Number.isFinite(remaining) || remaining < 0 || remaining > limit) return null
    const duration = parseResetDuration(headers.get('x-ratelimit-reset-tokens'))
    return { limit, remaining, used: limit - remaining, observedAt: now, resetAt: duration === null ? null : now + duration }
}

// Keep credentials and snapshots in memory only; never serialize them with settings.
export const groqUsage = shallowRef<{
    apiKey: string; baseUrl: string; model: string;
    tokens: ReturnType<typeof readGroqTokenLimit>
} | null>(null)

export function recordGroqUsage(headers: Headers | undefined, apiKey: string, baseUrl: string, model: string) {
    groqUsage.value = { apiKey, baseUrl, model, tokens: headers ? readGroqTokenLimit(headers) : null }
}
