import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
    getStudentGreeting,
    buildSystemPrompt,
    isPromptSupported,
    resolveCanonicalStudent,
    STUDENT_CANONICAL_DATA
} from '../assets/ai/prompts'
import { formatChatDate } from '../assets/storeUtils/talkHistory'
import { getApiKeyWarningNotice } from '../assets/chatUtils/send'
import i18nJp from '../locales/i18n-jp'
import i18nKr from '../locales/i18n-kr'
import i18nEn from '../locales/i18n-en'
import i18nZh from '../locales/i18n-zh'
import i18nTw from '../locales/i18n-tw'
import i18n from '../locales/i18n'
import { store, resolveAccessLanguage, normalizeLanguageCode } from '../assets/storeUtils/store'
import { getHelpMarkdown } from '../assets/storeUtils/helpContent'
import type { baseStudent } from '../assets/requestUtils/interface'

describe('Multilingual AI Prompts & UI Localization (TDD)', () => {
    describe('1. Canonical Student Resolution Across Languages', () => {
        it('resolves canonical student data by ID or localized name in kr, en, zh, tw, jp', () => {
            const aruFromJp = resolveCanonicalStudent('陸八魔アル')
            const aruFromShortJp = resolveCanonicalStudent('アル')
            const aruFromKr = resolveCanonicalStudent('아루')
            const aruFromEn = resolveCanonicalStudent('Aru')
            const aruFromZh = resolveCanonicalStudent('陆八魔阿露')
            const aruFromTw = resolveCanonicalStudent('陸八魔阿露')
            const aruFromId = resolveCanonicalStudent(10000)

            expect(aruFromJp?.id).toBe(10000)
            expect(aruFromShortJp?.id).toBe(10000)
            expect(aruFromKr?.id).toBe(10000)
            expect(aruFromEn?.id).toBe(10000)
            expect(aruFromZh?.id).toBe(10000)
            expect(aruFromTw?.id).toBe(10000)
            expect(aruFromId?.id).toBe(10000)
        })

        it('isPromptSupported returns true for Korean, English, and Chinese student names', () => {
            expect(isPromptSupported('아루')).toBe(true)
            expect(isPromptSupported('시로코')).toBe(true)
            expect(isPromptSupported('호시노')).toBe(true)
            expect(isPromptSupported('히나')).toBe(true)
            expect(isPromptSupported('Aru')).toBe(true)
            expect(isPromptSupported('Shiroko')).toBe(true)
            expect(isPromptSupported('阿露')).toBe(true)
            expect(isPromptSupported('白子')).toBe(true)
        })
    })

    describe('2. Multilingual Student Greetings (getStudentGreeting)', () => {
        it('returns authentic Korean greeting when lang is kr', () => {
            const aruGreetingKr = getStudentGreeting('아루', 'kr')
            expect(aruGreetingKr).toContain('흥신소 68')
            expect(aruGreetingKr).toContain('선생님')

            const shirokoGreetingKr = getStudentGreeting('시로코', 'kr')
            expect(shirokoGreetingKr).toContain('응, 선생님')
            expect(shirokoGreetingKr).toContain('달리자')

            const hoshinoGreetingKr = getStudentGreeting('호시노', 'kr')
            expect(hoshinoGreetingKr).toContain('으헤~')
        })

        it('returns authentic English greeting when lang is en', () => {
            const aruGreetingEn = getStudentGreeting('Aru', 'en')
            expect(aruGreetingEn).toContain('Problem Solver 68')
            expect(aruGreetingEn).toContain('Sensei')

            const shirokoGreetingEn = getStudentGreeting('Shiroko', 'en')
            expect(shirokoGreetingEn).toContain('Sensei')
            expect(shirokoGreetingEn).toContain('run')
        })

        it('returns authentic Chinese greeting when lang is zh or tw', () => {
            const aruGreetingZh = getStudentGreeting('阿露', 'zh')
            expect(aruGreetingZh).toContain('便利屋68')
            expect(aruGreetingZh).toContain('老师')

            const aruGreetingTw = getStudentGreeting('阿露', 'tw')
            expect(aruGreetingTw).toContain('便利屋68')
            expect(aruGreetingTw).toContain('老師')
        })

        it('defaults to Japanese greeting when lang is jp or unspecified', () => {
            const aruGreetingJp = getStudentGreeting('アル', 'jp')
            expect(aruGreetingJp).toContain('便利屋68')
            expect(aruGreetingJp).toContain('先生')
        })
    })

    describe('3. Multilingual System Prompt Generation (buildSystemPrompt)', () => {
        const aruStudent: baseStudent = { Id: 10000, Name: '아루', Avatar: 'aru.webp' }

        it('injects strict Korean language directive when lang is kr', () => {
            const promptKr = buildSystemPrompt(aruStudent, 'kr')
            expect(promptKr).toContain('KOREAN')
            expect(promptKr).toContain('선생님')
            expect(promptKr).toContain('한국어')
            expect(promptKr).not.toContain('*lang:ja')
            expect(promptKr).not.toContain('*Reply in Japanese')
        })

        it('injects strict English language directive when lang is en', () => {
            const promptEn = buildSystemPrompt(aruStudent, 'en')
            expect(promptEn).toContain('ENGLISH')
            expect(promptEn).toContain('Sensei')
            expect(promptEn).not.toContain('*lang:ja')
        })

        it('injects strict Chinese language directive when lang is zh or tw', () => {
            const promptZh = buildSystemPrompt(aruStudent, 'zh')
            expect(promptZh).toContain('简体中文')
            expect(promptZh).toContain('老师')

            const promptTw = buildSystemPrompt(aruStudent, 'tw')
            expect(promptTw).toContain('繁體中文')
            expect(promptTw).toContain('老師')
        })

        it('keeps Japanese directives when lang is jp', () => {
            const aruJpStudent: baseStudent = { Id: 10000, Name: 'アル', Avatar: 'aru.webp' }
            const promptJp = buildSystemPrompt(aruJpStudent, 'jp')
            expect(promptJp).toContain('先生')
        })
    })

    describe('4. Multilingual Chat Date Formatting (formatChatDate)', () => {
        // Monday, Sept 28, 2026 12:00:00
        const testTimestamp = new Date(2026, 8, 28, 12, 0, 0).getTime()

        it('formats chat date in Korean for kr', () => {
            const dateKr = formatChatDate(testTimestamp, 'kr')
            expect(dateKr).toBe('2026년 9월 28일 (월)')
        })

        it('formats chat date in English for en', () => {
            const dateEn = formatChatDate(testTimestamp, 'en')
            expect(dateEn).toBe('September 28, 2026 (Mon)')
        })

        it('formats chat date in Chinese for zh and tw', () => {
            const dateZh = formatChatDate(testTimestamp, 'zh')
            expect(dateZh).toBe('2026年9月28日 (一)')
            const dateTw = formatChatDate(testTimestamp, 'tw')
            expect(dateTw).toBe('2026年9月28日 (一)')
        })

        it('formats chat date in Japanese for jp', () => {
            const dateJp = formatChatDate(testTimestamp, 'jp')
            expect(dateJp).toBe('2026年9月28日 (月)')
        })
    })

    describe('5. Unconfigured API Key Warning Localization (getApiKeyWarningNotice)', () => {
        it('returns localized API key warning notice according to current language', () => {
            const noticeKr = getApiKeyWarningNotice('kr')
            expect(noticeKr).toContain('API 키가 설정되지 않았습니다')
            expect(noticeKr).toContain('https://console.groq.com/keys')

            const noticeEn = getApiKeyWarningNotice('en')
            expect(noticeEn).toContain('API Key is not configured')

            const noticeZh = getApiKeyWarningNotice('zh')
            expect(noticeZh).toContain('API密钥尚未设置')

            const noticeTw = getApiKeyWarningNotice('tw')
            expect(noticeTw).toContain('API金鑰尚未設定')

            const noticeJp = getApiKeyWarningNotice('jp')
            expect(noticeJp).toContain('APIキーが未設定です')
        })
    })

    describe('6. Localization i18n Keys Across All 5 Languages', () => {
        const locales = [
            { code: 'jp', data: i18nJp },
            { code: 'kr', data: i18nKr },
            { code: 'en', data: i18nEn },
            { code: 'zh', data: i18nZh },
            { code: 'tw', data: i18nTw }
        ]

        it('all locale files contain required chat UI localization keys', () => {
            for (const { code, data } of locales) {
                expect(data.talkWith, `talkWith missing in ${code}`).toBeDefined()
                expect(data.chatInputPlaceholder, `chatInputPlaceholder missing in ${code}`).toBeDefined()
                expect(data.apiKeyNotConfiguredNotice, `apiKeyNotConfiguredNotice missing in ${code}`).toBeDefined()
                expect(data.imageMessagePlaceholder, `imageMessagePlaceholder missing in ${code}`).toBeDefined()
            }
        })

        it('all locale files contain settings modal and AI tab localization keys', () => {
            const requiredSettingsKeys = [
                'apiKeyPlaceholderGroq',
                'apiKeyPlaceholder',
                'groqKeyNoticePrefix',
                'groqKeyNoticeSuffix',
                'geminiKeyNoticePrefix',
                'geminiKeyNoticeSuffix',
                'modelLabel',
                'modelPlaceholderGroq',
                'modelPlaceholderGemini',
                'modelPlaceholderOpenai',
                'modelChipTop120b',
                'modelChipTop120bTitle',
                'modelChipStd27b',
                'modelChipStd27bTitle',
                'modelChipGeminiPro',
                'modelChipGeminiLite',
                'customBaseUrlLabel',
                'filterPromptSupportedOnly',
                'filterAllStudents',
                'back',
                'kizunaRankTitle',
                'removeImage',
                'sendSticker',
                'sendImage'
            ]
            for (const { code, data } of locales) {
                for (const key of requiredSettingsKeys) {
                    expect((data as any)[key], `Key "${key}" missing in locale "${code}"`).toBeDefined()
                }
            }
        })

        it('help guide in all locales contains credits, original repo attribution, vibe coding, and copyright disclaimers', () => {
            for (const { code, data } of locales) {
                const helpText = data.help
                expect(helpText, `help missing in ${code}`).toBeDefined()
                // Must attribute original repository
                expect(helpText).toContain('U1805/momotalk')
                // Must attribute copyright holders
                expect(helpText).toContain('NEXON Games')
                expect(helpText).toContain('Yostar')
                // Must mention vibe coding
                expect(helpText.toLowerCase()).toMatch(/vibe coding|バイブコーディング|바이브 코딩/)
            }
        })
    })

    describe('5. Automatic Language Resolution from Access Destination & Locale (TDD)', () => {
        beforeEach(() => {
            localStorage.clear()
        })

        afterEach(() => {
            store.language = 'jp'
            i18n.global.locale = 'jp' as any
            localStorage.clear()
        })

        it('normalizes language codes accurately', () => {
            expect(normalizeLanguageCode('en')).toBe('en')
            expect(normalizeLanguageCode('en-US')).toBe('en')
            expect(normalizeLanguageCode('ja')).toBe('jp')
            expect(normalizeLanguageCode('jp')).toBe('jp')
            expect(normalizeLanguageCode('ja-JP')).toBe('jp')
            expect(normalizeLanguageCode('ko')).toBe('kr')
            expect(normalizeLanguageCode('kr')).toBe('kr')
            expect(normalizeLanguageCode('ko-KR')).toBe('kr')
            expect(normalizeLanguageCode('zh-CN')).toBe('zh')
            expect(normalizeLanguageCode('zh')).toBe('zh')
            expect(normalizeLanguageCode('zh-TW')).toBe('tw')
            expect(normalizeLanguageCode('zh-HK')).toBe('tw')
            expect(normalizeLanguageCode('tw')).toBe('tw')
            expect(normalizeLanguageCode('unknown')).toBe(null)
        })

        it('resolves language with highest priority given to URL query parameters (?lang, ?lng, ?locale)', () => {
            // URL parameter takes precedence over storedLang and browser locale
            expect(resolveAccessLanguage({ urlSearch: '?lang=kr', storedLang: '"en"', navigatorLang: 'ja-JP' })).toBe('kr')
            expect(resolveAccessLanguage({ urlSearch: '?lng=en', storedLang: '"jp"' })).toBe('en')
            expect(resolveAccessLanguage({ urlSearch: '?locale=zh-TW', storedLang: '"zh"' })).toBe('tw')
            expect(resolveAccessLanguage({ urlSearch: '?language=zh-CN' })).toBe('zh')
            expect(resolveAccessLanguage({ urlSearch: '?lang=ja' })).toBe('jp')
        })

        it('falls back to stored language when no URL parameter is provided', () => {
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: '"kr"', navigatorLang: 'ja-JP' })).toBe('kr')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: 'en', navigatorLang: 'ko-KR' })).toBe('en')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: '"tw"', navigatorLang: 'en-US' })).toBe('tw')
        })

        it('detects from browser navigator.language when neither URL param nor stored language exists', () => {
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'ko-KR' })).toBe('kr')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'en-US' })).toBe('en')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'zh-TW' })).toBe('tw')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'zh-CN' })).toBe('zh')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'ja-JP' })).toBe('jp')
            expect(resolveAccessLanguage({ urlSearch: '', storedLang: null, navigatorLang: 'fr-FR' })).toBe('jp')
        })

        it('store.getData automatically applies detected language from access destination', () => {
            // If accessed with ?lang=en and no previous storage
            store.getData({ urlSearch: '?lang=en', navigatorLang: 'ja-JP' })
            expect(store.language).toBe('en')

            // If accessed with ?lng=kr
            store.getData({ urlSearch: '?lng=kr' })
            expect(store.language).toBe('kr')
        })
    })

    describe('6. Automatic API Key Setup Dialog Prompt on Access (TDD)', () => {
        beforeEach(() => {
            localStorage.clear()
            store.showSettingDialog = false
            store.settingDialogPage = 1
        })

        it('checkAndPromptApiKey returns true and opens dialog to API settings page (page 2) when apiKey is empty', () => {
            store.aiApiKey = ''
            const prompted = store.checkAndPromptApiKey()
            expect(prompted).toBe(true)
            expect(store.showSettingDialog).toBe(true)
            expect(store.settingDialogPage).toBe(2)
        })

        it('checkAndPromptApiKey opens dialog when apiKey contains only whitespace', () => {
            store.aiApiKey = '   '
            const prompted = store.checkAndPromptApiKey()
            expect(prompted).toBe(true)
            expect(store.showSettingDialog).toBe(true)
            expect(store.settingDialogPage).toBe(2)
        })

        it('checkAndPromptApiKey opens dialog when apiKey is an old Gemini key (starts with AIzaSy)', () => {
            store.aiApiKey = 'AIzaSyTestKey'
            const prompted = store.checkAndPromptApiKey()
            expect(prompted).toBe(true)
            expect(store.showSettingDialog).toBe(true)
            expect(store.settingDialogPage).toBe(2)
        })

        it('checkAndPromptApiKey returns false and does not open dialog when valid apiKey exists', () => {
            store.aiApiKey = 'gsk_valid_api_key_12345'
            store.showSettingDialog = false
            store.settingDialogPage = 1
            const prompted = store.checkAndPromptApiKey()
            expect(prompted).toBe(false)
            expect(store.showSettingDialog).toBe(false)
            expect(store.settingDialogPage).toBe(1)
        })

        it('store.getData() automatically triggers API setup prompt on fresh access without API key', () => {
            store.getData()
            expect(store.showSettingDialog).toBe(true)
            expect(store.settingDialogPage).toBe(2)
        })

        it('store.getData() does not open setting dialog when API key is already configured in localStorage', () => {
            localStorage.setItem('ai-api-key', JSON.stringify('gsk_existing_key'))
            store.getData()
            expect(store.showSettingDialog).toBe(false)
            expect(store.aiApiKey).toBe('gsk_existing_key')
        })
    })

    describe('7. Help Dialog & Application Guide Display (//loop //tdd)', () => {
        beforeEach(() => {
            store.showHelpDialog = false
        })

        it('has showHelpDialog boolean defaulting to false', () => {
            expect(store.showHelpDialog).toBe(false)
        })

        it('store.openHelpDialog() sets showHelpDialog to true', () => {
            expect(store.showHelpDialog).toBe(false)
            store.openHelpDialog()
            expect(store.showHelpDialog).toBe(true)
        })

        it('store.closeHelpDialog() sets showHelpDialog to false', () => {
            store.showHelpDialog = true
            store.closeHelpDialog()
            expect(store.showHelpDialog).toBe(false)
        })

        it('helpTitle is translated across all 5 supported locales', () => {
            const locales = [
                { code: 'jp', data: i18nJp },
                { code: 'kr', data: i18nKr },
                { code: 'en', data: i18nEn },
                { code: 'zh', data: i18nZh },
                { code: 'tw', data: i18nTw }
            ]
            for (const { code, data } of locales) {
                const title = (data as any).helpTitle
                expect(title, `helpTitle missing in ${code}`).toBeDefined()
                expect(typeof title).toBe('string')
                expect(title.length).toBeGreaterThan(0)
            }
        })
    })

    describe('8. Safe Help Markdown Delivery without Compiler Crashes (TDD)', () => {
        it('getHelpMarkdown returns markdown for all supported languages', () => {
            const langs = ['jp', 'kr', 'en', 'zh', 'tw'] as const
            for (const lang of langs) {
                const md = getHelpMarkdown(lang)
                expect(md).toBeDefined()
                expect(typeof md).toBe('string')
                expect(md.length).toBeGreaterThan(50)
            }
        })

        it('help markdown contains no raw @ mentions that crash vue-i18n compiler', () => {
            const langs = ['jp', 'kr', 'en', 'zh', 'tw'] as const
            for (const lang of langs) {
                const md = getHelpMarkdown(lang)
                // vue-i18n linked message syntax error trigger is @ followed by identifier
                expect(md).not.toMatch(/@[A-Za-z0-9_-]+/)
            }
        })
    })
})

