import { createI18n } from 'vue-i18n'
import i18nEn from './i18n-en'
import i18nJp from './i18n-jp'
import i18nTw from './i18n-tw'
import i18nZh from './i18n-zh'
import i18nKr from './i18n-kr'
// 写真・画像などの追加文言（JSON）。どこから import しても全言語の文言が揃うよう、ここで統合する
import jsonJp from '../assets/i18n/i18n-jp.json'
import jsonEn from '../assets/i18n/i18n-en.json'
import jsonKr from '../assets/i18n/i18n-kr.json'
import jsonZh from '../assets/i18n/i18n-zh.json'
import jsonTw from '../assets/i18n/i18n-tw.json'

const messages = {
    zh: { ...i18nZh, ...jsonZh },
    jp: { ...i18nJp, ...jsonJp },
    en: { ...i18nEn, ...jsonEn },
    tw: { ...i18nTw, ...jsonTw },
    kr: { ...i18nKr, ...jsonKr }
}

const i18n = createI18n({
    locale: 'jp',
    fallbackLocale: 'en',
    messages,
    warnHtmlInMessage: 'off'
})

export default i18n
