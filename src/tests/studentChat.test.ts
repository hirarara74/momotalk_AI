import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getStudentGreeting, SPECIAL_PROMPTS, buildSystemPrompt, isPromptSupported, getCurrentTimeContext } from '../assets/ai/prompts'
import { talkHistory } from '../assets/storeUtils/talkHistory'
import { store } from '../assets/storeUtils/store'
import { selectList } from '../assets/storeUtils/selectList'
import { resolveReplyStudent, abortStreaming, sendSenseiMessage, isMessageTyping, sendImagePayload } from '../assets/chatUtils/send'
import { playMomoTalkSound } from '../assets/utils/sound'
import { validateImageFileSize } from '../assets/imgUtils/readFile'
import { parseImageDataUrl, buildGeminiUserParts, extractTextAndImage, GEMINI_SAFETY_SETTINGS, DEFAULT_GEMINI_MODELS } from '../assets/ai/gemini'
import { GroqProvider, DEFAULT_GROQ_MODEL, DEFAULT_GROQ_BASE_URL, GROQ_CANDIDATE_MODELS, getAIProvider } from '../assets/ai'
import {
    getStudentLatestSnippet,
    sortStudentsByInteraction,
    formatChatTime,
    formatChatDate,
    isDifferentDay,
    recordStudentInteraction
} from '../assets/storeUtils/talkHistory'
import type { baseStudent, Talk, studentInfo } from '../assets/requestUtils/interface'

describe('Student Greetings & System Prompts (TDD)', () => {
    it('returns authentic in-character greeting for 8 core students', () => {
        expect(getStudentGreeting('砂狼シロコ')).toContain('ん、先生。待ってた。')
        expect(getStudentGreeting('シロコ')).toContain('ん、先生。待ってた。')
        expect(getStudentGreeting('小鳥遊ホシノ')).toContain('うへ〜')
        expect(getStudentGreeting('ホシノ')).toContain('うへ〜')
        expect(getStudentGreeting('空崎ヒナ')).toContain('先生……来てくれたんだ')
        expect(getStudentGreeting('天雨アコ')).toContain('手伝っていただきたい書類があります')
        expect(getStudentGreeting('陸八魔アル')).toContain('便利屋68社長')
        expect(getStudentGreeting('早瀬ユウカ')).toContain('経費精算')
        expect(getStudentGreeting('阿慈谷ヒフミ')).toContain('こんにちは！今日も一日頑張りましょうね！')
        expect(getStudentGreeting('伊落マリー')).toContain('主の祝福があなたと共にありますように')
    })

    it('returns a fallback greeting for generic Kivotos students', () => {
        const greeting = getStudentGreeting('未知の生徒')
        expect(greeting).toBeTruthy()
        expect(greeting).toContain('先生')
    })

    it('returns authentic in-character greeting for newly added students (Noa, Koyuki, Koharu, Asuna, Neru, Kazusa, Saori, Shun)', () => {
        expect(getStudentGreeting('生塩ノア')).toContain('記録に残るような')
        expect(getStudentGreeting('黒崎コユキ')).toContain('にぱぱ〜☆')
        expect(getStudentGreeting('下江コハル')).toContain('死刑')
        expect(getStudentGreeting('一之瀬アスナ')).toContain('ご主人様')
        expect(getStudentGreeting('美甘ネル')).toContain('アタシに何か用でもあんのか')
        expect(getStudentGreeting('杏山カズサ')).toContain('待ってたわけじゃないし')
        expect(getStudentGreeting('錠前サオリ')).toContain('何か異常があれば')
        expect(getStudentGreeting('春原シュン')).toContain('お茶でもいかがですか')
    })

    it('builds system prompt correctly identifying student roleplay context', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        const prompt = buildSystemPrompt(shiroko)
        expect(prompt).toContain('砂狼シロコ')
        expect(prompt).toContain('先生')

        const noa: baseStudent = { Id: 10020, Name: '生塩ノア', Avatar: 'noa.webp' }
        expect(buildSystemPrompt(noa)).toContain('記録係ですから')

        const neru: baseStudent = { Id: 10021, Name: '美甘ネル', Avatar: 'neru.webp' }
        expect(buildSystemPrompt(neru)).toContain('ぶっ飛ばすぞ')
    })

    it('verifies all 23 students have comprehensive student relationships, Sensei relationship, and dialogue examples', () => {
        const studentNames = [
            '砂狼シロコ', '小鳥遊ホシノ', '空崎ヒナ', '天雨アコ', '陸八魔アル', '早瀬ユウカ', '阿慈谷ヒフミ',
            '伊落マリー', '白洲アズサ', '銀鏡イオリ', '角楯カリン', '聖園ミカ', '飛鳥馬トキ', '黒舘ハルナ',
            '浅黄ムツキ', '生塩ノア', '黒崎コユキ', '下江コハル', '一之瀬アスナ', '美甘ネル', '杏山カズサ',
            '錠前サオリ', '春原シュン'
        ]

        for (const name of studentNames) {
            const student: baseStudent = { Id: 99999, Name: name, Avatar: 'test.webp' }
            const prompt = buildSystemPrompt(student)

            expect(prompt).toContain('先生')

            if (name === '砂狼シロコ') {
                expect(prompt).toContain('対策委員会')
                expect(prompt).toContain('romantic feelings toward her teacher')
                expect(prompt).toContain('ん、準備は出来てる。')
            } else {
                expect(prompt).toContain('他の生徒との関係性')
                expect(prompt).toContain('先生との関係性')
                expect(prompt).toContain('セリフ例')
            }
        }
    })
})

