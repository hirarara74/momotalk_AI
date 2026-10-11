import { describe, it, expect } from 'vitest'
import { buildSystemPrompt, getStudentGreeting, isPromptSupported, SPECIAL_PROMPTS } from '../assets/ai/prompts'
import { ROSTER_STUDENTS } from '../assets/ai/rosterStudents'

describe('rosterStudents: 追加した117人', () => {
    it('12人が一意で、対応済みと判定される', () => {
        expect(ROSTER_STUDENTS).toHaveLength(117)
        expect(new Set(ROSTER_STUDENTS.map((r) => r.id)).size).toBe(117)
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

import { isSupportedVisualStudent, getCharacterVisualProfile } from '../assets/imageGen/characterDictionary'
import { getStudentSleepSchedule, DEFAULT_SLEEP_SCHEDULE } from '../assets/ai/sleepSchedule'

describe('rosterStudents: 見た目タグと就寝スケジュール', () => {
    it('追加した全員が見た目辞書に載り、名前（全言語）からも引ける', () => {
        for (const r of ROSTER_STUDENTS) {
            expect(isSupportedVisualStudent(r.id)).toBe(true)
            for (const n of Object.values(r.names).flat()) {
                expect(getCharacterVisualProfile(n).characterTag).toBe(getCharacterVisualProfile(r.id).characterTag)
            }
        }
    })

    it('追加した全員が既定ではない専用の就寝スケジュールを持つ', () => {
        for (const r of ROSTER_STUDENTS) {
            const s = getStudentSleepSchedule({ Name: r.jpName })
            expect(s).not.toBe(DEFAULT_SLEEP_SCHEDULE)
            expect(getStudentSleepSchedule(r.names.jp[r.names.jp.length - 1])).toBe(s)
        }
    })
})

describe('Wiki 照合の反映: 先生の呼び方と共通ルール', () => {
    it('呼び方が違う生徒には、全言語で既定の呼び名ではなく専用の呼び名を使わせる', () => {
        const eri = buildSystemPrompt({ Id: 10125, Name: 'エリ', Avatar: '' } as any, 'jp')
        expect(eri).toContain('[ADDRESS')
        expect(eri).toContain('"マスター"')
        const sumireEn = buildSystemPrompt({ Id: 10012, Name: 'スミレ', Avatar: '' } as any, 'en')
        expect(sumireEn).toContain('Always call the user "Trainer"')
        expect(sumireEn).toContain('call user "Trainer"!')
        expect(sumireEn).not.toContain('call user "Sensei"')
    })

    it('既定の呼び方の生徒には上書きを入れず、全員に世界観・一貫性のルールを入れる', () => {
        const kei = buildSystemPrompt({ Id: 10135, Name: 'ケイ', Avatar: '' } as any, 'jp')
        expect(kei).not.toContain('[ADDRESS')
        expect(kei).toContain('[WORLD & CONSISTENCY')
        const shiroko = buildSystemPrompt({ Id: 10010, Name: 'シロコ', Avatar: '' } as any, 'kr')
        expect(shiroko).toContain('[WORLD & CONSISTENCY')
        expect(shiroko).toContain('Always call the user "선생님"')
    })

    it('Wiki の記述に合わせた修正が入っている（部活名・学年・性格）', () => {
        const get = (id: number) => buildSystemPrompt({ Id: id, Name: ROSTER_STUDENTS.find((r) => r.id === id)!.jpName, Avatar: '' } as any, 'jp')
        expect(get(13009)).toContain('修行部')
        expect(get(13009)).not.toContain('行儀見習い部')
        expect(get(10037)).toContain('クーデター')
        expect(get(10128)).not.toContain('芸術家気取り')
        expect(get(10117)).toContain('丁寧で落ち着いた')
    })
})

describe('一人称・呼び方・所属の確定（ピクシブ百科事典・ニコニコ大百科）', () => {
    const prompt = (id: number) => buildSystemPrompt({ Id: id, Name: ROSTER_STUDENTS.find((r) => r.id === id)!.jpName, Avatar: '' } as any, 'jp')
    it('公式の一人称が確認できた生徒は、その一人称を使う', () => {
        expect(prompt(10017)).toContain('一人称: おいら')
        expect(prompt(10018)).toContain('一人称: わたし')
        expect(prompt(13012)).toContain('一人称: 本官')
        expect(prompt(20050)).toContain('一人称: ボク')
        expect(prompt(10137)).toContain('一人称: あたし')
        expect(prompt(16018)).toContain('一人称: うち')
        expect(prompt(20002)).toContain('なのだ')
        expect(prompt(10081)).toContain('身共')
    })
    it('チェリノは先生をカムラッドと呼ぶ', () => {
        const p = buildSystemPrompt({ Id: 10017, Name: 'チェリノ', Avatar: '' } as any, 'jp')
        expect(p).toContain('"カムラッド"')
    })
    it('レイは野球部の4番バッターで、トレーニング部に仮入部している', () => {
        const p = prompt(10115)
        expect(p).toContain('野球部')
        expect(p).toContain('仮入部')
        expect(p).toContain('4番バッター')
    })
})
