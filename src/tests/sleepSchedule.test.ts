import { describe, it, expect, beforeEach } from 'vitest'
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
    })
})



