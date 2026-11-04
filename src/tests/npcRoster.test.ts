import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, isPromptSupported, resolveCanonicalStudent } from '../assets/ai/prompts'
import { getCharacterVisualProfile } from '../assets/imageGen/characterDictionary'
import { STUDENT_SLEEP_SCHEDULES } from '../assets/ai/sleepSchedule'

// 追加した24人（docs/npc-research/）
const NPC_IDS = [270, 253, 385, 390, 183, 168, 171, 169, 184, 275, 276, 105, 174, 331, 321, 322, 386, 26017, 964, 515, 288, 165, 193, 367]
const LANGS = ['jp', 'kr', 'en', 'zh', 'tw'] as const

describe('追加NPC24人', () => {
    it('全員が対応済みで、5言語のプロンプトに自分の名前が入る', () => {
        for (const id of NPC_IDS) {
            const c = resolveCanonicalStudent(id)!
            expect(c, `id ${id}`).toBeTruthy()
            expect(isPromptSupported(id)).toBe(true)
            for (const l of LANGS) {
                const p = buildSystemPrompt({ Id: id, Name: c.names.jp[0], Avatar: '' } as any, l)
                expect(p, `${c.names.jp[0]}[${l}]`).toContain(c.names[l][0] ?? c.names.jp[0])
            }
        }
    })
    it('見た目プロフィールは目の色まで入っていて、生活リズムも解決できる', () => {
        for (const id of NPC_IDS) {
            const v = getCharacterVisualProfile(id)
            expect(v.characterTag).not.toBe('kivotos_student_(blue_archive)')
            expect(v.eyes.length).toBeGreaterThanOrEqual(1)
            expect(STUDENT_SLEEP_SCHEDULES[resolveCanonicalStudent(id)!.names.jp[0]], `sleep ${id}`).toBeTruthy()
        }
    })
    it('非日本語のプロンプトには他の生徒の公式表記が入る', () => {
        const p = buildSystemPrompt({ Id: 10118, Name: 'ノゾミ', Avatar: '' } as any, 'zh')
        expect(p).toContain('Names in this language')
        expect(p).toContain('光')
    })
})
