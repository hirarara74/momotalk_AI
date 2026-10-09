import { describe, expect, it } from 'vitest'
import { buildSystemPrompt, getStudentGreeting, isPromptSupported, resolveCanonicalStudent,
    STUDENT_CANONICAL_DATA, PROMPT_SUPPORTED_STUDENT_IDS } from '../assets/ai/prompts'
import { getCharacterVisualProfile } from '../assets/imageGen/characterDictionary'
import { normalizeStudentReply } from '../assets/ai/normalizeStudentReply'

describe('Distinct student expansion and dialogue formatting', () => {
    const ids = [13005, 20039, 20041, 10015, 10033, 20020, 13008, 13004]
    it('does not confuse distinct students with partial names or words in outfit names', () => {
        for (const name of ['サキ', 'ヒナタ', 'ウミカ', 'ジュリ（アルバイト）']) {
            expect(isPromptSupported(name)).toBe(false)
            expect(resolveCanonicalStudent(name)).toBeUndefined()
        }
        expect(resolveCanonicalStudent('キサキ（水着）')?.id).toBe(20039)
        expect(resolveCanonicalStudent('シロコ＊テラー')?.id).toBe(10010)
    })
    it.each(ids)('supports student %s across all languages, with a unique visual profile', id => {
        const student = resolveCanonicalStudent(id)!
        expect(PROMPT_SUPPORTED_STUDENT_IDS).toContain(id)
        for (const lang of ['jp', 'en', 'kr', 'zh', 'tw'] as const) {
            expect(isPromptSupported({ Id: id, Name: student.names[lang][0] })).toBe(true)
            expect(getStudentGreeting(id, lang)).toBe(student.greetings[lang])
            const prompt = buildSystemPrompt({ Id: id, Name: student.names[lang][0], Avatar: '' }, lang)
            expect(prompt).toContain(student.names.jp[1])
            expect(prompt).toContain('他の生徒との関係性')
            expect(prompt).toContain('先生との関係性')
            expect(prompt).toContain('Do not wrap your reply')
            expect(prompt).not.toMatch(/^\s*- 「.*」$/m)
            expect(getCharacterVisualProfile(student.names[lang][0])).toBe(getCharacterVisualProfile(id))
        }
        expect(getCharacterVisualProfile(id).characterTag).not.toContain('kivotos_student')
    })
    it('keeps the same output rules for every existing student and generic fallbacks', () => {
        expect(new Set(STUDENT_CANONICAL_DATA.map(s => s.id)).size).toBe(31)
        for (const student of [...STUDENT_CANONICAL_DATA.map(s => ({ Id: s.id, Name: s.names.jp[0], Avatar: '' })),
            { Id: 99999, Name: '未知の生徒', Avatar: '' }]) {
            for (const lang of ['jp', 'en', 'kr', 'zh', 'tw']) {
                const prompt = buildSystemPrompt(student, lang)
                expect(prompt).toContain('Do not wrap your reply')
                expect(prompt).not.toMatch(/^\s*- 「.*」$/m)
            }
        }
    })
    it.each([
        ['「先生、お疲れ様です。」', '先生、お疲れ様です。'],
        ['『こんにちは！』', 'こんにちは！'],
        ['"Hello, Sensei!"', 'Hello, Sensei!'],
        ['「先生、おはよう。\n今日はいい天気だね。」', '先生、おはよう。\n今日はいい天気だね。'],
        ['先生が「休んで」と言ってくれて嬉しいです。', '先生が「休んで」と言ってくれて嬉しいです。'],
        ['「おはよう」「先生」', '「おはよう」「先生」'],
        ['先生！ [PHOTO: smile]', '先生！ [PHOTO: smile]']
    ])('normalizes %s without losing embedded quotes or photo directives', (input, expected) => {
        expect(normalizeStudentReply(input)).toBe(expected)
    })
})
