import { describe, it, expect, beforeEach } from 'vitest'
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
    })
})
