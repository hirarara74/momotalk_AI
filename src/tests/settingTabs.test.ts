import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import SettingWindow from '../views/DialogView/SettingWindow.vue'
import { store } from '../assets/storeUtils/store'
import i18n from '../locales/i18n'

// 設定画面のタブと各ページが混ざらないための検証。
// 過去に「写真・画像」タブだけが<button>で作られて見た目が崩れたり、
// ページの中身が別のページに混ざったりしたため、構造とページ内容の両方を見る。
let app: App
let host: HTMLDivElement
const t = (key: string) => String(i18n.global.t(key))

async function mount() {
    store.showSettingDialog = true
    store.settingDialogPage = 1
    host = document.createElement('div')
    document.body.append(host)
    app = createApp(SettingWindow)
    app.use(i18n).mount(host)
    await nextTick()
}

beforeEach(() => {
    localStorage.clear()
    i18n.global.locale = 'jp' as any
})
afterEach(() => {
    app?.unmount()
    host?.remove()
})

describe('設定画面のタブ構造', () => {
    it('タブは全て同じ<li class="page-btn">で、<button>などを混ぜない', async () => {
        await mount()
        const items = [...host.querySelectorAll('.popper-content__tabs > li')]
        const tabs = items.filter((li) => !li.classList.contains('divider'))
        expect(tabs).toHaveLength(3)
        for (const tab of tabs) {
            expect(tab.classList.contains('page-btn')).toBe(true)
            expect(tab.querySelector('button, a, input')).toBeNull()
        }
        // タブと区切り（/）が交互に並ぶ
        expect(items.map((li) => li.classList.contains('divider'))).toEqual([false, true, false, true, false])
    })

    it('タブの数とページの数が一致し、クリックで対応するページに切り替わる', async () => {
        await mount()
        const tabs = [...host.querySelectorAll<HTMLElement>('.popper-content__tabs > li.page-btn')]
        const pages = host.querySelectorAll('.featured > .page')
        expect(pages).toHaveLength(tabs.length)
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].click()
            await nextTick()
            expect(store.settingDialogPage).toBe(i + 1)
            expect(tabs.map((tab) => tab.classList.contains('active'))).toEqual(tabs.map((_, j) => j === i))
        }
    })
})

describe('設定ページの内容が混ざらない', () => {
    it('基本設定・AI設定・写真画像の項目は、それぞれ自分のページにだけある', async () => {
        await mount()
        const [basic, ai, image] = [...host.querySelectorAll<HTMLElement>('.featured > .page')].map((p) => p.textContent || '')
        // 基本設定
        expect(basic).toContain(t('zoom'))
        expect(ai).not.toContain(t('zoom'))
        expect(image).not.toContain(t('zoom'))
        // AI設定
        expect(ai).toContain(t('aiProvider'))
        expect(basic).not.toContain(t('aiProvider'))
        expect(image).not.toContain(t('aiProvider'))
        // 写真・画像
        expect(image).toContain(t('imageGenEnabled'))
        expect(basic).not.toContain(t('imageGenEnabled'))
        expect(ai).not.toContain(t('imageGenEnabled'))
    })

    it('3つ目のタブの名前は「写真・画像」', async () => {
        await mount()
        const tabs = [...host.querySelectorAll('.popper-content__tabs > li.page-btn')]
        expect(tabs[2].textContent?.trim()).toBe(t('imageGenSetting') + 'β')
        expect(t('imageGenSetting')).toBe('写真・画像')
    })
})

describe('写真・画像はβ版で、初期状態ではオフ', () => {
    it('タブと設定ページにβ版（テスト中）の表記がある', async () => {
        await mount()
        const tab = host.querySelector('.popper-content__tabs > li:last-child')!
        expect(tab.querySelector('.beta-badge')?.textContent).toBe('β')
        expect(tab.querySelector('.beta-badge')?.getAttribute('title')).toBe(t('imageGenBetaBadge'))
        const notice = host.querySelectorAll('.featured > .page')[2].querySelector('.beta-notice')
        expect(notice?.textContent).toContain(t('imageGenBetaNotice'))
        // 他のページには出さない
        expect(host.querySelectorAll('.featured > .page')[0].querySelector('.beta-notice')).toBeNull()
        expect(host.querySelectorAll('.featured > .page')[1].querySelector('.beta-notice')).toBeNull()
    })

    it('5言語すべてにβ版の文言があり、「β」「Beta」「베타」「测试」「測試」のいずれかを含む', async () => {
        for (const lang of ['jp', 'en', 'kr', 'zh', 'tw']) {
            const badge = String((i18n.global as any).t('imageGenBetaBadge', {}, { locale: lang }))
            expect(badge).toMatch(/β|Beta|베타|测试|測試/)
            expect(String((i18n.global as any).t('imageGenBetaNotice', {}, { locale: lang })).length).toBeGreaterThan(20)
        }
    })

    it('初期状態では写真生成はオフ', () => {
        localStorage.clear()
        store.getData()
        expect(store.imageGenEnabled).toBe(false)
    })

    it('以前オンで保存されていた設定は一度だけオフに戻し、その後の選択は保持する', () => {
        localStorage.clear()
        localStorage.setItem('image-gen-enabled', JSON.stringify(true)) // 旧バージョンの初期値で保存されていた
        store.getData()
        expect(store.imageGenEnabled).toBe(false)
        // 利用者が自分でオンにした場合は、次回以降も保持される
        store.imageGenEnabled = true
        store.setData()
        store.imageGenEnabled = false
        store.getData()
        expect(store.imageGenEnabled).toBe(true)
    })

    it('リセットするとオフに戻る', () => {
        store.imageGenEnabled = true
        store.resetData()
        expect(store.imageGenEnabled).toBe(false)
    })
})