describe('Per-Student Conversation Thread Isolation & Persistence (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('initializes a new student chat thread with their in-character greeting', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        talkHistory.loadStudentTalks(shiroko)

        expect(talkHistory.currentStudentId).toBe(10010)
        expect(talkHistory.talkHistory.length).toBe(1)
        expect(talkHistory.talkHistory[0].Name).toBe('砂狼シロコ')
        expect(talkHistory.talkHistory[0].content).toContain('ん、先生。待ってた。')
        expect(talkHistory.talkHistory[0].type).toBe(0) // 0 = student
    })

    it('isolates conversation histories between different students', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        const aru: baseStudent = { Id: 10003, Name: '陸八魔アル', Avatar: 'aru.webp' }

        // Load Shiroko and add a message
        talkHistory.loadStudentTalks(shiroko)
        talkHistory.pushTalk({
            Id: talkHistory.talkId++,
            Name: 'sensei',
            Avatar: '',
            type: 1,
            flag: 2,
            content: 'シロコ、銀行に行こうか'
        })
        talkHistory.saveCurrentStudentTalks()
        expect(talkHistory.talkHistory.length).toBe(2)

        // Switch to Aru
        talkHistory.loadStudentTalks(aru)
        expect(talkHistory.currentStudentId).toBe(10003)
        expect(talkHistory.talkHistory.length).toBe(1)
        expect(talkHistory.talkHistory[0].Name).toBe('陸八魔アル')
        expect(talkHistory.talkHistory[0].content).toContain('便利屋68社長')

        // Switch back to Shiroko: previous history must be intact!
        talkHistory.loadStudentTalks(shiroko)
        expect(talkHistory.currentStudentId).toBe(10010)
        expect(talkHistory.talkHistory.length).toBe(2)
        expect(talkHistory.talkHistory[1].content).toContain('シロコ、銀行に行こうか')
    })

    it('allows clearing conversation history and re-generating initial greeting', () => {
        const hoshino: baseStudent = { Id: 10000, Name: '小鳥遊ホシノ', Avatar: 'hoshino.webp' }
        talkHistory.loadStudentTalks(hoshino)
        talkHistory.pushTalk({
            Id: talkHistory.talkId++,
            Name: 'sensei',
            Avatar: '',
            type: 1,
            flag: 2,
            content: 'おじさん起きて'
        })
        talkHistory.saveCurrentStudentTalks()
        expect(talkHistory.talkHistory.length).toBe(2)

        talkHistory.clearStudentTalks(hoshino)
        expect(talkHistory.talkHistory.length).toBe(1)
        expect(talkHistory.talkHistory[0].content).toContain('うへ〜')
    })
})

describe('Store Kizuna Relationship & Active Student (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
    })

    it('tracks and increments relationship rank per student', () => {
        expect(store.getRelationshipRank(10010)).toBe(1)
        store.increaseRelationshipRank(10010)
        expect(store.getRelationshipRank(10010)).toBe(2)
        // Check another student remains 1
        expect(store.getRelationshipRank(10003)).toBe(1)
    })

    it('resolves active student from store.currentChatStudent for AI reply', () => {
        store.currentChatStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        const resolved = resolveReplyStudent()
        expect(resolved).toBeTruthy()
        expect(resolved?.Id).toBe(10010)
        expect(resolved?.Name).toBe('砂狼シロコ')
    })

    it('aborts active streaming when switching students to prevent data bleed', () => {
        store.isAiResponding = true
        abortStreaming()
        expect(store.isAiResponding).toBe(false)
    })
})

describe('MomoTalk Audio Effects (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('supports soundEnabled and soundVolume in store with persistence', () => {
        expect(store.soundEnabled).toBe(true)
        expect(store.soundVolume).toBeGreaterThan(0)
        store.soundEnabled = false
        store.setData()
        expect(localStorage.getItem('sound-enabled')).toBe('false')
    })

    it('provides playMomoTalkSound function for send, receive, and rankup', () => {
        expect(typeof playMomoTalkSound).toBe('function')
        // Should not throw even in jsdom/headless environment
        expect(() => playMomoTalkSound('send')).not.toThrow()
        expect(() => playMomoTalkSound('receive')).not.toThrow()
        expect(() => playMomoTalkSound('rankup')).not.toThrow()
    })
})

