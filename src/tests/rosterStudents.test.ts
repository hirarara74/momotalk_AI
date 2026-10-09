import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, getStudentGreeting, isPromptSupported, SPECIAL_PROMPTS } from '../assets/ai/prompts'
import { ROSTER_STUDENTS } from '../assets/ai/rosterStudents'

describe('rosterStudents: 人気上位の12人', () => {
    it('12人が一意で、対応済みと判定される', () => {
        expect(ROSTER_STUDENTS).toHaveLength(12)
        expect(new Set(ROSTER_STUDENTS.map((r) => r.id)).size).toBe(12)
        for (const r of ROSTER_STUDENTS) {
            expect(isPromptSupported(r.id)).toBe(true)
            expect(isPromptSupported({ Id: r.id, Name: r.jpName })).toBe(true)
        }
    })

    it('各生徒が専用プロンプトと5言語の挨拶を持つ', () => {
        for (const r of ROSTER_STUDENTS) {
            expect(SPECIAL_PROMPTS[r.jpName]).toContain(r.prompt.slice(0, 20))
            for (const lang of ['jp', 'en', 'kr', 'zh', 'tw']) {
                expect(getStudentGreeting(r.id, lang).length).toBeGreaterThan(0)
            }
            const built = buildSystemPrompt({ Id: r.id, Name: r.jpName, Avatar: '' } as any, 'jp')
            expect(built).toContain('セリフ例')
        }
    })

    it('衣装違いの接尾辞でも基本生徒として解決され、部分一致で別人にならない', () => {
        expect(isPromptSupported('ハナコ（水着）')).toBe(true)
        expect(isPromptSupported('ニコニコ')).toBe(false)
    })
})
