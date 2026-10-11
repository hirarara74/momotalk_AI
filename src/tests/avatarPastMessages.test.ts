import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, reactive, type App } from 'vue'
import ChatDraggable from '../views/ChatView/ChatDraggable.vue'
import { store } from '../assets/storeUtils/store'
import { talkHistory } from '../assets/storeUtils/talkHistory'
import i18n from '../locales/i18n'

// 生徒のアイコンを変えたとき、これから送るメッセージだけでなく過去のメッセージにも反映される
let app: App
let host: HTMLDivElement

function mount(tasks: any[]) {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp(ChatDraggable, { tasks })
    app.directive('lazy', {
        mounted: (el: HTMLElement, b: any) => el.setAttribute('data-avatar', b.value),
        updated: (el: HTMLElement, b: any) => el.setAttribute('data-avatar', b.value)
    })
    app.use(i18n).mount(host)
}
const avatars = () => [...host.querySelectorAll('.avatar img')].map((i) => i.getAttribute('data-avatar'))

beforeEach(() => {
    localStorage.clear()
    store.studentAvatarIndex = {}
})
afterEach(() => {
    app?.unmount()
    host?.remove()
})

describe('生徒のアイコン変更が過去のメッセージにも反映される', () => {
    it('保存済みのメッセージのアイコンも、いま選んでいるアイコンで表示する', async () => {
        const student = reactive({ Id: 10010, Name: 'シロコ', Avatars: ['/a0.webp', '/a1.webp'], cnt: 0 })
        store.currentChatStudent = student
        talkHistory.currentStudentId = 10010
        const tasks = reactive([
            { Id: 1, Name: 'シロコ', Avatar: '/old.webp', type: 0, flag: 1, content: 'こんにちは', time: 1 },
            { Id: 2, Name: 'sensei', Avatar: '', type: 1, flag: 1, content: 'やあ', time: 2 },
            { Id: 3, Name: 'シロコ', Avatar: '/older.webp', type: 0, flag: 1, content: 'また来たよ', time: 3 }
        ])
        mount(tasks as any)
        await nextTick()
        expect(avatars()).toEqual(['/a0.webp', '/a0.webp'])

        student.cnt = 1 // アイコンを切り替える
        await nextTick()
        expect(avatars()).toEqual(['/a1.webp', '/a1.webp'])
    })

    it('表示中の生徒と違うメッセージは、保存された値のまま', async () => {
        store.currentChatStudent = { Id: 10005, Name: 'ホシノ', Avatars: ['/h0.webp'], cnt: 0 }
        talkHistory.currentStudentId = 10010
        mount([{ Id: 1, Name: 'シロコ', Avatar: '/saved.webp', type: 0, flag: 1, content: 'こんにちは', time: 1 }])
        await nextTick()
        expect(avatars()).toEqual(['/saved.webp'])
    })
})

describe('選んだアイコンの保存', () => {
    it('選んだ番号を保存し、再読み込み後も復元できる', () => {
        store.setStudentAvatarIndex(10010, 2)
        expect(JSON.parse(localStorage.getItem('student-avatar-index')!)).toEqual({ 10010: 2 })
        store.studentAvatarIndex = {}
        store.getData()
        expect(store.studentAvatarIndex[10010]).toBe(2)
    })

    it('壊れた保存値でも落ちない', () => {
        localStorage.setItem('student-avatar-index', '{oops')
        expect(() => store.getData()).not.toThrow()
        expect(store.studentAvatarIndex).toEqual({})
    })

    it('リセットすると選択も消える', () => {
        store.setStudentAvatarIndex(10010, 1)
        store.resetData()
        expect(store.studentAvatarIndex).toEqual({})
        expect(localStorage.getItem('student-avatar-index')).toBeNull()
    })
})
