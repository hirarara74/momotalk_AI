import { describe, it, expect } from 'vitest'
import { foldOutfitStudents, migrateOutfitStorage } from '@/assets/requestUtils/outfits'
import type { LocalStudent } from '@/assets/requestUtils/interface'

const make = (Id: number, Avatar: string[], related: number | null = null): LocalStudent => ({
    Id,
    Avatar,
    Name: { jp: `s${Id}` },
    Bio: { jp: '' },
    Nickname: [`n${Id}`],
    Birthday: '1/1',
    Age: '',
    School: 'Trinity',
    Club: '',
    Star: 3,
    Released: true,
    Related: related === null ? null : { ItemId: related, ItemType: '水着' }
})

const memoryStorage = (init: Record<string, string> = {}): Storage => {
    const data = new Map(Object.entries(init))
    return {
        getItem: (k: string) => (data.has(k) ? data.get(k)! : null),
        setItem: (k: string, v: string) => void data.set(k, String(v)),
        removeItem: (k: string) => void data.delete(k),
        clear: () => data.clear(),
        key: (i: number) => [...data.keys()][i] ?? null,
        get length() {
            return data.size
        }
    } as Storage
}

describe('foldOutfitStudents', () => {
    it('removes outfit students and appends their icons to the base student', () => {
        const { students, baseIdOf } = foldOutfitStudents([
            make(1, ['a', 'b']),
            make(2, ['c', 'd'], 1),
            make(3, ['e'])
        ])
        expect(students.map((s) => s.Id)).toEqual([1, 3])
        expect(students[0].Avatar).toEqual(['a', 'b', 'c', 'd'])
        expect(baseIdOf).toEqual({ 2: 1 })
    })

    it('does not duplicate icons and does not mutate the source', () => {
        const base = make(1, ['a'])
        const { students } = foldOutfitStudents([base, make(2, ['a', 'c'], 1)])
        expect(students[0].Avatar).toEqual(['a', 'c'])
        expect(base.Avatar).toEqual(['a'])
    })

    it('keeps an outfit student whose base is missing', () => {
        const { students, baseIdOf } = foldOutfitStudents([make(2, ['c'], 99)])
        expect(students.map((s) => s.Id)).toEqual([2])
        expect(baseIdOf).toEqual({})
    })
})

describe('migrateOutfitStorage', () => {
    const talks = (n: number, startTime: number) =>
        Array.from({ length: n }, (_, i) => ({ Id: i, type: i % 2, content: `m${i}`, time: startTime + i, Name: 'x', Avatar: 'a', flag: 1 }))

    it('moves chat, unread, ranks and selection history to the base student', () => {
        const storage = memoryStorage({
            momotalk_chat_2: JSON.stringify(talks(3, 100)),
            selectHistory: JSON.stringify([{ Id: 2, Name: '水着', Avatar: 'c' }])
        })
        const targets = {
            talkHistory: {
                studentChatTimes: { 2: 500 } as Record<number, number>,
                unreadStudents: { 1: 1, 2: 2 } as Record<number, number>,
                pendingWakeups: {}
            },
            selectList: { selectList: [{ Id: 2, Name: '水着', Avatar: 'c' }] },
            ranks: { 2: 4 } as Record<number, number>
        }
        migrateOutfitStorage({ 2: 1 }, { 1: 'base' }, targets, storage)

        expect(storage.getItem('momotalk_chat_2')).toBeNull()
        expect(JSON.parse(storage.getItem('momotalk_chat_1')!)).toHaveLength(3)
        expect(targets.talkHistory.studentChatTimes).toEqual({ 1: 500 })
        expect(targets.talkHistory.unreadStudents).toEqual({ 1: 3 })
        expect(targets.ranks).toEqual({ 1: 4 })
        // the chosen icon is kept; only the owner changes
        expect(targets.selectList.selectList).toEqual([{ Id: 1, Name: 'base', Avatar: 'c' }])
        expect(JSON.parse(storage.getItem('selectHistory')!)).toEqual([{ Id: 1, Name: 'base', Avatar: 'c' }])
    })

    it('merges into existing base chat in time order without losing messages', () => {
        const storage = memoryStorage({
            momotalk_chat_1: JSON.stringify(talks(2, 1000)),
            momotalk_chat_2: JSON.stringify(talks(3, 100))
        })
        const targets = { talkHistory: { studentChatTimes: {}, unreadStudents: {}, pendingWakeups: {} }, selectList: { selectList: [] } }
        migrateOutfitStorage({ 2: 1 }, {}, targets, storage)
        const merged = JSON.parse(storage.getItem('momotalk_chat_1')!)
        expect(merged).toHaveLength(5)
        expect(merged.map((t: any) => t.time)).toEqual([100, 101, 102, 1000, 1001])
        expect(merged.map((t: any) => t.Id)).toEqual([0, 1, 2, 3, 4])
    })

    it('drops an untouched outfit greeting instead of duplicating it into the base chat', () => {
        const storage = memoryStorage({
            momotalk_chat_1: JSON.stringify(talks(2, 1000)),
            momotalk_chat_2: JSON.stringify([{ Id: 0, type: 0, content: 'hi', time: 1, Name: 'x', Avatar: 'a', flag: 2 }])
        })
        const targets = { talkHistory: { studentChatTimes: {}, unreadStudents: {}, pendingWakeups: {} }, selectList: { selectList: [] } }
        migrateOutfitStorage({ 2: 1 }, {}, targets, storage)
        expect(JSON.parse(storage.getItem('momotalk_chat_1')!)).toHaveLength(2)
        expect(storage.getItem('momotalk_chat_2')).toBeNull()
    })
})
