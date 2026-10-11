import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { extractStudentSticker, studentStickerHistory, STUDENT_STICKER_DIRECTIVE } from '../assets/ai/studentStickers'
import { stickers2 } from '../assets/utils/stickers'
import { streamStudentReply } from '../assets/ai/streamStudentReply'
import { triggerAIReply, triggerBackgroundWakeupReply, abortStreaming } from '../assets/chatUtils/send'
import { store } from '../assets/storeUtils/store'
import { talkHistory, seedInitialGreetings } from '../assets/storeUtils/talkHistory'

const mock = vi.hoisted(() => ({ streamChat: vi.fn() }))
vi.mock('../assets/ai', async importOriginal => ({
    ...await importOriginal<typeof import('../assets/ai')>(),
    getAIProvider: () => ({ id: 'test', name: 'test', streamChat: mock.streamChat })
}))
vi.mock('../assets/utils/sound', () => ({ playMomoTalkSound: vi.fn() }))

const tag = '[STICKER: ClanChat_Emoji_86_Jp.png]'
const url = stickers2.find(url => url.endsWith('ClanChat_Emoji_86_Jp.png'))!
const student = { Id: 10006, Name: 'イオリ', Avatar: 'iori.webp' }

describe('student sticker replies', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        localStorage.clear()
        talkHistory.currentStudentId = student.Id
        talkHistory.talkHistory = []
        talkHistory.talkId = 0
        talkHistory.unreadStudents = {}
        store.aiApiKey = 'test'
        store.imageGenEnabled = false
        store.isAiResponding = false
        mock.streamChat.mockReset()
    })
    afterEach(() => {
        abortStreaming()
        vi.clearAllTimers()
        vi.useRealTimers()
    })

    function respond(reply: string) {
        mock.streamChat.mockImplementationOnce(async (_prompt, _history, _message, chunk) => {
            chunk(reply)
            return reply
        })
    }

    async function foreground(reply: string) {
        respond(reply)
        const pending = triggerAIReply('ありがとう', { student })
        await vi.advanceTimersByTimeAsync(1500)
        await pending
        return talkHistory.talkHistory
    }

    it('resolves only a bundled sticker and keeps accompanying dialogue', () => {
        expect(extractStudentSticker(`ありがとう。 ${tag}`)).toEqual({ cleanText: 'ありがとう。', stickerUrl: url })
        expect(STUDENT_STICKER_DIRECTIVE).toContain('sticker-only')
    })

    it.each(['[S', '[STIC', '[STICKER', '[STICKER:', '[STICKER: ClanChat_Emoji_86_'])
    ('hides incomplete streaming controls: %s', partial => {
        expect(extractStudentSticker(`ありがとう ${partial}`).cleanText).toBe('ありがとう')
    })

    it.each(['https://evil.invalid/a.png', '../ClanChat_Emoji_86_Jp.png', 'unknown.png', '" onerror="alert(1)'])
    ('does not resolve untrusted image names: %s', name => {
        expect(extractStudentSticker(`[STICKER: ${name}]`)).toEqual({ cleanText: '', stickerUrl: undefined })
    })

    it('saves one image message for a sticker-only reply without leaking its tag', async () => {
        const talks = await foreground(tag)
        expect(talks).toHaveLength(1)
        expect(talks[0]).toMatchObject({ type: 0, Name: student.Name, Avatar: student.Avatar, content: url })
        expect(JSON.parse(localStorage.getItem('momotalk_chat_' + student.Id)!)[0].content).toBe(url)
        seedInitialGreetings([student])
        expect(JSON.parse(localStorage.getItem('momotalk_chat_' + student.Id)!)[0].content).toBe(url)
    })

    it('saves separate text and sticker bubbles with distinct IDs and preserves history', async () => {
        const talks = await foreground(`ありがとう。 ${tag}`)
        expect(talks.map(talk => talk.content)).toEqual(['ありがとう。', url])
        expect(talks[0].Id).not.toBe(talks[1].Id)
        respond('他にも手伝うことはあるか？')
        const pending = triggerAIReply('相談していい？', { student })
        await vi.advanceTimersByTimeAsync(1500)
        await pending
        expect(mock.streamChat.mock.calls[1][1]).toEqual([
            { role: 'assistant', content: 'ありがとう。' },
            { role: 'assistant', content: studentStickerHistory(url) }
        ])
    })

    it.each([tag, `ありがとう。 ${tag}`])('persists background wakeup replies including unread and timestamps: %s', async reply => {
        respond(reply)
        await triggerBackgroundWakeupReply({ studentId: student.Id, studentName: student.Name, userMessages: ['おはよう'], scheduledWakeTime: 0 }, ['おはよう'])
        const saved = JSON.parse(localStorage.getItem('momotalk_chat_' + student.Id)!)
        expect(saved.map((talk: any) => talk.content)).toEqual(reply === tag ? [url] : ['ありがとう。', url])
        expect(saved.every((talk: any) => talk.type === 0 && talk.time > 0)).toBe(true)
        expect(talkHistory.unreadStudents[student.Id]).toBe(1)
    })

    it('retries a duplicate sticker and rejects an invalid sticker-only answer', async () => {
        const provider = { id: 'test', name: 'test', streamChat: mock.streamChat }
        respond(tag)
        respond('[STICKER: ClanChat_Emoji_91_Jp.png]')
        expect(await streamStudentReply(provider, 'system', [{ role: 'assistant', content: studentStickerHistory(url) }], 'OK', vi.fn()))
            .toContain('91_Jp')
        expect(mock.streamChat).toHaveBeenCalledTimes(2)
        respond('[STICKER: unknown.png]')
        respond('[STICKER: unknown.png]')
        await expect(streamStudentReply(provider, 'system', [], 'OK', vi.fn())).rejects.toThrow('有効な返信')
    })

    it.each(['cancel', 'switch'])('does not commit a sticker after %s', async action => {
        mock.streamChat.mockImplementationOnce(async (_prompt, _history, _message, chunk) => {
            chunk('[STICKER: ClanChat_')
            expect(talkHistory.talkHistory[0].content).toBe('')
            if (action === 'cancel') abortStreaming()
            else talkHistory.currentStudentId = 999
            return tag
        })
        const pending = triggerAIReply('ありがとう', { student })
        await vi.advanceTimersByTimeAsync(1500)
        await pending
        expect(talkHistory.talkHistory.some(talk => talk.content === url)).toBe(false)
        if (action === 'cancel') expect(talkHistory.talkHistory).toHaveLength(0)
    })
})
