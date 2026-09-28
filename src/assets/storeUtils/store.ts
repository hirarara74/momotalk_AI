import { reactive } from 'vue'
import i18n from '@/locales/i18n'
import { talkHistory } from './talkHistory'
import { selectList } from './selectList'

export const store = reactive({
    language: 'jp',
    theme: 'momotalk',
    fullScreen: false,
    zoom: 1,
    draggable: typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1151px)').matches : true,

    typing: 0,
    text: '',
    insertId: -1,
    showPlayerDialog: false,
    showSettingDialog: false,
    settingDialogPage: 1,
    showHelpDialog: false,
    storyKey: '10005',
    storyList: {} as Record<string, string[]>,
    storyFile: '1000501',

    // AI Chat Extension Settings
    aiEnabled: true,
    aiProvider: 'groq' as 'gemini' | 'openai' | 'claude' | 'groq',
    aiApiKey: '',
    aiModel: 'qwen/qwen3.8-27b',
    aiBaseUrl: 'https://api.groq.com/openai/v1',
    isAiResponding: false,
    currentChatStudent: null as any,
    studentRanks: {} as Record<number, number>,
    soundEnabled: true,
    soundVolume: 0.7,
    sleepSimulationEnabled: true,

    openSettingDialog(page: number = 1) {
        this.settingDialogPage = page
        this.showSettingDialog = true
    },

    openHelpDialog() {
        this.showHelpDialog = true
    },

    closeHelpDialog() {
        this.showHelpDialog = false
    },

    checkAndPromptApiKey(): boolean {
        const hasKey = !!(this.aiApiKey && this.aiApiKey.trim() !== '' && !this.aiApiKey.startsWith('AIzaSy'))
        if (!hasKey) {
            this.showSettingDialog = true
            this.settingDialogPage = 2
            return true
        }
        return false
    },

    getRelationshipRank(studentId: number): number {
        return (this.studentRanks && this.studentRanks[studentId]) || 1
    },
    increaseRelationshipRank(studentId: number): number {
        if (!this.studentRanks) this.studentRanks = {}
        this.studentRanks[studentId] = (this.studentRanks[studentId] || 1) + 1
        localStorage.setItem('student-ranks', JSON.stringify(this.studentRanks))
        return this.studentRanks[studentId]
    },

    setData() {
        talkHistory.setData()
        selectList.setData()
        localStorage.setItem('language', JSON.stringify(this.language))
        localStorage.setItem('render-theme', JSON.stringify(this.theme))
        localStorage.setItem('draggable', JSON.stringify(this.draggable))
        localStorage.setItem('full-screen', JSON.stringify(this.fullScreen))
        localStorage.setItem('zoom', JSON.stringify(this.zoom))
        localStorage.setItem('sound-enabled', JSON.stringify(this.soundEnabled))
        localStorage.setItem('sound-volume', JSON.stringify(this.soundVolume))
        localStorage.setItem('sleep-simulation-enabled', JSON.stringify(this.sleepSimulationEnabled))
        localStorage.setItem('ai-enabled', JSON.stringify(this.aiEnabled))
        localStorage.setItem('ai-provider', JSON.stringify(this.aiProvider))
        localStorage.setItem('ai-api-key', JSON.stringify(this.aiApiKey))
        localStorage.setItem('ai-model', JSON.stringify(this.aiModel))
        localStorage.setItem('ai-base-url', JSON.stringify(this.aiBaseUrl))
        localStorage.setItem('student-ranks', JSON.stringify(this.studentRanks))
    },
    getData(options?: { urlSearch?: string, navigatorLang?: string }) {
        talkHistory.getData()
        selectList.getData()
        const data = ['language', 'render-theme', 'draggable', 'full-screen', 'zoom', 'ai-enabled', 'ai-provider', 'ai-api-key', 'ai-model', 'ai-base-url']
            .map((x) => localStorage.getItem(x))

        // Automatic language resolution from access destination, saved preference, or browser environment
        this.language = resolveAccessLanguage({
            urlSearch: options?.urlSearch,
            navigatorLang: options?.navigatorLang,
            storedLang: data[0]
        })
        i18n.global.locale = this.language as any
        localStorage.setItem('language', JSON.stringify(this.language))

        this.theme     = data[1] != null ? JSON.parse(data[1]) : 'momotalk'
        this.draggable = data[2] != null ? JSON.parse(data[2]) : (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1151px)').matches : true)
        this.fullScreen = data[3] != null ? JSON.parse(data[3]) : false
        this.zoom      = data[4] != null ? JSON.parse(data[4]) : 1
        this.aiEnabled = data[5] != null ? JSON.parse(data[5]) : true
        const defaultKey = ''
        const parsedProvider = data[6] != null ? JSON.parse(data[6]) : 'groq'
        const parsedApiKey = data[7] != null ? JSON.parse(data[7]) : defaultKey
        const parsedModel = data[8] != null ? JSON.parse(data[8]) : 'qwen/qwen3.8-27b'
        const parsedBaseUrl = data[9] != null ? JSON.parse(data[9]) : 'https://api.groq.com/openai/v1'

        // Migration to Groq: if previously on gemini, or if using default/old Gemini key
        if (parsedProvider === 'gemini' || !parsedProvider) {
            this.aiProvider = 'groq'
            this.aiApiKey = parsedApiKey && !parsedApiKey.startsWith('AIzaSy') ? parsedApiKey : defaultKey
            this.aiModel = 'qwen/qwen3.8-27b'
            this.aiBaseUrl = 'https://api.groq.com/openai/v1'
            localStorage.setItem('ai-provider', JSON.stringify('groq'))
            localStorage.setItem('ai-api-key', JSON.stringify(this.aiApiKey))
            localStorage.setItem('ai-model', JSON.stringify(this.aiModel))
            localStorage.setItem('ai-base-url', JSON.stringify(this.aiBaseUrl))
        } else {
            this.aiProvider = parsedProvider
            if (this.aiProvider === 'groq' && (!parsedApiKey || parsedApiKey.startsWith('AIzaSy'))) {
                this.aiApiKey = defaultKey
                localStorage.setItem('ai-api-key', JSON.stringify(this.aiApiKey))
            } else {
                this.aiApiKey = parsedApiKey
            }
            this.aiModel = parsedModel || (this.aiProvider === 'groq' ? 'qwen/qwen3.8-27b' : '')
            this.aiBaseUrl = parsedBaseUrl || (this.aiProvider === 'groq' ? 'https://api.groq.com/openai/v1' : '')
        }
        const soundEnabledData = localStorage.getItem('sound-enabled')
        if (soundEnabledData != null) {
            try { this.soundEnabled = JSON.parse(soundEnabledData) } catch {}
        }
        const soundVolumeData = localStorage.getItem('sound-volume')
        if (soundVolumeData != null) {
            try { this.soundVolume = JSON.parse(soundVolumeData) } catch {}
        }
        const sleepSimData = localStorage.getItem('sleep-simulation-enabled')
        if (sleepSimData != null) {
            try { this.sleepSimulationEnabled = JSON.parse(sleepSimData) } catch {}
        }
        const savedRanks = localStorage.getItem('student-ranks')
        if (savedRanks != null) {
            try { this.studentRanks = JSON.parse(savedRanks) } catch {}
        }

        // Automatic API key check: if not configured, prompt API settings dialog immediately
        this.checkAndPromptApiKey()
    },
    resetData() {
        talkHistory.resetData()
        selectList.resetData()
        this.setData()
    }
})

