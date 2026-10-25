import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, STUDENT_CANONICAL_DATA } from '../assets/ai/prompts'
import { Traditionalized } from '../assets/utils/tw_cn'

const LANGS = ['jp', 'kr', 'en', 'zh', 'tw'] as const

describe('Traditionalized (zh -> tw)', () => {
    it('keeps Taiwan wording for ambiguous characters', () => {
        expect(Traditionalized('同志')).toBe('同志')
        expect(Traditionalized('联系')).toBe('聯繫')
        expect(Traditionalized('方面')).toBe('方面')
        expect(Traditionalized('切里诺')).toBe('切裡諾')
        expect(Traditionalized('锻炼')).toBe('鍛鍊')
        expect(Traditionalized('老师')).toBe('老師')
    })
})

describe('non-Japanese system prompts', () => {
    for (const lang of ['kr', 'en', 'zh', 'tw']) {
        it(`${lang}: no leftover Japanese language tag or reply instruction`, () => {
            for (const name of ['アル', 'ネル', 'キサキ', 'ホシノ', 'エイミ']) {
                const p = buildSystemPrompt({ Id: 0, Name: name, Avatar: '' } as any, lang)
                expect(p).not.toMatch(/lang:ja/)
                expect(p).not.toContain('返答してください')
                expect(p).not.toContain('返信を1〜3文で送る')
                expect(p).toContain('Voice reference')
            }
        })
    }
    it('jp prompt keeps lang:ja', () => {
        expect(buildSystemPrompt({ Id: 0, Name: 'アル', Avatar: '' } as any, 'jp')).toMatch(/lang:ja/)
    })
})

describe('greetings use the same form of address as callSensei', () => {
    it('every student, every language', () => {
        const bad: string[] = []
        for (const c of STUDENT_CANONICAL_DATA) {
            for (const l of LANGS) {
                if (!c.greetings[l].includes(c.callSensei[l])) bad.push(`${c.names.jp[0]}[${l}]`)
            }
        }
        expect(bad).toEqual([])
    })
})
