import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
    STUDENT_SLEEP_SCHEDULES,
    getStudentSleepSchedule,
    getStudentDailyWakeTime,
    isStudentSleeping,
    getWakeupSystemPromptModifier
} from '../assets/ai/sleepSchedule'

describe('Student Sleep & Wakeup Schedule (TDD)', () => {
    describe('1. Individual Student Schedules & Lore Configuration', () => {
        it('has defined sleep schedules for all major Blue Archive students', () => {
            const shiroko = getStudentSleepSchedule('砂狼シロコ')
            expect(shiroko).toBeDefined()
            expect(shiroko.bedtimeHour).toBe(22)
            expect(shiroko.bedtimeMinute).toBe(30)
            expect(shiroko.weekdayWakeHour).toBe(5)
            expect(shiroko.weekdayWakeMinute).toBe(30)
            expect(shiroko.weekendWakeHour).toBe(5)
            expect(shiroko.weekendWakeMinute).toBe(30)
            expect(shiroko.varianceMinutes).toBe(0) // 毎朝きっかり5:30起床（早朝ロードバイク）

            const hoshino = getStudentSleepSchedule('小鳥遊ホシノ')
            expect(hoshino).toBeDefined()
            expect(hoshino.weekdayWakeHour).toBe(8)
            expect(hoshino.weekdayWakeMinute).toBe(30)
            expect(hoshino.weekendWakeHour).toBe(10)
            expect(hoshino.weekendWakeMinute).toBe(30)
            expect(hoshino.varianceMinutes).toBeGreaterThanOrEqual(30) // 朝寝坊・不定期

            const hina = getStudentSleepSchedule('空崎ヒナ')
            expect(hina).toBeDefined()
            expect(hina.bedtimeHour).toBe(1) // 深夜1:30就寝（激務）
            expect(hina.bedtimeMinute).toBe(30)
            expect(hina.weekdayWakeHour).toBe(6) // 平日は朝早くから見回り
            expect(hina.weekendWakeHour).toBe(8) // 休日は少し寝かせてあげる

            const yuuka = getStudentSleepSchedule('早瀬ユウカ')
            expect(yuuka).toBeDefined()
            expect(yuuka.weekdayWakeHour).toBe(6)
            expect(yuuka.weekdayWakeMinute).toBe(30)
            expect(yuuka.weekendWakeHour).toBe(7)
            expect(yuuka.varianceMinutes).toBeLessThanOrEqual(5) // 規則正しいセミナー会計

            const azusa = getStudentSleepSchedule('白洲アズサ')
            expect(azusa.varianceMinutes).toBe(0) // アリウス仕込みの定時起床

            const toki = getStudentSleepSchedule('飛鳥馬トキ')
            expect(toki.varianceMinutes).toBe(0) // 精密なC&Cエージェント

            const noa = getStudentSleepSchedule('生塩ノア')
            expect(noa.varianceMinutes).toBeLessThanOrEqual(5) // 理知的な書記

            const koyuki = getStudentSleepSchedule('黒崎コユキ')
            expect(koyuki.varianceMinutes).toBeGreaterThanOrEqual(25) // 夜更かし寝坊型

            const saori = getStudentSleepSchedule('錠前サオリ')
            expect(saori.weekdayWakeHour).toBe(5) // 早朝警戒
        })

        it('returns fallback schedule for unlisted student', () => {
            const unknown = getStudentSleepSchedule('誰か知らない生徒')
            expect(unknown).toBeDefined()
            expect(unknown.bedtimeHour).toBe(23)
            expect(unknown.weekdayWakeHour).toBe(7)
            expect(unknown.weekendWakeHour).toBe(8)
        })
    })

    describe('2. Weekday vs Weekend Wake-up Times', () => {
        it('Shiroko wakes up at the EXACT same time on weekdays and weekends', () => {
            // Monday
            const monday = new Date(2026, 8, 28, 12, 0) // Mon
            const mondayWake = getStudentDailyWakeTime('シロコ', monday)
            expect(mondayWake.getHours()).toBe(5)
            expect(mondayWake.getMinutes()).toBe(30)

            // Sunday
            const sunday = new Date(2026, 8, 27, 12, 0) // Sun
            const sundayWake = getStudentDailyWakeTime('シロコ', sunday)
            expect(sundayWake.getHours()).toBe(5)
            expect(sundayWake.getMinutes()).toBe(30)
        })

        it('Hoshino wakes up significantly later on weekends than on weekdays', () => {
            const monday = new Date(2026, 8, 28, 12, 0) // Mon
            const mondayWake = getStudentDailyWakeTime('ホシノ', monday)

            const sunday = new Date(2026, 8, 27, 12, 0) // Sun
            const sundayWake = getStudentDailyWakeTime('ホシノ', sunday)

            // Sunday wake time should be around 10:30, Monday around 8:30 (differing by ~1.5 - 2.5 hours)
            const diffHours = (sundayWake.getTime() - mondayWake.getTime() + (24 * 60 * 60 * 1000)) / (1000 * 60 * 60)
            const rawHourDiff = (sundayWake.getHours() * 60 + sundayWake.getMinutes()) - (mondayWake.getHours() * 60 + mondayWake.getMinutes())
            expect(rawHourDiff).toBeGreaterThan(60) // At least 1 hour later on weekends
        })
    })

    describe('3. Consistency vs Randomness (Variance)', () => {
        it('calculates deterministic wake time for a given day (no jitter within the same day)', () => {
            const day1 = new Date(2026, 8, 28, 2, 0)
            const day1Later = new Date(2026, 8, 28, 4, 30)

            const wake1 = getStudentDailyWakeTime('ホシノ', day1)
            const wake2 = getStudentDailyWakeTime('ホシノ', day1Later)

            expect(wake1.getTime()).toBe(wake2.getTime())
        })

        it('students with variance 0 never change wake minutes across any day', () => {
            for (let day = 1; day <= 7; day++) {
                const testDate = new Date(2026, 8, day, 10, 0)
                const wake = getStudentDailyWakeTime('アズサ', testDate)
                expect(wake.getHours()).toBe(5)
                expect(wake.getMinutes()).toBe(30)
            }
        })
    })

    describe('4. isStudentSleeping logic', () => {
        it('detects Shiroko is asleep at 03:00 AM and awake at 12:00 PM', () => {
            const lateNight = new Date(2026, 8, 28, 3, 0) // 03:00 AM
            const resultNight = isStudentSleeping('シロコ', lateNight)
            expect(resultNight.isSleeping).toBe(true)
            expect(resultNight.wakeTime.getHours()).toBe(5)
            expect(resultNight.wakeTime.getMinutes()).toBe(30)

            const noon = new Date(2026, 8, 28, 12, 0) // 12:00 PM
            const resultNoon = isStudentSleeping('シロコ', noon)
            expect(resultNoon.isSleeping).toBe(false)
        })

        it('detects Hina is still awake at 00:30 AM (bedtime is 01:30)', () => {
            const midnight = new Date(2026, 8, 28, 0, 30) // 00:30 AM
            const resultMidnight = isStudentSleeping('ヒナ', midnight)
            expect(resultMidnight.isSleeping).toBe(false)

            const deepNight = new Date(2026, 8, 28, 3, 0) // 03:00 AM
            const resultDeepNight = isStudentSleeping('ヒナ', deepNight)
            expect(resultDeepNight.isSleeping).toBe(true)
        })

        it('detects Hoshino is still asleep at 09:30 AM on Sunday morning', () => {
            const sundayMorning = new Date(2026, 8, 27, 9, 30) // Sunday 09:30
            const result = isStudentSleeping('ホシノ', sundayMorning)
            expect(result.isSleeping).toBe(true)
        })
    })

    describe('5. getWakeupSystemPromptModifier', () => {
        it('generates morning wake-up instruction noting the student was asleep', () => {
            const promptModifier = getWakeupSystemPromptModifier('シロコ', ['シロコ、起きてる？'])
            expect(promptModifier).toContain('起床')
            expect(promptModifier).toContain('寝て')
            expect(promptModifier).toContain('シロコ、起きてる？')
        })
    })

    describe('6. Store & TalkHistory Sleep Queue Management (TDD)', () => {
        it('store defaults sleepSimulationEnabled to false', async () => {
            const { store } = await import('../assets/storeUtils/store')
            expect(store.sleepSimulationEnabled).toBe(false)
        })

        it('talkHistory can enqueue, retrieve, and remove pending wakeup replies', async () => {
            const { talkHistory } = await import('../assets/storeUtils/talkHistory')
            
            // Clear any prior test state
            talkHistory.removePendingWakeup(10010)
            expect(talkHistory.getPendingWakeup(10010)).toBeUndefined()

            // Enqueue first message
            const wakeTime = Date.now() + 3600000 // 1 hour later
            talkHistory.enqueuePendingWakeup(10010, '砂狼シロコ', 'シロコ、寝てる？', wakeTime)

            const pending1 = talkHistory.getPendingWakeup(10010)
            expect(pending1).toBeDefined()
            expect(pending1?.studentName).toBe('砂狼シロコ')
            expect(pending1?.userMessages).toEqual(['シロコ、寝てる？'])
            expect(pending1?.scheduledWakeTime).toBe(wakeTime)

            // Enqueue second message while still sleeping
            talkHistory.enqueuePendingWakeup(10010, '砂狼シロコ', '明日朝一緒に走ろう', wakeTime)
            const pending2 = talkHistory.getPendingWakeup(10010)
            expect(pending2?.userMessages).toEqual(['シロコ、寝てる？', '明日朝一緒に走ろう'])

            // Remove when woken up
            talkHistory.removePendingWakeup(10010)
            expect(talkHistory.getPendingWakeup(10010)).toBeUndefined()
        })
    })

    describe('7. Sleep Reply Trigger & Wakeup Flow (TDD)', () => {
        it('shouldDelayAIReplyForSleep correctly checks sleep status and setting', async () => {
            const { shouldDelayAIReplyForSleep } = await import('../assets/chatUtils/send')
            const { store } = await import('../assets/storeUtils/store')

            store.sleepSimulationEnabled = true
            const lateNight = new Date(2026, 8, 28, 3, 0) // 03:00 AM Monday
            const resultSleep = shouldDelayAIReplyForSleep('シロコ', lateNight)
            expect(resultSleep.shouldDelay).toBe(true)
            expect(resultSleep.wakeTime).toBeDefined()
            expect(resultSleep.wakeTime?.getHours()).toBe(5)

            // When user disables sleep simulation, it should NOT delay
            store.sleepSimulationEnabled = false
            const resultDisabled = shouldDelayAIReplyForSleep('シロコ', lateNight)
            expect(resultDisabled.shouldDelay).toBe(false)

            // During daytime, it should NOT delay even if enabled
            store.sleepSimulationEnabled = true
            const daytime = new Date(2026, 8, 28, 14, 0) // 14:00 PM
            const resultDay = shouldDelayAIReplyForSleep('シロコ', daytime)
            expect(resultDay.shouldDelay).toBe(false)
        })

        it('handleAIReplyTrigger enqueues when student is sleeping and skips immediate reply', async () => {
            const { handleAIReplyTrigger } = await import('../assets/chatUtils/send')
            const { talkHistory } = await import('../assets/storeUtils/talkHistory')
            const { store } = await import('../assets/storeUtils/store')

            store.sleepSimulationEnabled = true
            talkHistory.currentStudentId = 10010
            talkHistory.removePendingWakeup(10010)

            const lateNight = new Date(2026, 8, 28, 3, 0) // 03:00 AM
            await handleAIReplyTrigger('シロコ、今起きてる？', lateNight)

            const pending = talkHistory.getPendingWakeup(10010)
            expect(pending).toBeDefined()
            expect(pending?.userMessages).toContain('シロコ、今起きてる？')
            expect(store.isAiResponding).toBe(false)
        })

        it('checkAndTriggerPendingWakeups triggers reply when wake-up time is reached', async () => {
            const { checkAndTriggerPendingWakeups } = await import('../assets/chatUtils/send')
            const { talkHistory } = await import('../assets/storeUtils/talkHistory')

            talkHistory.currentStudentId = 10010
            const wakeTime = new Date(2026, 8, 28, 5, 30).getTime()
            talkHistory.enqueuePendingWakeup(10010, '砂狼シロコ', 'シロコ、起きてる？', wakeTime)

            // When time has NOT arrived yet (04:00 AM)
            const beforeWake = new Date(2026, 8, 28, 4, 0)
            checkAndTriggerPendingWakeups(beforeWake)
            expect(talkHistory.getPendingWakeup(10010)).toBeDefined()

            // When time HAS arrived (05:35 AM)
            const afterWake = new Date(2026, 8, 28, 5, 35)
            checkAndTriggerPendingWakeups(afterWake)
            // Pending wakeup should be consumed
            expect(talkHistory.getPendingWakeup(10010)).toBeUndefined()
        })

        it('checkAndTriggerPendingWakeups triggers reply for background student even if another chat is active', async () => {
            const { checkAndTriggerPendingWakeups } = await import('../assets/chatUtils/send')
            const { talkHistory } = await import('../assets/storeUtils/talkHistory')
            const { store } = await import('../assets/storeUtils/store')
            const { getAIProvider } = await import('../assets/ai')

            store.aiEnabled = true
            store.aiApiKey = 'mock_api_key'

            const { GroqProvider } = await import('../assets/ai/groq')
            vi.spyOn(GroqProvider.prototype, 'streamChat').mockImplementation(async (_sys, _hist, _prompt, onChunk) => {
                const reply = 'うへ〜、先生おはよ〜。よく寝た〜'
                onChunk?.(reply)
                return reply
            })

            // Set current chat to another student (e.g. Arona: 9999)
            talkHistory.currentStudentId = 9999
            talkHistory.talkHistory = [
                { Id: 1, Name: 'アロナ', Avatar: '', type: 0, flag: 2, content: '先生、こんにちは！', time: Date.now() }
            ]

            // Setup Hoshino (10005) with previous messages in localStorage
            const hoshinoId = 10005
            const hoshinoInitialTalks = [
                { Id: 10, Name: '小鳥遊ホシノ', Avatar: '', type: 0, flag: 2, content: 'うへ〜、おやすみ〜', time: Date.now() - 36000000 },
                { Id: 11, Name: '先生', Avatar: '', type: 1, flag: 2, content: 'ホシノ、明日朝起こしてね', time: Date.now() - 30000000 }
            ]
            localStorage.setItem('momotalk_chat_' + hoshinoId, JSON.stringify(hoshinoInitialTalks))

            const wakeTime = new Date(2026, 8, 28, 8, 30).getTime()
            talkHistory.enqueuePendingWakeup(hoshinoId, '小鳥遊ホシノ', 'ホシノ、明日朝起こしてね', wakeTime)

            // Current time reaches Hoshino's wake-up time (08:35 AM)
            const afterWake = new Date(2026, 8, 28, 8, 35)
            await checkAndTriggerPendingWakeups(afterWake)

            // 1. Pending wakeup must be consumed
            expect(talkHistory.getPendingWakeup(hoshinoId)).toBeUndefined()

            // 2. Active chat (Arona) should NOT be polluted with Hoshino's reply
            expect(talkHistory.talkHistory.length).toBe(1)
            expect(talkHistory.talkHistory[0].Name).toBe('アロナ')

            // 3. Background student (Hoshino)'s chat in localStorage must contain the wakeup reply
            const updatedHoshinoData = localStorage.getItem('momotalk_chat_' + hoshinoId)
            expect(updatedHoshinoData).toBeDefined()
            const hoshinoTalks = JSON.parse(updatedHoshinoData!)
            expect(hoshinoTalks.length).toBeGreaterThan(2)
            const lastHoshinoTalk = hoshinoTalks[hoshinoTalks.length - 1]
            expect(lastHoshinoTalk.type).toBe(0) // Student reply
            expect(lastHoshinoTalk.Name).toBe('小鳥遊ホシノ')
        })

        it('checkAndTriggerPendingWakeups handles multiple background students when no chat is open (currentStudentId = 0)', async () => {
            const { checkAndTriggerPendingWakeups } = await import('../assets/chatUtils/send')
            const { talkHistory } = await import('../assets/storeUtils/talkHistory')
            const { store } = await import('../assets/storeUtils/store')
            const { GroqProvider } = await import('../assets/ai/groq')

            store.aiEnabled = true
            store.aiApiKey = 'mock_api_key'

            vi.spyOn(GroqProvider.prototype, 'streamChat').mockImplementation(async (sys, _hist, _prompt, onChunk) => {
                const reply = sys.includes('シロコ') ? 'ん、先生おはよ。' : '……おはよう、先生。'
                onChunk?.(reply)
                return reply
            })

            // No chat open
            talkHistory.currentStudentId = 0
            talkHistory.talkHistory = []

            // Setup Shiroko (10010) and Hina (10004)
            const shirokoId = 10010
            const hinaId = 10004
            localStorage.setItem('momotalk_chat_' + shirokoId, JSON.stringify([
                { Id: 1, Name: '砂狼シロコ', Avatar: '', type: 0, flag: 2, content: 'ん、おやすみ', time: Date.now() - 36000000 },
                { Id: 2, Name: '先生', Avatar: '', type: 1, flag: 2, content: 'シロコ、明日走ろう', time: Date.now() - 30000000 }
            ]))
            localStorage.setItem('momotalk_chat_' + hinaId, JSON.stringify([
                { Id: 1, Name: '空崎ヒナ', Avatar: '', type: 0, flag: 2, content: '……おやすみなさい', time: Date.now() - 36000000 },
                { Id: 2, Name: '先生', Avatar: '', type: 1, flag: 2, content: 'ヒナ、お疲れ様', time: Date.now() - 30000000 }
            ]))

            const wakeTime = new Date(2026, 8, 28, 6, 0).getTime()
            talkHistory.enqueuePendingWakeup(shirokoId, '砂狼シロコ', 'シロコ、明日走ろう', wakeTime)
            talkHistory.enqueuePendingWakeup(hinaId, '空崎ヒナ', 'ヒナ、お疲れ様', wakeTime)

            // Trigger wakeups at 06:10 AM
            const afterWake = new Date(2026, 8, 28, 6, 10)
            await checkAndTriggerPendingWakeups(afterWake)

            // Both wakeups should be consumed
            expect(talkHistory.getPendingWakeup(shirokoId)).toBeUndefined()
            expect(talkHistory.getPendingWakeup(hinaId)).toBeUndefined()

            // Both students should have received their replies in localStorage
            const shirokoTalks = JSON.parse(localStorage.getItem('momotalk_chat_' + shirokoId)!)
            expect(shirokoTalks.length).toBe(3)
            expect(shirokoTalks[2].content).toContain('ん、先生おはよ')

            const hinaTalks = JSON.parse(localStorage.getItem('momotalk_chat_' + hinaId)!)
            expect(hinaTalks.length).toBe(3)
            expect(hinaTalks[2].content).toContain('おはよう、先生')
        })
    })
})




describe('sleep schedule lookup uses exact student names', () => {
    it('does not give ウミカ the schedule of ミカ, but keeps outfit suffixes', async () => {
        const { getStudentSleepSchedule, DEFAULT_SLEEP_SCHEDULE, STUDENT_SLEEP_SCHEDULES } = await import('../assets/ai/sleepSchedule')
        expect(getStudentSleepSchedule('ウミカ')).toBe(DEFAULT_SLEEP_SCHEDULE)
        expect(getStudentSleepSchedule('ミカ')).toBe(STUDENT_SLEEP_SCHEDULES['ミカ'])
        expect(getStudentSleepSchedule('ミカ（水着）')).toBe(STUDENT_SLEEP_SCHEDULES['ミカ'])
        expect(getStudentSleepSchedule({ Name: '聖園ミカ' })).toBe(STUDENT_SLEEP_SCHEDULES['聖園ミカ'] ?? STUDENT_SLEEP_SCHEDULES['ミカ'])
    })
})
