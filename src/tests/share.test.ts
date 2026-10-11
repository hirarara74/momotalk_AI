import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import fs from 'fs'
import { getShareIntentUrl, getShareUrl, shareApp } from '../assets/utils/share'
import SettingWindow from '../views/DialogView/SettingWindow.vue'
import { store } from '../assets/storeUtils/store'
import i18n from '../locales/i18n'

const t = (key: string) => String(i18n.global.t(key))
const nav = navigator as any

describe('共有（Web Share API。使えない環境では X の投稿画面）', () => {
    const originalShare = nav.share
    const originalCanShare = nav.canShare
    beforeEach(() => {
        i18n.global.locale = 'jp' as any
        vi.spyOn(window, 'open').mockImplementation(() => null)
    })
    afterEach(() => {
        nav.share = originalShare
        nav.canShare = originalCanShare
        vi.restoreAllMocks()
    })

    it('共有メニューが使えるときは、タイトル・文・URL を渡す', async () => {
        nav.share = vi.fn().mockResolvedValue(undefined)
        nav.canShare = undefined
        expect(await shareApp()).toBe('shared')
        expect(nav.share).toHaveBeenCalledWith({ title: 'MomoTalk AI', text: t('shareText'), url: getShareUrl() })
        expect(window.open).not.toHaveBeenCalled()
    })

    it('利用者が共有をやめたとき（AbortError）は、何も開かない', async () => {
        nav.share = vi.fn().mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' }))
        expect(await shareApp()).toBe('cancelled')
        expect(window.open).not.toHaveBeenCalled()
    })

    it('共有メニューが使えない環境では、X の投稿画面を新しいタブで開く', async () => {
        nav.share = undefined
        expect(await shareApp()).toBe('fallback')
        expect(window.open).toHaveBeenCalledWith(getShareIntentUrl(), '_blank', 'noopener,noreferrer')
        const url = getShareIntentUrl()
        expect(url.startsWith('https://x.com/intent/post?text=')).toBe(true)
        expect(url).toContain(encodeURIComponent(getShareUrl()))
    })

    it('共有メニューが開けなかったとき（AbortError 以外）も、X の投稿画面にフォールバックする', async () => {
        nav.share = vi.fn().mockRejectedValue(new Error('NotAllowedError'))
        expect(await shareApp()).toBe('fallback')
        expect(window.open).toHaveBeenCalled()
    })
})

describe('共有アイコンの配置', () => {
    let app: App
    let host: HTMLDivElement
    afterEach(() => {
        app?.unmount()
        host?.remove()
    })

    it('設定画面の下部は「Xでシェア」の文字ではなく、共有アイコン', async () => {
        store.showSettingDialog = true
        host = document.createElement('div')
        document.body.append(host)
        app = createApp(SettingWindow)
        app.use(i18n).mount(host)
        await nextTick()
        const links = [...host.querySelectorAll('.icon-link')]
        const share = links.find((a) => a.getAttribute('title') === t('share'))
        expect(share, '共有アイコンのリンク').toBeTruthy()
        expect(share!.querySelector('svg')).not.toBeNull()
        expect(share!.textContent?.trim()).toBe('')
        expect(host.textContent).not.toContain('Xでシェア')
    })

    it('サイドバー（リセット・言語切り替えの並び）にも共有アイコンがある', () => {
        const app = fs.readFileSync('src/App.vue', 'utf-8')
        const down = app.slice(app.indexOf('id="sidebar__down"'))
        expect(down.slice(0, down.indexOf('</nav>'))).toContain('ShareIcon')
        expect(down.slice(0, down.indexOf('</nav>'))).toContain('shareApp()')
    })

    it('共有の文言が全言語にある', () => {
        for (const lang of ['jp', 'en', 'kr', 'zh', 'tw']) {
            expect(String((i18n.global as any).t('share', {}, { locale: lang })).length).toBeGreaterThan(0)
            expect(String((i18n.global as any).t('share', {}, { locale: lang }))).not.toBe('share')
        }
    })
})