describe('Prompt Supported Student Filtering (TDD)', () => {
    it('correctly identifies prompt-supported students and excludes unconfigured students', () => {
        expect(isPromptSupported({ Id: 10010, Name: '砂狼シロコ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 10005, Name: '小鳥遊ホシノ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 10004, Name: '空崎ヒナ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 20008, Name: '天雨アコ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 10000, Name: '陸八魔アル' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 13010, Name: '早瀬ユウカ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 10003, Name: '阿慈谷ヒフミ' } as any)).toBe(true)
        expect(isPromptSupported({ Id: 23008, Name: '伊落マリー' } as any)).toBe(true)

        // Short names
        expect(isPromptSupported('シロコ')).toBe(true)
        expect(isPromptSupported('ユウカ')).toBe(true)

        // 8 New supported students
        expect(isPromptSupported({ Id: 10052, Name: '生塩ノア' })).toBe(true)
        expect(isPromptSupported({ Id: 10063, Name: '黒崎コユキ' })).toBe(true)
        expect(isPromptSupported({ Id: 10020, Name: '下江コハル' })).toBe(true)
        expect(isPromptSupported({ Id: 16001, Name: '一之瀬アスナ' })).toBe(true)
        expect(isPromptSupported({ Id: 10008, Name: '美甘ネル' })).toBe(true)
        expect(isPromptSupported({ Id: 10049, Name: '杏山カズサ' })).toBe(true)
        expect(isPromptSupported({ Id: 10048, Name: '錠前サオリ' })).toBe(true)
        expect(isPromptSupported({ Id: 10011, Name: '春原シュン' })).toBe(true)

        // Non-supported students must be false
        expect(isPromptSupported({ Id: 10007, Name: 'ジュンコ' } as any)).toBe(false)
        expect(isPromptSupported({ Id: 10009, Name: 'イズミ' } as any)).toBe(false)
        expect(isPromptSupported({ Id: 10012, Name: 'ハレ' } as any)).toBe(false)
        expect(isPromptSupported('未知の生徒')).toBe(false)
    })

    it('filters a roster of students to only include prompt-supported students', () => {
        const roster = [
            { Id: 10010, Name: 'シロコ' },
            { Id: 10009, Name: 'イズミ' },
            { Id: 10005, Name: 'ホシノ' },
            { Id: 10007, Name: 'ジュンコ' },
            { Id: 13010, Name: 'ユウカ' },
        ]
        const filtered = roster.filter(isPromptSupported)
        expect(filtered.length).toBe(3)
        expect(filtered.map(s => s.Name)).toEqual(['シロコ', 'ホシノ', 'ユウカ'])
    })
})

describe('Sensei-Only User Messaging and AI Reply (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
    })

    it('always creates a Sensei message (type: 1) when sendSenseiMessage is called', () => {
        const hifumi: baseStudent = { Id: 10003, Name: '阿慈谷ヒフミ', Avatar: 'hifumi.webp' }
        talkHistory.loadStudentTalks(hifumi)
        store.currentChatStudent = hifumi

        sendSenseiMessage('結婚しよ')

        const talks = talkHistory.talkHistory
        expect(talks.length).toBeGreaterThanOrEqual(2)
        const senseiTalk = talks.find(t => t.content.includes('結婚しよ'))
        expect(senseiTalk).toBeTruthy()
        expect(senseiTalk?.type).toBe(1)
        expect(senseiTalk?.Name).toBe('sensei')
    })

    it('resolves reply student accurately for Hifumi when Sensei sends a message', () => {
        const hifumi: baseStudent = { Id: 10003, Name: '阿慈谷ヒフミ', Avatar: 'hifumi.webp' }
        talkHistory.loadStudentTalks(hifumi)
        store.currentChatStudent = hifumi

        const target = resolveReplyStudent()
        expect(target).toBeTruthy()
        expect(target?.Id).toBe(10003)
        expect(target?.Name).toBe('阿慈谷ヒフミ')
    })
})

describe('Typing Animation Continuous Playback (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
        store.isAiResponding = false
        store.typing = 0
    })

    it('returns false for Sensei message so Sensei text shows immediately without typing animation', () => {
        const senseiTalk: Talk = {
            Id: 1,
            Name: 'sensei',
            Avatar: '',
            type: 1,
            flag: 2,
            content: '結婚しよ'
        }
        expect(isMessageTyping(senseiTalk)).toBe(false)
    })

    it('returns true for student reply placeholder while AI is responding and content is empty', () => {
        store.isAiResponding = true
        store.typing = 0 // Even if typing timer expired or is 0
        const replyTalk: Talk = {
            Id: 2,
            Name: 'ヒフミ',
            Avatar: 'hifumi.webp',
            type: 0,
            flag: 2,
            content: ''
        }
        expect(isMessageTyping(replyTalk)).toBe(true)
    })

    it('returns false as soon as reply text arrives and content is populated', () => {
        store.isAiResponding = true
        const replyTalk: Talk = {
            Id: 2,
            Name: 'ヒフミ',
            Avatar: 'hifumi.webp',
            type: 0,
            flag: 2,
            content: '<p>え、えええっ！？</p>'
        }
        expect(isMessageTyping(replyTalk)).toBe(false)
    })

    it('returns false after AI responding completes', () => {
        store.isAiResponding = false
        const replyTalk: Talk = {
            Id: 2,
            Name: 'ヒフミ',
            Avatar: 'hifumi.webp',
            type: 0,
            flag: 2,
            content: ''
        }
        expect(isMessageTyping(replyTalk)).toBe(false)
    })
})

describe('Large Image Upload Validation & Processing (TDD)', () => {
    it('accepts images up to 20MB and rejects files exceeding 25MB', () => {
        // Old 1MB limit used to reject anything over 1,048,576 bytes
        expect(validateImageFileSize(500 * 1024)).toBe(true)
        expect(validateImageFileSize(1.5 * 1024 * 1024)).toBe(true) // 1.5MB
        expect(validateImageFileSize(5 * 1024 * 1024)).toBe(true)   // 5MB
        expect(validateImageFileSize(15 * 1024 * 1024)).toBe(true)  // 15MB
        expect(validateImageFileSize(20 * 1024 * 1024)).toBe(true)  // 20MB
        expect(validateImageFileSize(30 * 1024 * 1024)).toBe(false) // 30MB exceeded
    })
})

describe('Multimodal Image AI Prompt Parsing (TDD)', () => {
    it('parses base64 data URLs accurately into mimeType and raw base64 data', () => {
        const webpDataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA='
        const parsed = parseImageDataUrl(webpDataUrl)
        expect(parsed).not.toBeNull()
        expect(parsed?.mimeType).toBe('image/webp')
        expect(parsed?.base64Data).toBe('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=')

        const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        const parsedPng = parseImageDataUrl(pngDataUrl)
        expect(parsedPng).not.toBeNull()
        expect(parsedPng?.mimeType).toBe('image/png')
        expect(parsedPng?.base64Data).toContain('iVBORw0KGgoAAA')

        // Regular text returns null
        expect(parseImageDataUrl('こんにちは、先生！')).toBeNull()
    })

    it('builds multimodal inlineData parts for Gemini when an image is sent', () => {
        const webpDataUrl = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA='
        const parts = buildGeminiUserParts(webpDataUrl)
        expect(parts.length).toBe(2)
        expect((parts[0] as any).inlineData).toBeDefined()
        expect((parts[0] as any).inlineData.mimeType).toBe('image/webp')
        expect((parts[0] as any).inlineData.data).toBe('UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/v39gAA=')
        expect((parts[1] as any).text).toContain('画像')

        // Normal text message returns single text part
        const textParts = buildGeminiUserParts('銀行強盗行こう')
        expect(textParts.length).toBe(1)
        expect((textParts[0] as any).text).toBe('銀行強盗行こう')
    })
})