export function normalizeLanguageCode(code: string): 'zh' | 'tw' | 'jp' | 'kr' | 'en' | null {
    if (!code) return null
    const lower = code.toLowerCase().trim()
    if (lower === 'jp' || lower === 'ja' || lower.startsWith('ja-') || lower.startsWith('ja_')) return 'jp'
    if (lower === 'kr' || lower === 'ko' || lower.startsWith('ko-') || lower.startsWith('ko_')) return 'kr'
    if (lower === 'en' || lower.startsWith('en-') || lower.startsWith('en_')) return 'en'
    if (
        lower === 'tw' ||
        lower.startsWith('zh-tw') ||
        lower.startsWith('zh-hk') ||
        lower.startsWith('zh-mo') ||
        lower.startsWith('zh-hant') ||
        lower.startsWith('zh_tw') ||
        lower.startsWith('zh_hk') ||
        lower.startsWith('zh_hant')
    ) return 'tw'
    if (
        lower === 'zh' ||
        lower.startsWith('zh-cn') ||
        lower.startsWith('zh-sg') ||
        lower.startsWith('zh-hans') ||
        lower.startsWith('zh_cn') ||
        lower.startsWith('zh_hans')
    ) return 'zh'
    return null
}

export function resolveAccessLanguage(options?: {
    urlSearch?: string
    navigatorLang?: string
    storedLang?: string | null
}): 'zh' | 'tw' | 'jp' | 'kr' | 'en' {
    // 1. URL search parameter (?lang=, ?lng=, ?locale=, ?language=)
    let urlQuery = options?.urlSearch
    if (urlQuery === undefined && typeof window !== 'undefined' && window.location && window.location.search) {
        urlQuery = window.location.search
    }
    if (urlQuery) {
        const params = new URLSearchParams(urlQuery)
        const raw = params.get('lang') || params.get('lng') || params.get('locale') || params.get('language')
        if (raw) {
            const normalized = normalizeLanguageCode(raw)
            if (normalized) return normalized
        }
    }

    // 2. Previously stored language in localStorage
    const stored = options?.storedLang !== undefined ? options.storedLang : (typeof localStorage !== 'undefined' ? localStorage.getItem('language') : null)
    if (stored) {
        try {
            const parsed = (typeof stored === 'string' && stored.startsWith('"')) ? JSON.parse(stored) : stored
            const normalized = normalizeLanguageCode(parsed)
            if (normalized) return normalized
        } catch {
            const normalized = normalizeLanguageCode(stored)
            if (normalized) return normalized
        }
    }

    // 3. Browser locale / access location environment (navigator.language)
    const nav = options?.navigatorLang !== undefined ? options.navigatorLang : (typeof navigator !== 'undefined' ? navigator.language : '')
    if (nav) {
        const normalized = normalizeLanguageCode(nav)
        if (normalized) return normalized
    }

    // Default fallback
    return 'jp'
}
