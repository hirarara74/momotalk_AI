import { reactive } from 'vue'
import { Talk, baseStudent, studentInfo } from '../requestUtils/interface'
import { historyState } from './historyState'
import { getStudentGreeting } from '../ai/prompts'
import { abortStreaming } from '../chatUtils/send'

const isSameChar_ = (talk0: Talk, talk1: Talk) => {
    if (talk0.type !== talk1.type) return false
    return talk0.Name === talk1.Name && talk0.Avatar === talk1.Avatar
}

const initChatTimes = (): Record<number, number> => {
    try {
        if (typeof localStorage !== 'undefined') {
            const item = localStorage.getItem('momotalk_chat_times')
            return item ? JSON.parse(item) : {}
        }
    } catch {
        // ignore
    }
    return {}
}

export interface PendingWakeupItem {
    studentId: number
    studentName: string
    userMessages: string[]
    scheduledWakeTime: number
}

const initPendingWakeups = (): Record<number, PendingWakeupItem> => {
    try {
        if (typeof localStorage !== 'undefined') {
            const item = localStorage.getItem('momotalk_pending_wakeups')
            return item ? JSON.parse(item) : {}
        }
    } catch {
        // ignore
    }
    return {}
}

export const talkHistory = reactive({
    talkHistory: [] as Talk[],
    talkId: 0,
    currentStudentId: 0,
    studentChatTimes: initChatTimes(),
    pendingWakeups: initPendingWakeups(),
    lastChatUpdate: 0,

    enqueuePendingWakeup(studentId: number, studentName: string, userMessage: string, scheduledWakeTime: number) {
        if (!this.pendingWakeups[studentId]) {
            this.pendingWakeups[studentId] = {
                studentId,
                studentName,
                userMessages: [userMessage],
                scheduledWakeTime
            }
        } else {
            this.pendingWakeups[studentId].userMessages.push(userMessage)
            this.pendingWakeups[studentId].scheduledWakeTime = scheduledWakeTime
        }
        this.savePendingWakeups()
    },

    getPendingWakeup(studentId: number): PendingWakeupItem | undefined {
        return this.pendingWakeups[studentId]
    },

    removePendingWakeup(studentId: number) {
        delete this.pendingWakeups[studentId]
        this.savePendingWakeups()
    },

    savePendingWakeups() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('momotalk_pending_wakeups', JSON.stringify(this.pendingWakeups))
            } catch (e) {
                console.error('Failed to save pending wakeups:', e)
            }
        }
    },

    getStudentLastChatTime(studentId: number): number {
        if (this.studentChatTimes[studentId]) {
            return this.studentChatTimes[studentId]
        }
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('momotalk_chat_' + studentId)
            if (saved) {
                try {
                    const talks: Talk[] = JSON.parse(saved)
                    const hasInteraction = talks.some(t => t.type === 1) || talks.length > 1
                    if (hasInteraction) {
                        const times = talks.map(t => t.time).filter((t): t is number => typeof t === 'number')
                        if (times.length > 0) {
                            return Math.max(...times)
                        }
                        return 1
                    }
                } catch {
                    // ignore
                }
            }
        }
        return 0
    },

    isSameChar(i: number, j: number) {
        const talk0: Talk = this.talkHistory[i]
        const talk1: Talk = this.talkHistory[j]
        return isSameChar_(talk0, talk1)
    },
    checkMove(i: number, j: number) {
        const len = this.talkHistory.length
        if (this.talkHistory[i].type <= 1) {
            if (i > 0 && this.isSameChar(i - 1, i)) this.setTalkFlag(i, 0)
            else this.setTalkFlag(i, 2)
        }
        if (i < len - 1 && this.talkHistory[i + 1].type <= 1) {
            if (this.isSameChar(i, i + 1)) this.setTalkFlag(i + 1, 0)
            else this.setTalkFlag(i + 1, 2)
        }
        if (this.talkHistory[j].type <= 1) {
            if (j > 0 && this.isSameChar(j - 1, j)) this.setTalkFlag(j, 0)
            else this.setTalkFlag(j, 2)
        }
        if (j < len - 1 && this.talkHistory[j + 1].type <= 1) {
            if (this.isSameChar(j, j + 1)) this.setTalkFlag(j + 1, 0)
            else this.setTalkFlag(j + 1, 2)
        }
        this.setData()
    },

    getTalkIndexById(id: number) {
        return this.talkHistory.findIndex((item: Talk) => item.Id === id)
    },
    getTalkById(id: number) {
        return this.talkHistory[this.getTalkIndexById(id)]
    },

    deleteTalkByIndex(index: number) {
        const len = this.talkHistory.length
        if (index >= 0 && index < len - 1 && this.talkHistory[index + 1].type <= 1)
            if (index === 0 || !this.isSameChar(index + 1, index - 1))
                this.setTalkFlag(index + 1, 2)
            else if (this.isSameChar(index + 1, index - 1) && this.talkHistory[index+1].flag === 2)
                this.setTalkFlag(index + 1, 0)

        this.talkHistory.splice(index, 1)
        this.setData()
    },
    deleteTalkById(id: number) {
        const index: number = this.getTalkIndexById(id)
        this.deleteTalkByIndex(index)
    },

    insertTalkByIndex(index: number, talk: Talk) {
        const prevTalk = this.talkHistory[index]
        const nextTalk =
            index === this.talkHistory.length - 1 ? null : this.talkHistory[index + 1]

        if (isSameChar_(talk, prevTalk)) {
            talk.flag = 0
        }
        if (nextTalk) {
            if (isSameChar_(talk, nextTalk) && nextTalk.flag === 2) {
                this.talkHistory[index + 1].flag = 0
            } else if (!isSameChar_(talk, nextTalk) && nextTalk.flag < 2) {
                this.talkHistory[index + 1].flag = 2
            }
        }
        this.talkHistory.splice(index + 1, 0, talk)

        this.setData()
    },
    insertTalkById(id: number, talk: Talk) {
        const insertIndex = this.getTalkIndexById(id)
        this.insertTalkByIndex(insertIndex, talk)
    },

    pushTalk(talk: Talk) {
        if (!talk.time) {
            talk.time = Date.now()
        }
        const len = this.talkHistory.length
        const lastTalk = this.talkHistory[len - 1]

        if (len === 0 || !isSameChar_(talk, lastTalk)) this.talkHistory.push(talk)
        else if (talk.flag === 2) {
            talk.flag = 0
            this.talkHistory.push(talk)
        } else {
            this.talkHistory.push(talk)
        }

        if (talk.type === 1 && this.currentStudentId) {
            recordStudentInteraction(this.currentStudentId, talk.time)
        }

        this.setData()
    },
    
    setTalkContent(id: number, content: string) {
        const index: number = this.getTalkIndexById(id)
        this.talkHistory[index].content = content
        this.setData()
    },
    setTalkName(id: number, name: string) {
        const index: number = this.getTalkIndexById(id)
        this.talkHistory[index].Name = name
        this.setData()
    },
    setTalkFlag(index: number, flag: number) {
        this.talkHistory[index].flag = flag
        this.setData()
    },

    setData() {
        localStorage.setItem('talkHistory', JSON.stringify(this.talkHistory))
        localStorage.setItem('talkId', JSON.stringify(this.talkId))
        if (JSON.stringify(this.talkHistory) !== JSON.stringify(historyState.value()))
            historyState.push(this.talkHistory)
    },
    getData() {
        const data = ['talkHistory', 'talkId'].map(x => localStorage.getItem(x))
        this.talkHistory = data[0] != null ? JSON.parse(data[0]) : ([] as Talk[])
        this.talkId = data[1] != null ? JSON.parse(data[1]) : 0
        historyState.push(this.talkHistory)
    },
    resetData() {
        this.talkHistory = [] as Talk[]
        this.talkId = 0 as number
        this.currentStudentId = 0
        this.studentChatTimes = {}
        this.lastChatUpdate = Date.now()
        this.setData()
    },
    undo() {
        this.talkHistory = historyState.undo()
    },
    redo() {
        this.talkHistory = historyState.redo()
    },

    loadStudentTalks(student: baseStudent | studentInfo | any) {
        if (!student || !student.Id) return
        // Save previously active student's talks if any and abort active streaming
        if (this.currentStudentId && this.currentStudentId !== student.Id) {
            abortStreaming()
            this.saveCurrentStudentTalks()
        }

        this.currentStudentId = student.Id
        const savedData = localStorage.getItem('momotalk_chat_' + student.Id)

        if (savedData != null) {
            try {
                this.talkHistory = JSON.parse(savedData)
                if (this.talkHistory.length > 0) {
                    const maxId = Math.max(...this.talkHistory.map((t) => t.Id || 0))
                    this.talkId = maxId + 1
                    if (this.talkHistory.length === 1 && this.talkHistory[0].type === 0) {
                        this.talkHistory[0].content = getStudentGreeting(student.Name)
                        this.talkHistory[0].Name = student.Name
                        this.saveCurrentStudentTalks()
                    }
                }
                return
            } catch (e) {
                console.error('Failed to parse saved talks:', e)
            }
        }

        // New student chat thread: generate in-character initial greeting
        const greeting = getStudentGreeting(student.Name)
        const avatar = student.Avatar || (Array.isArray(student.Avatars) ? student.Avatars[student.cnt || 0] : '')
        const initialTalk: Talk = {
            Id: this.talkId++,
            Name: student.Name,
            Avatar: avatar,
            type: 0,
            flag: 2,
            content: greeting,
            time: Date.now()
        }
        this.talkHistory = [initialTalk]
        this.saveCurrentStudentTalks()
    },

    saveCurrentStudentTalks() {
        if (!this.currentStudentId) return
        localStorage.setItem(
            'momotalk_chat_' + this.currentStudentId,
            JSON.stringify(this.talkHistory)
        )
        this.setData()
    },

    clearStudentTalks(student: baseStudent | any) {
        if (!student || !student.Id) return
        abortStreaming()
        localStorage.removeItem('momotalk_chat_' + student.Id)
        delete this.studentChatTimes[student.Id]
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(
                'momotalk_chat_times',
                JSON.stringify(this.studentChatTimes)
            )
        }
        const greeting = getStudentGreeting(student.Name)
        const avatar = student.Avatar || (Array.isArray(student.Avatars) ? student.Avatars[student.cnt || 0] : '')
        const initialTalk: Talk = {
            Id: this.talkId++,
            Name: student.Name,
            Avatar: avatar,
            type: 0,
            flag: 2,
            content: greeting,
            time: Date.now()
        }
        this.talkHistory = [initialTalk]
        this.currentStudentId = student.Id
        this.lastChatUpdate = Date.now()
        this.saveCurrentStudentTalks()
    }
})