describe('Chat List Newest Interaction Sorting & Latest Message Preview (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
        talkHistory.studentChatTimes = {}
    })

    it('returns latest message content for student snippet and strips HTML tags', () => {
        const aru: studentInfo = {
            Id: 10000,
            Name: 'アル',
            Bio: 'なんでも解決するわよ！',
            Avatars: ['aru.webp'],
            Nickname: ['アル社長'],
            Birthday: '3月12日',
            Age: '16歳',
            cnt: 0,
            School: 'Gehenna',
            Club: 'Handyman68',
            Star: 3,
            Released: true,
            RelatedStudent: []
        }

        // Initially without chats, returns Bio
        expect(getStudentLatestSnippet(aru)).toBe('なんでも解決するわよ！')

        // When a chat history exists, returns latest message content
        localStorage.setItem(
            'momotalk_chat_10000',
            JSON.stringify([
                { Id: 1, Name: 'アル', Avatar: 'aru.webp', type: 0, flag: 2, content: '依頼かしら？' },
                { Id: 2, Name: 'sensei', Avatar: '', type: 1, flag: 2, content: '<p>手伝ってほしい</p>' }
            ])
        )
        expect(getStudentLatestSnippet(aru)).toBe('手伝ってほしい')

        // If latest message is an image, returns [画像]
        localStorage.setItem(
            'momotalk_chat_10000',
            JSON.stringify([
                { Id: 1, Name: 'アル', Avatar: 'aru.webp', type: 0, flag: 2, content: '依頼かしら？' },
                { Id: 2, Name: 'sensei', Avatar: '', type: 1, flag: 2, content: 'data:image/webp;base64,AAAA' }
            ])
        )
        expect(getStudentLatestSnippet(aru)).toBe('[画像]')
    })

    it('sorts students by newest interaction timestamp first (default sort)', () => {
        const studentA = { Id: 10010, Name: 'シロコ' } as studentInfo
        const studentB = { Id: 10000, Name: 'アル' } as studentInfo
        const studentC = { Id: 10003, Name: 'ヒフミ' } as studentInfo

        // Shiroko interacted at t=2000, Aru at t=3000, Hifumi has no interaction (0)
        talkHistory.studentChatTimes = {
            10010: 2000,
            10000: 3000
        }

        const sorted = sortStudentsByInteraction([studentA, studentB, studentC], true)
        // Descending interaction (newest first): Aru (3000), Shiroko (2000), Hifumi (0)
        expect(sorted.map(s => s.Name)).toEqual(['アル', 'シロコ', 'ヒフミ'])
    })
})

describe('Real-time Date, Time, Season, and Birthday Awareness in Prompts (TDD)', () => {
    it('generates real-time context with year, date, day of week, season, and time of day', () => {
        // 2026-09-23 20:25 JST (Wednesday, Autumn, Night)
        const fixedDate = new Date(2026, 8, 23, 20, 25, 0)
        const context = getCurrentTimeContext('3月12日', '陸八魔アル', fixedDate)

        expect(context).toContain('2026年9月23日')
        expect(context).toContain('水曜日')
        expect(context).toContain('20:25')
        expect(context).toContain('秋')
        expect(context).toContain('夜')
        expect(context).toContain('3月12日')
    })

    it('identifies when today is the student birthday and adds special prompt instruction', () => {
        // Shiroko birthday: 5月16日
        const birthdayDate = new Date(2026, 4, 16, 14, 0, 0)
        const context = getCurrentTimeContext('5月16日', '砂狼シロコ', birthdayDate)

        expect(context).toContain('誕生日当日')
        expect(context).toContain('砂狼シロコ')
    })

    it('injects real-time context and birthday into buildSystemPrompt', () => {
        const aru: studentInfo = {
            Id: 10000,
            Name: '陸八魔アル',
            Bio: 'なんでも解決するわよ！',
            Avatars: ['aru.webp'],
            Nickname: ['アル社長'],
            Birthday: '3月12日',
            Age: '16歳',
            cnt: 0,
            School: 'Gehenna',
            Club: 'Handyman68',
            Star: 3,
            Released: true,
            RelatedStudent: []
        }
        const prompt = buildSystemPrompt(aru)
        expect(prompt).toContain('リアルタイム環境情報')
        expect(prompt).toContain('現在日時')
        expect(prompt).toContain('現在の季節')
        expect(prompt).toContain('3月12日')
    })
})

describe('Message Timestamping and Date Formatting (TDD)', () => {
    it('formats message timestamp to HH:mm', () => {
        const date = new Date(2026, 8, 23, 9, 5, 0)
        expect(formatChatTime(date.getTime())).toBe('09:05')

        const afternoon = new Date(2026, 8, 23, 20, 30, 0)
        expect(formatChatTime(afternoon.getTime())).toBe('20:30')
        expect(formatChatTime(undefined)).toBe('')
    })

    it('formats message timestamp to date string', () => {
        const date = new Date(2026, 8, 23, 10, 0, 0)
        const formatted = formatChatDate(date.getTime())
        expect(formatted).toContain('2026')
        expect(formatted).toContain('9月23日')
    })

    it('detects when messages occur on different days', () => {
        const t1 = new Date(2026, 8, 22, 23, 59, 0).getTime()
        const t2 = new Date(2026, 8, 23, 0, 1, 0).getTime()
        const t3 = new Date(2026, 8, 23, 15, 0, 0).getTime()

        expect(isDifferentDay(t1, t2)).toBe(true)
        expect(isDifferentDay(t2, t3)).toBe(false)
        expect(isDifferentDay(undefined, t3)).toBe(true)
    })
})

