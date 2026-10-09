import type { LocalStudent } from './interface'

export interface FoldedStudents {
    /** 衣装違いを除いた生徒。基本生徒の Avatar には衣装違いのアイコンが追加済み */
    students: LocalStudent[]
    /** 統合された衣装違いのエントリ（基本生徒の Id ごと） */
    outfits: Map<number, LocalStudent[]>
    /** 衣装違いの Id → 基本生徒の Id */
    baseIdOf: Record<number, number>
    /** 基本生徒の Id → Avatar と同じ並びの衣装名（基本のアイコンは空文字） */
    avatarOutfits: Map<number, string[]>
}

/**
 * 衣装違い（Related を持つエントリ）を別の生徒として扱わず、基本生徒のアイコン候補として統合する。
 * 基本生徒が見つからないエントリは、消さずにそのまま残す。
 */
export function foldOutfitStudents(local: LocalStudent[]): FoldedStudents {
    const ids = new Set(local.map((s) => s.Id))
    const baseIdOf: Record<number, number> = {}
    const outfits = new Map<number, LocalStudent[]>()

    for (const item of local) {
        const baseId = item.Related?.ItemId
        if (baseId == null || baseId === item.Id || !ids.has(baseId)) continue
        baseIdOf[item.Id] = baseId
        const list = outfits.get(baseId) || []
        list.push(item)
        outfits.set(baseId, list)
    }

    const avatarOutfits = new Map<number, string[]>()
    const students = local
        .filter((item) => !(item.Id in baseIdOf))
        .map((item) => {
            const variants = outfits.get(item.Id)
            if (!variants) return item
            const avatars = [...item.Avatar]
            const labels = avatars.map(() => '')
            for (const variant of variants) {
                for (const avatar of variant.Avatar) {
                    if (avatars.includes(avatar)) continue
                    avatars.push(avatar)
                    labels.push(variant.Related?.ItemType || '')
                }
            }
            avatarOutfits.set(item.Id, labels)
            return { ...item, Avatar: avatars }
        })

    return { students, outfits, baseIdOf, avatarOutfits }
}

export interface OutfitMigrationTargets {
    talkHistory: {
        studentChatTimes: Record<number, number>
        unreadStudents: Record<number, number>
        pendingWakeups: Record<number, { studentId: number; studentName: string; userMessages: string[]; scheduledWakeTime: number }>
    }
    selectList: { selectList: Array<{ Id: number; Name: string; Avatar: string }> }
    ranks?: Record<number, number>
}

const readJson = (storage: Storage, key: string): any => {
    try {
        const raw = storage.getItem(key)
        return raw == null ? null : JSON.parse(raw)
    } catch {
        return null
    }
}

const hasInteraction = (talks: any[]) => talks.some((t) => t && t.type === 1) || talks.length > 1

/**
 * 以前に保存された「衣装違いの生徒」のデータを基本生徒へ移す。
 * チャット履歴・最終チャット時刻・未読・起床待ち・選択履歴・親密度が対象。
 * 既に基本生徒側にデータがある場合は、失わないように統合する。
 */
export function migrateOutfitStorage(
    baseIdOf: Record<number, number>,
    baseNames: Record<number, string>,
    targets: OutfitMigrationTargets,
    storage: Storage = localStorage
): number {
    let migrated = 0
    const variantIds = Object.keys(baseIdOf).map(Number)
    let chatTimesChanged = false
    let unreadChanged = false
    let wakeupsChanged = false
    let ranksChanged = false

    for (const variantId of variantIds) {
        const baseId = baseIdOf[variantId]
        const variantKey = 'momotalk_chat_' + variantId
        const baseKey = 'momotalk_chat_' + baseId

        const variantTalks = readJson(storage, variantKey)
        if (variantTalks !== null) {
            const baseTalks = readJson(storage, baseKey)
            if (!Array.isArray(variantTalks)) {
                // 壊れたデータは移さない
            } else if (!Array.isArray(baseTalks)) {
                storage.setItem(baseKey, JSON.stringify(variantTalks))
                migrated++
            } else if (hasInteraction(variantTalks)) {
                const merged = [...baseTalks, ...variantTalks]
                    .map((t, i) => ({ t, i }))
                    .sort((a, b) => (a.t?.time || 0) - (b.t?.time || 0) || a.i - b.i)
                    .map(({ t }, index) => ({ ...t, Id: index }))
                storage.setItem(baseKey, JSON.stringify(merged))
                migrated++
            }
            storage.removeItem(variantKey)
        }

        const times = targets.talkHistory.studentChatTimes
        if (variantId in times) {
            times[baseId] = Math.max(times[baseId] || 0, times[variantId] || 0)
            delete times[variantId]
            chatTimesChanged = true
        }

        const unread = targets.talkHistory.unreadStudents
        if (variantId in unread) {
            unread[baseId] = (Number(unread[baseId]) || 0) + (Number(unread[variantId]) || 0)
            delete unread[variantId]
            unreadChanged = true
        }

        const wakeups = targets.talkHistory.pendingWakeups
        const wakeup = wakeups[variantId]
        if (wakeup) {
            const existing = wakeups[baseId]
            if (existing) {
                existing.userMessages.push(...wakeup.userMessages)
                existing.scheduledWakeTime = Math.max(existing.scheduledWakeTime, wakeup.scheduledWakeTime)
            } else {
                wakeups[baseId] = { ...wakeup, studentId: baseId, studentName: baseNames[baseId] || wakeup.studentName }
            }
            delete wakeups[variantId]
            wakeupsChanged = true
        }

        const ranks = targets.ranks
        if (ranks && variantId in ranks) {
            ranks[baseId] = Math.max(ranks[baseId] || 1, ranks[variantId] || 1)
            delete ranks[variantId]
            ranksChanged = true
        }
    }

    // 選択履歴: 選んだアイコン（Avatar）はそのまま、Id と名前だけ基本生徒に合わせる
    const history = readJson(storage, 'selectHistory')
    const listsToFix: Array<Array<{ Id: number; Name: string; Avatar: string }>> = [targets.selectList.selectList]
    if (Array.isArray(history)) listsToFix.push(history)
    listsToFix.forEach((list, listIndex) => {
        let changed = false
        const seen = new Set<string>()
        const next = list.filter((entry) => {
            if (entry.Id in baseIdOf) {
                entry.Id = baseIdOf[entry.Id]
                entry.Name = baseNames[entry.Id] || entry.Name
                changed = true
            }
            const key = `${entry.Id}|${entry.Avatar}`
            if (seen.has(key)) {
                changed = true
                return false
            }
            seen.add(key)
            return true
        })
        if (!changed) return
        migrated++
        if (listIndex === 0) {
            list.splice(0, list.length, ...next)
        } else {
            storage.setItem('selectHistory', JSON.stringify(next))
        }
    })

    if (chatTimesChanged) storage.setItem('momotalk_chat_times', JSON.stringify(targets.talkHistory.studentChatTimes))
    if (unreadChanged) storage.setItem('momotalk_unread', JSON.stringify(targets.talkHistory.unreadStudents))
    if (wakeupsChanged) storage.setItem('momotalk_pending_wakeups', JSON.stringify(targets.talkHistory.pendingWakeups))
    if (ranksChanged && targets.ranks) storage.setItem('student-ranks', JSON.stringify(targets.ranks))

    return migrated
}
