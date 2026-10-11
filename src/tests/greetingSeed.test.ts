import { describe, it, expect, beforeEach } from 'vitest'
import { seedInitialGreetings, talkHistory } from '../assets/storeUtils/talkHistory'
import { isStudentSleeping } from '../assets/ai/sleepSchedule'

describe('initial greeting seeding', () => {
    beforeEach(() => localStorage.clear())

    it('seeds unread greetings at awake times, once, without overwriting', () => {
        const students = [{ Id: 1, Name: 'シロコ', Avatars: ['a'], cnt: 0 }, { Id: 2, Name: 'ヒナ', Avatars: ['b'] }]
        localStorage.setItem('momotalk_chat_2', '[]')
        seedInitialGreetings(students)
        const talks = JSON.parse(localStorage.getItem('momotalk_chat_1')!)
        expect(talks).toHaveLength(1)
        expect(talks[0].time).toBeLessThanOrEqual(Date.now())
        expect(isStudentSleeping('シロコ', new Date(talks[0].time)).isSleeping).toBe(false)
        expect(talkHistory.unreadStudents[1]).toBe(1)
        expect(localStorage.getItem('momotalk_chat_2')).toBe('[]')
        expect(talkHistory.unreadStudents[2]).toBeUndefined()
    })

    it('seeds only prompt-supported students', () => {
        seedInitialGreetings([{ Id: 10010, Name: 'シロコ', Avatars: ['a'] }, { Id: 104, Name: 'アロナ', Avatars: ['b'] }])
        expect(localStorage.getItem('momotalk_chat_10010')).not.toBeNull()
        expect(localStorage.getItem('momotalk_chat_104')).toBeNull()
        expect(talkHistory.unreadStudents[104]).toBeUndefined()
    })

    it('replaces a greeting of another student left by old partial matching', () => {
        const stale = [{ Id: 0, Name: 'アロナ', Avatar: 'b', type: 0, flag: 2, content: '先生、ヤッホー☆ 私に会いに来てくれたの？', time: 1 }]
        localStorage.setItem('momotalk_chat_104', JSON.stringify(stale))
        talkHistory.unreadStudents[104] = 1
        seedInitialGreetings([{ Id: 104, Name: 'アロナ', Avatars: ['b'] }])
        const talks = JSON.parse(localStorage.getItem('momotalk_chat_104')!)
        expect(talks[0].content).not.toContain('ヤッホー')
        expect(talkHistory.unreadStudents[104]).toBeUndefined()
    })

    it('does not touch a chat the user has replied in', () => {
        const chat = [
            { Id: 0, Name: 'シロコ', Avatar: 'a', type: 0, flag: 2, content: 'こんにちは', time: 1 },
            { Id: 1, Name: 'シロコ', Avatar: 'a', type: 1, flag: 2, content: 'やあ', time: 2 }
        ]
        localStorage.setItem('momotalk_chat_10010', JSON.stringify(chat))
        seedInitialGreetings([{ Id: 10010, Name: 'シロコ', Avatars: ['a'] }])
        expect(JSON.parse(localStorage.getItem('momotalk_chat_10010')!)).toEqual(chat)
    })
})