describe('Interaction-Only Sorting (Clicking must NOT change sort order) (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
        talkHistory.studentChatTimes = {}
    })

    it('does NOT update studentChatTimes simply by loading/clicking a student', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        const aru: baseStudent = { Id: 10000, Name: '陸八魔アル', Avatar: 'aru.webp' }

        // Record past interaction for Shiroko at t=1000, Aru at t=2000
        recordStudentInteraction(10010, 1000)
        recordStudentInteraction(10000, 2000)

        expect(talkHistory.getStudentLastChatTime(10000)).toBe(2000)
        expect(talkHistory.getStudentLastChatTime(10010)).toBe(1000)

        // User clicks Shiroko (loadStudentTalks)
        talkHistory.loadStudentTalks(shiroko)

        // Shiroko's interaction time MUST remain 1000, NOT updated to Date.now()!
        expect(talkHistory.getStudentLastChatTime(10010)).toBe(1000)
        expect(talkHistory.getStudentLastChatTime(10000)).toBe(2000)

        // User clicks Aru (loadStudentTalks)
        talkHistory.loadStudentTalks(aru)

        // Interaction times must still be untouched
        expect(talkHistory.getStudentLastChatTime(10010)).toBe(1000)
        expect(talkHistory.getStudentLastChatTime(10000)).toBe(2000)
    })

    it('updates studentChatTimes ONLY when an actual interaction occurs', () => {
        const shirokoId = 10010
        recordStudentInteraction(shirokoId, 5000)
        expect(talkHistory.getStudentLastChatTime(shirokoId)).toBe(5000)

        // Record interaction at new time
        recordStudentInteraction(shirokoId, 6000)
        expect(talkHistory.getStudentLastChatTime(shirokoId)).toBe(6000)
    })
})

describe('Student Chat Isolation & Shiroko Bleed Prevention (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.resetData()
        selectList.resetData()
        store.currentChatStudent = null
    })

    it('resolves reply student strictly to Hifumi when Hifumi is active in talkHistory, even if store.currentChatStudent was Shiroko', () => {
        const hifumi: baseStudent = { Id: 10003, Name: '阿慈谷ヒフミ', Avatar: 'hifumi.webp' }
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }

        // Suppose store.currentChatStudent was left on Shiroko
        store.currentChatStudent = shiroko
        // But talkHistory loaded Hifumi's chat thread
        talkHistory.loadStudentTalks(hifumi)

        const resolved = resolveReplyStudent()
        expect(resolved).not.toBeNull()
        expect(resolved?.Id).toBe(10003)
        expect(resolved?.Name).toBe('阿慈谷ヒフミ')
    })

    it('never leaks Shiroko from selectList when Hifumi is the active student thread', () => {
        const hifumi: baseStudent = { Id: 10003, Name: '阿慈谷ヒフミ', Avatar: 'hifumi.webp' }
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }

        // selectList has Shiroko at index 0
        selectList.pushStudent(shiroko)
        store.currentChatStudent = null

        talkHistory.loadStudentTalks(hifumi)

        const resolved = resolveReplyStudent()
        expect(resolved).not.toBeNull()
        expect(resolved?.Id).toBe(10003)
        expect(resolved?.Name).toBe('阿慈谷ヒフミ')
    })

    it('clears student talks correctly when studentInfo with Avatars array is passed', () => {
        const hifumiInfo: any = {
            Id: 10003,
            Name: '阿慈谷ヒフミ',
            Avatars: ['hifumi_0.webp', 'hifumi_1.webp'],
            cnt: 0
        }

        talkHistory.clearStudentTalks(hifumiInfo)
        expect(talkHistory.currentStudentId).toBe(10003)
        expect(talkHistory.talkHistory.length).toBe(1)
        expect(talkHistory.talkHistory[0].Name).toBe('阿慈谷ヒフミ')
        expect(talkHistory.talkHistory[0].Avatar).toBe('hifumi_0.webp')
    })
})

