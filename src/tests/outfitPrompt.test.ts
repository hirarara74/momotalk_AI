import { describe, it, expect, beforeEach } from 'vitest'
import { buildSystemPrompt, getOutfitDirective } from '@/assets/ai/prompts'
import { registerOutfitAvatars } from '@/assets/requestUtils/outfitRegistry'
import { foldOutfitStudents } from '@/assets/requestUtils/outfits'
import type { LocalStudent } from '@/assets/requestUtils/interface'

const make = (Id: number, Avatar: string[], related: number | null = null, type = '水着'): LocalStudent => ({
    Id, Avatar, Name: { jp: `s${Id}` }, Bio: { jp: '' }, Nickname: [], Birthday: '', Age: '', School: '',
    Club: '', Star: 3, Released: true, Related: related === null ? null : { ItemId: related, ItemType: type }
})

describe('outfit-aware system prompt', () => {
    const base = { Id: 10020, Name: '下江コハル', Avatar: '/base.webp' }
    beforeEach(() => {
        registerOutfitAvatars('/base.webp', '')
        registerOutfitAvatars('/swim.webp', '水着')
    })

    it('adds no outfit section for the base icon', () => {
        expect(buildSystemPrompt(base, 'jp')).not.toContain('現在の衣装設定')
    })

    it('adds the outfit section when an outfit icon is selected, keeping the character prompt', () => {
        const normal = buildSystemPrompt(base, 'jp')
        const swim = buildSystemPrompt({ ...base, Avatar: '/swim.webp' }, 'jp')
        expect(swim).toContain('現在の衣装設定')
        expect(swim).toContain('「水着」の姿')
        expect(swim).toContain('性格・口調・一人称・先生への呼び方は一切変えない')
        // the character settings are identical; only the outfit section differs
        expect(swim.replace(/\n\n#現在の衣装設定[\s\S]*?(?=\n\n\[OUTPUT FORMAT)/, '')).toBe(normal)
    })

    it('falls back to a generic line for an unknown outfit', () => {
        expect(getOutfitDirective('未知の衣装')).toContain('未知の衣装の衣装を着ている')
        expect(getOutfitDirective('')).toBe('')
    })

    it('labels folded avatars by outfit type', () => {
        const { avatarOutfits } = foldOutfitStudents([
            make(1, ['a', 'b']),
            make(2, ['c'], 1, '水着'),
            make(3, ['d'], 1, 'バニーガール')
        ])
        expect(avatarOutfits.get(1)).toEqual(['', '', '水着', 'バニーガール'])
    })
})
