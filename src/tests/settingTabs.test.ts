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
        expect(tabs[2].textContent?.trim()).toBe(t('imageGenSetting'))
        expect(t('imageGenSetting')).toBe('写真・画像')
    })
})