describe('New Popular Students (Azusa, Iori, Karin, Mika, Toki, Haruna, Mutsuki) (TDD)', () => {
    it('provides authentic in-character greetings for all 7 new students', () => {
        expect(getStudentGreeting('白洲アズサ')).toContain('Vanitas vanitatum')
        expect(getStudentGreeting('アズサ')).toContain('Vanitas vanitatum')

        expect(getStudentGreeting('銀鏡イオリ')).toContain('風紀委員会')
        expect(getStudentGreeting('イオリ')).toContain('風紀委員会')

        expect(getStudentGreeting('角楯カリン')).toContain('角楯カリン')
        expect(getStudentGreeting('カリン')).toContain('角楯カリン')

        expect(getStudentGreeting('聖園ミカ')).toContain('ヤッホー☆')
        expect(getStudentGreeting('ミカ')).toContain('ヤッホー☆')

        expect(getStudentGreeting('飛鳥馬トキ')).toContain('ピース')
        expect(getStudentGreeting('トキ')).toContain('ピース')

        expect(getStudentGreeting('黒舘ハルナ')).toContain('美食')
        expect(getStudentGreeting('ハルナ')).toContain('美食')

        expect(getStudentGreeting('浅黄ムツキ')).toContain('くふふ')
        expect(getStudentGreeting('ムツキ')).toContain('くふふ')
    })

    it('identifies all 7 new students as prompt-supported by ID and name', () => {
        expect(isPromptSupported({ Id: 10019, Name: 'アズサ' })).toBe(true)
        expect(isPromptSupported({ Id: 10006, Name: 'イオリ' })).toBe(true)
        expect(isPromptSupported({ Id: 20001, Name: 'カリン' })).toBe(true)
        expect(isPromptSupported({ Id: 10059, Name: 'ミカ' })).toBe(true)
        expect(isPromptSupported({ Id: 10062, Name: 'トキ' })).toBe(true)
        expect(isPromptSupported({ Id: 10002, Name: 'ハルナ' })).toBe(true)
        expect(isPromptSupported({ Id: 13006, Name: 'ムツキ' })).toBe(true)

        expect(isPromptSupported('白洲アズサ')).toBe(true)
        expect(isPromptSupported('銀鏡イオリ')).toBe(true)
        expect(isPromptSupported('角楯カリン')).toBe(true)
        expect(isPromptSupported('聖園ミカ')).toBe(true)
        expect(isPromptSupported('飛鳥馬トキ')).toBe(true)
        expect(isPromptSupported('黒舘ハルナ')).toBe(true)
        expect(isPromptSupported('浅黄ムツキ')).toBe(true)
    })

    it('builds system prompts for all 7 students containing distinct Blue Archive personas', () => {
        const azusaPrompt = buildSystemPrompt({ Name: 'アズサ', Id: 10019 } as any)
        expect(azusaPrompt).toContain('白洲アズサ')
        expect(azusaPrompt).toContain('Vanitas')

        const ioriPrompt = buildSystemPrompt({ Name: 'イオリ', Id: 10006 } as any)
        expect(ioriPrompt).toContain('銀鏡イオリ')
        expect(ioriPrompt).toContain('風紀委員会')

        const karinPrompt = buildSystemPrompt({ Name: 'カリン', Id: 20001 } as any)
        expect(karinPrompt).toContain('角楯カリン')
        expect(karinPrompt).toContain('C&C')

        const mikaPrompt = buildSystemPrompt({ Name: 'ミカ', Id: 10059 } as any)
        expect(mikaPrompt).toContain('聖園ミカ')
        expect(mikaPrompt).toContain('王子様')

        const tokiPrompt = buildSystemPrompt({ Name: 'トキ', Id: 10062 } as any)
        expect(tokiPrompt).toContain('飛鳥馬トキ')
        expect(tokiPrompt).toContain('ピース')

        const harunaPrompt = buildSystemPrompt({ Name: 'ハルナ', Id: 10002 } as any)
        expect(harunaPrompt).toContain('黒舘ハルナ')
        expect(harunaPrompt).toContain('美食')

        const mutsukiPrompt = buildSystemPrompt({ Name: 'ムツキ', Id: 13006 } as any)
        expect(mutsukiPrompt).toContain('浅黄ムツキ')
        expect(mutsukiPrompt).toContain('くふふ')
    })

    it('registers correct birthdays for all 7 new students in time context', () => {
        // Azusa: 12月26日
        const azusaBday = getCurrentTimeContext('12月26日', 'アズサ', new Date(2026, 11, 26))
        expect(azusaBday).toContain('誕生日当日')

        // Mika: 5月8日
        const mikaBday = getCurrentTimeContext('5月8日', 'ミカ', new Date(2026, 4, 8))
        expect(mikaBday).toContain('誕生日当日')

        // Toki: 8月16日
        const tokiBday = getCurrentTimeContext('8月16日', 'トキ', new Date(2026, 7, 16))
        expect(tokiBday).toContain('誕生日当日')
    })
})

describe('MomoTalk Read Indicator (既読) & Message Layout (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.talkHistory = []
        talkHistory.talkId = 0
    })

    it('assigns Sensei messages type === 1 and student messages type === 0', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        talkHistory.loadStudentTalks(shiroko)

        // Initial student greeting: type 0
        expect(talkHistory.talkHistory[0].type).toBe(0)

        // Sensei sends a message
        sendSenseiMessage('シロコ、今どこにいる？')
        const senseiTalk = talkHistory.talkHistory.find((t) => t.type === 1 && t.content.includes('シロコ、今どこにいる？'))
        expect(senseiTalk).toBeDefined()
        expect(senseiTalk?.type).toBe(1)
        expect(senseiTalk?.time).toBeDefined()
    })

    it('formats time properly for chat messages with formatChatTime', () => {
        const testTimestamp = new Date(2026, 8, 23, 15, 30).getTime()
        expect(formatChatTime(testTimestamp)).toBe('15:30')
    })

    it('only flags Sensei messages as having Read (既読) indicator', () => {
        // Helper logic matching ChatDraggable template: element.type === 1 displays 既読
        const hasReadIndicator = (talk: Talk) => talk.type === 1 && !isMessageTyping(talk)

        const studentTalk: Talk = {
            Id: 1,
            Name: '砂狼シロコ',
            Avatar: 'shiroko.webp',
            type: 0,
            flag: 2,
            content: 'ん、先生。',
            time: Date.now()
        }

        const senseiTalk: Talk = {
            Id: 2,
            Name: 'sensei',
            Avatar: '',
            type: 1,
            flag: 2,
            content: 'お疲れ様',
            time: Date.now()
        }

        const typingTalk: Talk = {
            Id: 3,
            Name: 'sensei',
            Avatar: '',
            type: 1,
            flag: 2,
            content: '',
            time: Date.now()
        }

        expect(hasReadIndicator(studentTalk)).toBe(false)
        expect(hasReadIndicator(senseiTalk)).toBe(true)
    })
})

