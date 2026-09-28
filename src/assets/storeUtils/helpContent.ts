import i18nJp from '@/locales/i18n-jp'
import i18nKr from '@/locales/i18n-kr'
import i18nEn from '@/locales/i18n-en'
import i18nZh from '@/locales/i18n-zh'
import i18nTw from '@/locales/i18n-tw'

const HELP_MAP: Record<string, string> = {
    jp: i18nJp.help,
    kr: i18nKr.help,
    en: i18nEn.help,
    zh: i18nZh.help,
    tw: i18nTw.help
}

/**
 * Returns sanitized markdown text for MomoTalk AI guide.
 * Avoids passing large markdown strings through vue-i18n compiler,
 * preventing SyntaxError: 10 caused by @ mentions or special characters.
 */
export function getHelpMarkdown(lang: string = 'jp'): string {
    const raw = HELP_MAP[lang] || HELP_MAP['jp'] || ''
    return raw.replace(/@U1805/g, 'U1805')
}