export function recordStudentInteraction(studentId: number, timestamp: number = Date.now()) {
    if (!studentId) return
    talkHistory.studentChatTimes[studentId] = timestamp
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
            'momotalk_chat_times',
            JSON.stringify(talkHistory.studentChatTimes)
        )
    }
    talkHistory.lastChatUpdate = Date.now()
}

const WEEKDAY_NAMES_BY_LANG: Record<string, string[]> = {
    jp: ['日', '月', '火', '水', '木', '金', '土'],
    ja: ['日', '月', '火', '水', '木', '金', '土'],
    kr: ['일', '월', '화', '수', '목', '금', '토'],
    zh: ['日', '一', '二', '三', '四', '五', '六'],
    tw: ['日', '一', '二', '三', '四', '五', '六'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

const MONTHS_EN = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export function formatChatTime(timestamp?: number): string {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
}

export function formatChatDate(timestamp?: number, lang?: string): string {
    if (!timestamp) return ''
    let currentLang = lang
    if (!currentLang && typeof localStorage !== 'undefined') {
        try {
            const raw = localStorage.getItem('language')
            if (raw) currentLang = JSON.parse(raw)
        } catch {}
    }
    currentLang = currentLang || 'jp'
    if (currentLang === 'ja') currentLang = 'jp'

    const d = new Date(timestamp)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const dayOfWeek = d.getDay()
    const weekdays = WEEKDAY_NAMES_BY_LANG[currentLang] || WEEKDAY_NAMES_BY_LANG.jp
    const weekday = weekdays[dayOfWeek]

    if (currentLang === 'kr') {
        return `${year}년 ${month}월 ${day}일 (${weekday})`
    }
    if (currentLang === 'en') {
        return `${MONTHS_EN[month - 1]} ${day}, ${year} (${weekday})`
    }
    return `${year}年${month}月${day}日 (${weekday})`
}

export function isDifferentDay(ts1?: number, ts2?: number): boolean {
    if (!ts1 || !ts2) return true
    const d1 = new Date(ts1)
    const d2 = new Date(ts2)
    return d1.getFullYear() !== d2.getFullYear() ||
           d1.getMonth() !== d2.getMonth() ||
           d1.getDate() !== d2.getDate()
}

export function getStudentLatestSnippet(student: { Id: number; Bio?: string }): string {
    if (!student || !student.Id) return ''

    let talks: Talk[] | null = null
    // If student is currently active in talkHistory, use live memory talks
    if (talkHistory.currentStudentId === student.Id && talkHistory.talkHistory.length > 0) {
        talks = talkHistory.talkHistory
    } else if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('momotalk_chat_' + student.Id)
        if (saved) {
            try {
                talks = JSON.parse(saved)
            } catch (e) {
                talks = null
            }
        }
    }

    if (talks && talks.length > 0) {
        for (let i = talks.length - 1; i >= 0; i--) {
            const item = talks[i]
            const content = (item && item.content) || ''
            if (content.trim()) {
                if (content.startsWith('data:image/') || content.includes('<img')) {
                    return '[画像]'
                }
                const plainText = content.replace(/<[^>]*>/g, '').trim()
                if (plainText) {
                    return plainText
                }
            }
        }
    }

    return student.Bio || ''
}

export function sortStudentsByInteraction<T extends { Id: number }>(students: T[], newestFirst: boolean = true): T[] {
    return [...students].sort((a, b) => {
        const timeA = talkHistory.getStudentLastChatTime(a.Id)
        const timeB = talkHistory.getStudentLastChatTime(b.Id)
        if (timeA !== timeB) {
            return newestFirst ? (timeB - timeA) : (timeA - timeB)
        }
        return 0
    })
}

