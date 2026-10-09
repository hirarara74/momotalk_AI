import { describe, it, expect, beforeEach } from 'vitest'
import { resolveStudentAvatar, checkAndTriggerPendingWakeups } from '../assets/chatUtils/send'
import { talkHistory } from '../assets/storeUtils/talkHistory'
import { store } from '../assets/storeUtils/store'
import { selectList } from '../assets/storeUtils/selectList'

describe('wake-up reply keeps the student icon', () => {
    beforeEach(() => {
        store.currentChatStudent = null
        talkHistory.talkHistory = []
        talkHistory.currentStudentId = 0
        selectList.selectList = []
    })

    it('prefers the icon selected in the list', () => {
        store.currentChatStudent = { Id: 16001, Name: 'アスナ', Avatars: ['a', 'b', 'c'], cnt: 2 }
        expect(resolveStudentAvatar(16001)).toBe('c')
    })

    it('falls back to the icon of the last student message, then the selection history', () => {
        talkHistory.currentStudentId = 16001
        talkHistory.talkHistory = [{ Id: 0, Name: 'アスナ', Avatar: 'last', type: 0, flag: 2, content: 'hi' } as any]
        expect(resolveStudentAvatar(16001)).toBe('last')
        talkHistory.talkHistory = []
        selectList.selectList = [{ Id: 16001, Name: 'アスナ', Avatar: 'picked' }]
        expect(resolveStudentAvatar(16001)).toBe('picked')
        expect(resolveStudentAvatar(99999)).toBe('')
    })

    it('keeps the pending wake-up while another reply is being generated', async () => {
        store.aiEnabled = true
        store.isAiResponding = true
        talkHistory.currentStudentId = 16001
        talkHistory.enqueuePendingWakeup(16001, 'アスナ', 'おはー', 1000)
        await checkAndTriggerPendingWakeups(new Date(2000))
        expect(talkHistory.getPendingWakeup(16001)).toBeDefined()
        store.isAiResponding = false
        talkHistory.removePendingWakeup(16001)
    })
})