describe('Sending Image Together with Accompanying Message (TDD)', () => {
    beforeEach(() => {
        localStorage.clear()
        talkHistory.talkHistory = []
        talkHistory.talkId = 0
        store.text = ''
    })

    it('extractTextAndImage correctly parses text-only input', () => {
        const res = extractTextAndImage('こんにちは、シロコ！')
        expect(res.text).toBe('こんにちは、シロコ！')
        expect(res.imgInfo).toBeNull()
    })

    it('extractTextAndImage correctly parses pure base64 image data URL', () => {
        const sampleUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        const res = extractTextAndImage(sampleUrl)
        expect(res.text).toBe('')
        expect(res.imgInfo).not.toBeNull()
        expect(res.imgInfo?.mimeType).toBe('image/png')
        expect(res.imgInfo?.base64Data).toBe('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
    })

    it('extractTextAndImage correctly separates caption text from embedded image data URL', () => {
        const sampleUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
        const input = `海に来たよ！\n${sampleUrl}`
        const res = extractTextAndImage(input)
        expect(res.text).toBe('海に来たよ！')
        expect(res.imgInfo).not.toBeNull()
        expect(res.imgInfo?.mimeType).toBe('image/jpeg')
    })

    it('buildGeminiUserParts incorporates both image and accompanying user caption', () => {
        const sampleUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        const input = `これ見て！可愛い猫見つけたよ\n${sampleUrl}`
        const parts = buildGeminiUserParts(input)

        expect(parts.length).toBe(2)
        expect(parts[0].inlineData).toBeDefined()
        expect(parts[0].inlineData.mimeType).toBe('image/png')
        expect(parts[1].text).toContain('これ見て！可愛い猫見つけたよ')
        expect(parts[1].text).toContain('先生からこの画像が一緒に送られてきました')
    })

    it('sendImagePayload sends both image talk and text talk when caption is provided', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        talkHistory.loadStudentTalks(shiroko)
        const initialCount = talkHistory.talkHistory.length

        const sampleUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        sendImagePayload(1, sampleUrl, 2, 'この写真どう思う？')

        // Must have added 2 talks: 1 for image, 1 for text
        expect(talkHistory.talkHistory.length).toBe(initialCount + 2)

        const imgTalk = talkHistory.talkHistory[initialCount]
        const textTalk = talkHistory.talkHistory[initialCount + 1]

        expect(imgTalk.type).toBe(1)
        expect(imgTalk.content).toBe(sampleUrl)
        expect(imgTalk.time).toBeDefined()

        expect(textTalk.type).toBe(1)
        expect(textTalk.content).toContain('この写真どう思う？')
        expect(textTalk.time).toBeDefined()

        // Latest snippet of student conversation should reflect the text
        const snippet = getStudentLatestSnippet(shiroko as any)
        expect(snippet).toContain('この写真どう思う？')
    })

    it('sendImagePayload clears store.text when sending message alongside image', () => {
        const shiroko: baseStudent = { Id: 10010, Name: '砂狼シロコ', Avatar: 'shiroko.webp' }
        talkHistory.loadStudentTalks(shiroko)

        store.text = '添付テストメッセージ'
        const sampleUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

        sendImagePayload(1, sampleUrl, 2)

        expect(store.text).toBe('')
        const lastTalk = talkHistory.talkHistory[talkHistory.talkHistory.length - 1]
        expect(lastTalk.content).toContain('添付テストメッセージ')
    })
})

describe('Interruption Feature Removal & Preservation for Future (割り込み編集機能の一時削除) (TDD)', () => {
    const chatDraggablePath = path.resolve(__dirname, '../views/ChatView/ChatDraggable.vue')
    const chatViewPath = path.resolve(__dirname, '../views/ChatView/ChatView.vue')

    it('ChatDraggable.vue removes active insert button ↲ while preserving restoration notes', () => {
        const content = fs.readFileSync(chatDraggablePath, 'utf-8')
        const uncommentedContent = content.replace(/<!--[\s\S]*?-->/g, '')
        
        // Active (uncommented) insert button should be removed
        expect(uncommentedContent).not.toMatch(/<span\s+@click="setInsert\(element\.Id\)">↲<\/span>/)
        
        // Preservation note for future restoration must be present
        expect(content).toContain('【割り込み編集機能の復元用メモ】')
    })

    it('ChatDraggable.vue disables insert here indicator from active display', () => {
        const content = fs.readFileSync(chatDraggablePath, 'utf-8')
        const uncommentedContent = content.replace(/<!--[\s\S]*?-->/g, '')
        
        // Active (uncommented) insert-indicator should be commented out or removed
        expect(uncommentedContent).not.toMatch(/<div class="insert-indicator"/)
    })

    it('ChatView.vue preserves restoration notes for insertText and insertImage', () => {
        const content = fs.readFileSync(chatViewPath, 'utf-8')
        expect(content).toContain('【割り込み編集機能の復元用メモ】')
    })
})

describe('Streamlined Image Attachment Preview Bar (文字・送信ボタン削除) (TDD)', () => {
    const chatViewPath = path.resolve(__dirname, '../views/ChatView/ChatView.vue')

    it('removes unnecessary explanatory text "画像が添付されています" and subtext', () => {
        const content = fs.readFileSync(chatViewPath, 'utf-8')
        expect(content).not.toContain('画像が添付されています')
        expect(content).not.toContain('メッセージを入力して一緒に送信できます')
    })

    it('removes redundant "送信" button from the attachment bar', () => {
        const content = fs.readFileSync(chatViewPath, 'utf-8')
        expect(content).not.toContain('attachment-quick-send-btn')
    })

    it('keeps thumbnail image and remove button intact in the attachment bar', () => {
        const content = fs.readFileSync(chatViewPath, 'utf-8')
        expect(content).toContain('attachment-preview-wrapper')
        expect(content).toContain('attachment-remove-btn')
    })
})

describe('Lenient Content Moderation & Valid Model Configuration (規制緩和) (TDD)', () => {
    it('configures GEMINI_SAFETY_SETTINGS with BLOCK_NONE across all harassment and explicit content categories', () => {
        expect(GEMINI_SAFETY_SETTINGS).toBeDefined()
        expect(GEMINI_SAFETY_SETTINGS.length).toBeGreaterThanOrEqual(4)
        for (const setting of GEMINI_SAFETY_SETTINGS) {
            expect(setting.threshold).toBe('BLOCK_NONE')
        }
    })

    it('configures DEFAULT_GEMINI_MODELS with valid official Google Gemini endpoints', () => {
        expect(DEFAULT_GEMINI_MODELS).toBeDefined()
        expect(DEFAULT_GEMINI_MODELS).toContain('gemini-3.5-flash-lite')
        expect(DEFAULT_GEMINI_MODELS).not.toContain('gemini-3.6-flash')
    })
})

