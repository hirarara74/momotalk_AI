import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '../assets/storeUtils/store'
import {
    hasConfiguredApiKey,
    getApiKeySecurityNotice,
    resolveAppBaseUrl
} from '../assets/utils/webAppUtils'

describe('Web App Public Deployment & API Key Safety (TDD)', () => {
    beforeEach(() => {
        store.aiApiKey = ''
        localStorage.clear()
    })

    describe('1. API Key Configuration & Safety Check', () => {
        it('returns false when no API key is set in store or localStorage', () => {
            expect(hasConfiguredApiKey()).toBe(false)
        })

        it('returns true when a valid user API key is configured', () => {
            store.aiApiKey = 'gsk_test_user_key_123'
            expect(hasConfiguredApiKey()).toBe(true)
        })

        it('returns false if key contains only whitespace or legacy invalid format', () => {
            store.aiApiKey = '   '
            expect(hasConfiguredApiKey()).toBe(false)
        })

        it('provides a security notice reassuring users about client-side storage', () => {
            const notice = getApiKeySecurityNotice('jp')
            expect(notice).toContain('localStorage')
            expect(notice).toContain('安全')
            expect(notice).toContain('外部サーバー')
        })

        it('provides multilingual security notices for en, kr, zh', () => {
            const noticeEn = getApiKeySecurityNotice('en')
            expect(noticeEn).toContain('locally')
            expect(noticeEn).toContain('browser')

            const noticeKr = getApiKeySecurityNotice('kr')
            expect(noticeKr).toContain('안전')

            const noticeZh = getApiKeySecurityNotice('zh')
            expect(noticeZh).toContain('本地')
        })
    })

    describe('2. Web Base URL Resolution for GitHub Pages & Hosting', () => {
        it('resolves base to /momotalk_AI/ when GITHUB_REPOSITORY is hirarara74/momotalk_AI', () => {
            const base = resolveAppBaseUrl({
                GITHUB_REPOSITORY: 'hirarara74/momotalk_AI',
                NODE_ENV: 'production'
            })
            expect(base).toBe('/momotalk_AI/')
        })

        it('falls back to /momotalk/ when running locally or in development', () => {
            const base = resolveAppBaseUrl({
                NODE_ENV: 'development'
            })
            expect(base).toBe('/momotalk/')
        })

        it('respects custom VITE_BASE environment override if provided', () => {
            const base = resolveAppBaseUrl({
                VITE_BASE: '/custom-momo/'
            })
            expect(base).toBe('/custom-momo/')
        })
    })

    describe('3. Deprecated Chat Download Feature Removal (TDD)', () => {
        it('verifies download feature removal from UI', async () => {
            const fs = await import('fs')
            const appCode = fs.readFileSync('src/App.vue', 'utf-8')
            expect(appCode).not.toContain('handleDownload')
            expect(appCode).not.toContain('DownloadIcon')
        })
    })
})
