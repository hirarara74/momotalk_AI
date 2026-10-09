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
        expect(talkHistory.unreadStudents[1]).toBe(true)
        expect(localStorage.getItem('momotalk_chat_2')).toBe('[]')
        expect(talkHistory.unreadStudents[2]).toBeUndefined()
    })
})
