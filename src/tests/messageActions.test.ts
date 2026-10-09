import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import MessageActions from '../views/ChatView/MessageActions.vue'
import { talkHistory } from '../assets/storeUtils/talkHistory'
import type { Talk } from '../assets/requestUtils/interface'
import i18n from '../locales/i18n'

vi.mock('../assets/chatUtils/send', () => ({
    abortStreaming: vi.fn(),
    isMessageTyping: (message: Talk) => message.type === 0 && !message.content
}))

let app: App
let host: HTMLDivElement
function mount(type = 0) {
    const message: Talk = { Id: 1, Name: 'シロコ', Avatar: '', type, flag: 2, content: '元のメッセージ' }
    talkHistory.currentStudentId = 10010
    talkHistory.talkHistory = [message]
    host = document.createElement('div')
    document.body.append(host)
    app = createApp(MessageActions, { element: talkHistory.talkHistory[0] })
    app.use(i18n).mount(host)
    return host.querySelector('.message-actions')!
}
function pointer(target: Element, name: string, x = 80, y = 100) {
    const event = new Event(name, { bubbles: true, cancelable: true })
    Object.assign(event, { pointerType: 'touch', isPrimary: true, clientX: x, clientY: y })
    target.dispatchEvent(event)
}
async function rightClick(target: Element) {
    target.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 80, clientY: 100 }))
    await nextTick()
}
beforeEach(() => {
    localStorage.clear()
    i18n.global.locale = 'jp'
    vi.useFakeTimers()
})
afterEach(() => {
    app?.unmount()
    document.body.innerHTML = ''
    vi.useRealTimers()
})

describe('Message actions', () => {
    it.each([0, 1])('edits and persists type %s, including a single student greeting', async type => {
        await rightClick(mount(type))
        ;(document.querySelector('.message-menu button') as HTMLButtonElement).click()
        await nextTick()
        const textarea = document.querySelector('textarea')!
        textarea.value = '編集したメッセージ'
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        await nextTick()
        document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        await nextTick()
        expect(talkHistory.talkHistory[0].content).toBe('編集したメッセージ')
        talkHistory.talkHistory = []
        talkHistory.loadStudentTalks({ Id: 10010, Name: 'シロコ', Avatar: '' })
        expect(talkHistory.talkHistory[0].content).toBe('編集したメッセージ')
    })
    it.each([0, 1])('deletes and persists type %s', async type => {
        await rightClick(mount(type))
        ;(document.querySelector('.message-menu .delete') as HTMLButtonElement).click()
        await nextTick()
        expect(talkHistory.talkHistory).toEqual([])
        expect(JSON.parse(localStorage.getItem('momotalk_chat_10010')!)).toEqual([])
    })
    it('opens after a long press, suppresses the image click, and cancels on movement or scrolling', async () => {
        const target = mount()
        pointer(target, 'pointerdown')
        vi.advanceTimersByTime(549)
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
        vi.advanceTimersByTime(1)
        await nextTick()
        expect(document.querySelector('.message-menu')).not.toBeNull()
        const click = new MouseEvent('click', { bubbles: true, cancelable: true })
        target.dispatchEvent(click)
        expect(click.defaultPrevented).toBe(true)
        document.querySelector('.message-menu')!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
        await nextTick()
        pointer(target, 'pointerdown')
        pointer(target, 'pointermove', 100, 100)
        vi.advanceTimersByTime(550)
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
        pointer(target, 'pointerdown')
        window.dispatchEvent(new Event('scroll'))
        vi.advanceTimersByTime(550)
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
    })
    it('does not delete a different message when an ID is stale', () => {
        mount()
        talkHistory.deleteTalkById(999)
        expect(talkHistory.talkHistory).toHaveLength(1)
    })
    it.each(['pointerup', 'pointercancel'])('cancels a hold on %s', async event => {
        const target = mount()
        pointer(target, 'pointerdown')
        vi.advanceTimersByTime(200)
        pointer(target, event)
        vi.advanceTimersByTime(550)
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
    })
    it('keeps focus inside the menu and closes it with Escape', async () => {
        await rightClick(mount())
        const menu = document.querySelector('.message-menu')!
        menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab', shiftKey: true }))
        expect(document.activeElement?.textContent).toBe('キャンセル')
        menu.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
        expect(document.activeElement?.getAttribute('aria-label')).toBe('メッセージの操作')
    })
    it('stores HTML entered in the editor as text', async () => {
        await rightClick(mount())
        ;(document.querySelector('.message-menu button') as HTMLButtonElement).click()
        await nextTick()
        const textarea = document.querySelector('textarea')!
        textarea.value = '<img src=x onerror=alert(1)>'
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        await nextTick()
        document.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        expect(talkHistory.talkHistory[0].content).toBe('&lt;img src=x onerror=alert(1)&gt;')
    })
    it('closes when switching students', async () => {
        await rightClick(mount())
        talkHistory.currentStudentId = 10000
        await nextTick()
        expect(document.querySelector('.message-menu')).toBeNull()
    })
})
