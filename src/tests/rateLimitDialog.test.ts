import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import RateLimitWindow from '../views/DialogView/RateLimitWindow.vue'
import { AiRateLimitError, notifyRateLimit, rateLimitNotice } from '../assets/ai/rateLimit'
import { formatAiErrorMessage } from '../assets/chatUtils/send'
import i18n from '../locales/i18n'

let app: App
let host: HTMLDivElement

beforeEach(async () => {
    i18n.global.locale = 'jp' as any
    rateLimitNotice.value = null
    host = document.createElement('div')
    document.body.append(host)
    app = createApp(RateLimitWindow)
    app.use(i18n).mount(host)
    await nextTick()
})
afterEach(() => { app.unmount(); host.remove(); rateLimitNotice.value = null })

describe('rate limit popup', () => {
    it('shows the recovery time with the chat message when the quota is exhausted', async () => {
        const err = new AiRateLimitError('Groq (429)', 7 * 60000 + 12000)
        expect(formatAiErrorMessage(err)).toContain('7分 12秒')
        expect(host.textContent).not.toContain('AIが一時的に使えません')
        notifyRateLimit(err)
        await nextTick()
        expect(host.textContent).toContain('AIが一時的に使えません')
        expect(host.textContent).toMatch(/再開まで: 7分 \d+秒/)
        host.querySelector<HTMLButtonElement>('.rate-limit-ok')!.click()
        expect(rateLimitNotice.value).toBeNull()
    })

    it('keeps the plain message and no popup for a short throttle or unknown time', async () => {
        notifyRateLimit(new AiRateLimitError('Groq (429)', null))
        await nextTick()
        expect(host.textContent).not.toContain('AIが一時的に使えません')
        expect(formatAiErrorMessage(new AiRateLimitError('429', null))).toContain('レートリミット')
    })
})