describe('Groq AI Provider Integration (TDD)', () => {
    const settingWindowPath = path.resolve(__dirname, '../views/DialogView/SettingWindow.vue')

    beforeEach(() => {
        localStorage.clear()
        store.getData()
        talkHistory.resetData()
        selectList.resetData()
    })

    it('instantiates GroqProvider with default model qwen/qwen3.8-27b and default base URL', () => {
        const groq = new GroqProvider('test-key')
        expect(groq.id).toBe('groq')
        expect(groq.name).toBe('Groq')
        expect(groq.getModel()).toBe(DEFAULT_GROQ_MODEL)
        expect(groq.getModel()).toBe('qwen/qwen3.8-27b')
        expect(groq.getBaseUrl()).toBe(DEFAULT_GROQ_BASE_URL)
        expect(groq.getBaseUrl()).toBe('https://api.groq.com/openai/v1')
    })

    it('getAIProvider returns GroqProvider when store.aiProvider is groq', () => {
        store.aiProvider = 'groq'
        store.aiApiKey = 'gsk_test123'
        store.aiModel = ''
        store.aiBaseUrl = ''

        const provider = getAIProvider()
        expect(provider.id).toBe('groq')
        expect(provider.name).toBe('Groq')
    })

    it('SettingWindow.vue has clean Groq radio option and label without extra text', () => {
        const content = fs.readFileSync(settingWindowPath, 'utf-8')
        expect(content).toContain('value="groq"')
        expect(content).toContain('<span class="radio-text">Groq</span>')
        expect(content).not.toContain('Groq (高速・緩和)')
        expect(content).toContain('openai/gpt-oss-120b')
    })

    it('store defaults to Groq provider with user-provided key', () => {
        expect(store.aiProvider).toBe('groq')
        expect(store.aiApiKey).toBe('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')
        expect(store.aiModel).toBe('qwen/qwen3.8-27b')
        expect(store.aiBaseUrl).toBe('https://api.groq.com/openai/v1')
    })

    it('defines GROQ_CANDIDATE_MODELS with qwen and gpt-oss fallback models', () => {
        expect(GROQ_CANDIDATE_MODELS).toBeDefined()
        expect(GROQ_CANDIDATE_MODELS).toContain('qwen/qwen3.8-27b')
        expect(GROQ_CANDIDATE_MODELS).toContain('openai/gpt-oss-120b')
    })

    it('automatically migrates legacy Gemini localStorage settings to Groq', () => {
        localStorage.setItem('ai-provider', JSON.stringify('gemini'))
        localStorage.setItem('ai-api-key', JSON.stringify('AIzaSyAikAWCjqAyLwZKq0xzP2wQFf3r7oK8kzQ'))

        store.getData()

        expect(store.aiProvider).toBe('groq')
        expect(store.aiApiKey).toBe('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')
        expect(store.aiModel).toBe('qwen/qwen3.8-27b')
        expect(store.aiBaseUrl).toBe('https://api.groq.com/openai/v1')
    })

    describe('formatAiErrorMessage (TDD)', () => {
        it('formats 503 over capacity error into friendly guidance message', async () => {
            const { formatAiErrorMessage } = await import('../assets/chatUtils/send')
            const err503 = new Error('Groq API error (503): {"error":{"message":"qwen/qwen3.8-27b is currently over capacity. Please try again and back off exponentially. Visit https://groqstatus.com to see if there is an active incident.","type":"internal_server_error"}}')
            const formatted = formatAiErrorMessage(err503)
            expect(formatted).toContain('回線が一時的に混み合っています')
            expect(formatted).toContain('最上位モデル (120B)')
            expect(formatted).not.toContain('{"error"')
        })

        it('formats 429 rate limit error into friendly cooldown message', async () => {
            const { formatAiErrorMessage } = await import('../assets/chatUtils/send')
            const err429 = new Error('Groq API error (429): Rate limit reached for model qwen/qwen3.8-27b on output tokens per minute (OTPM)')
            const formatted = formatAiErrorMessage(err429)
            expect(formatted).toContain('制限')
            expect(formatted).toContain('待ってから')
        })

        it('formats 401 unauthorized error into API key check message', async () => {
            const { formatAiErrorMessage } = await import('../assets/chatUtils/send')
            const err401 = new Error('Groq API error (401): Invalid API key provided')
            const formatted = formatAiErrorMessage(err401)
            expect(formatted).toContain('APIキー')
            expect(formatted).toContain('設定画面')
        })
    })

    describe('GroqProvider 503 Recovery & Fallback (TDD)', () => {
        const originalFetch = global.fetch

        afterEach(() => {
            global.fetch = originalFetch
        })

        it('falls back to candidate model when first model returns 503 over capacity', async () => {
            let callCount = 0
            const calledModels: string[] = []

            global.fetch = (async (url: string, opts: any) => {
                callCount++
                const body = JSON.parse(opts.body)
                calledModels.push(body.model)

                if (body.model === 'qwen/qwen3.8-27b') {
                    return {
                        ok: false,
                        status: 503,
                        text: async () => JSON.stringify({ error: { message: 'qwen/qwen3.8-27b is currently over capacity' } })
                    } as any
                }

                // Fallback to openai/gpt-oss-120b succeeds
                const stream = new ReadableStream({
                    start(controller) {
                        const encoder = new TextEncoder()
                        controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"ん、大丈夫。"}}]}\n\ndata: [DONE]\n\n'))
                        controller.close()
                    }
                })
                return {
                    ok: true,
                    status: 200,
                    body: stream
                } as any
            }) as any

            const groq = new GroqProvider('fake-key', 'qwen/qwen3.8-27b')
            let receivedChunk = ''
            const result = await groq.streamChat(
                'system prompt',
                [],
                '先生、元気？',
                (chunk) => { receivedChunk = chunk }
            )

            expect(calledModels).toContain('qwen/qwen3.8-27b')
            expect(calledModels).toContain('openai/gpt-oss-120b')
            expect(result).toBe('ん、大丈夫。')
            expect(receivedChunk).toBe('ん、大丈夫。')
        })
    })
})










