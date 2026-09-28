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

    describe('4. Sleep Rhythm Toggle Switch UI Verification (TDD)', () => {
        it('verifies sleep simulation switch has switch-track and switch-thumb', async () => {
            const fs = await import('fs')
            const settingCode = fs.readFileSync('src/views/DialogView/SettingWindow.vue', 'utf-8')
            const sleepRowRegex = /store\.sleepSimulationEnabled[\s\S]*?<\/label>/
            const match = settingCode.match(sleepRowRegex)
            expect(match).not.toBeNull()
            expect(match![0]).toContain('switch-track')
            expect(match![0]).toContain('switch-thumb')
        })
    })

    describe('5. YuzuTalk Feature Removal from Settings (TDD)', () => {
        it('verifies SettingWindow has completely removed yuzutalk theme option', async () => {
            const fs = await import('fs')
            const settingCode = fs.readFileSync('src/views/DialogView/SettingWindow.vue', 'utf-8')
            expect(settingCode).not.toContain('value="yuzutalk"')
            expect(settingCode).not.toContain('yuzutalk')
        })

        it('store enforces momotalk theme and resets yuzutalk if present', () => {
            store.theme = 'yuzutalk' as any
            store.setData()
            expect(store.theme).toBe('momotalk')
        })
    })

    describe('6. Help Button Touch & Visibility Reliability (TDD)', () => {
        it('verifies button.help in App.vue supports both click and touchend events', async () => {
            const fs = await import('fs')
            const appCode = fs.readFileSync('src/App.vue', 'utf-8')
            const helpBtnRegex = /<button[^>]*class="help"[^>]*>/
            const match = appCode.match(helpBtnRegex)
            expect(match).not.toBeNull()
            expect(match![0]).toContain('@click')
            expect(match![0]).toContain('@touchend')
        })

        it('store.openHelpDialog closes setting dialog to avoid modal conflict', () => {
            store.showSettingDialog = true
            store.showHelpDialog = false
            store.openHelpDialog()
            expect(store.showHelpDialog).toBe(true)
            expect(store.showSettingDialog).toBe(false)
        })
    })

    describe('7. AI Auto-Reply Toggle Removal & Always ON Enforcement (TDD)', () => {
        it('verifies SettingWindow does not contain aiEnabled toggle switch', async () => {
            const fs = await import('fs')
            const settingCode = fs.readFileSync('src/views/DialogView/SettingWindow.vue', 'utf-8')
            expect(settingCode).not.toContain('v-model="store.aiEnabled"')
            expect(settingCode).not.toContain('$t(\'aiEnabled\')')
        })

        it('store enforces aiEnabled is always true in setData and getData', () => {
            store.aiEnabled = false
            store.setData()
            expect(store.aiEnabled).toBe(true)
        })
    })

    describe('8. Data Management Tab Complete Removal (TDD)', () => {
        it('verifies SettingWindow completely removes Tab 3 and its features', async () => {
            const fs = await import('fs')
            const settingCode = fs.readFileSync('src/views/DialogView/SettingWindow.vue', 'utf-8')
            expect(settingCode).not.toContain('id="page-3"')
            expect(settingCode).not.toContain('$t(\'sharefile\')')
            expect(settingCode).not.toContain('exportJson')
            expect(settingCode).not.toContain('importJson')
            expect(settingCode).not.toContain('exportCard')
            expect(settingCode).not.toContain('importCard')
        })
    })
})

