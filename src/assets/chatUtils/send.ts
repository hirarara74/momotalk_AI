import { readFile } from '../imgUtils/readFile'
import i18n from '@/locales/i18n'
import { baseStudent, Talk } from '../requestUtils/interface'
import { store } from '../storeUtils/store'
import { talkHistory, recordStudentInteraction } from '../storeUtils/talkHistory'
import { selectList } from '../storeUtils/selectList'
import { myReExp } from '../utils/markdown'
import { getAIProvider, buildSystemPrompt, type ChatMessage } from '../ai'
import { isStudentSleeping, getWakeupSystemPromptModifier } from '../ai/sleepSchedule'
import { playMomoTalkSound } from '../utils/sound'
import { getStickerDescription } from '../utils/stickers'

const re = new myReExp()

const isSenseiOrStudent = (char: baseStudent | number) => {
    return char === 1 || typeof char !== 'number'
}

let activeAbortController: AbortController | null = null

export function abortStreaming() {
    if (activeAbortController) {
        activeAbortController.abort()
        activeAbortController = null
    }
    store.isAiResponding = false
    store.typing = 0
}

/**
 * メッセージが現在「入力中（TypingAnimation）」状態であるかを判定
 * - 先生（type === 1）は即座に発言が表示されるため常に false
 * - AIが返信生成中（store.isAiResponding）かつ生徒（type === 0）のメッセージで、まだ返信テキストが空の場合は、
 *   返信が実際に届くまで継続して true を返す
 * - タイマー等の手動タイピング中の場合もコンテンツが空であれば true
 */
export function isMessageTyping(element: Talk): boolean {
    if (!element) return false
    // 先生の発言は常に即時表示
    if (element.type === 1) return false

    // AIが返信中: 生徒側の空メッセージ枠の場合、返信が届くまで入力中アニメーションを継続
    if (store.isAiResponding && element.type === 0 && (!element.content || element.content.trim() === '')) {
        return true
    }

    // 従来のtypingタイマー用（直近の空メッセージ枠の場合のみ）
    if (store.typing > 0 && element.Id === talkHistory.talkId - 1 && (!element.content || element.content.trim() === '')) {
        return true
    }

    return false
}

const sendText = (char: baseStudent | number, text: string, flag: number = 2) => {
    if (text.length === 0) return
    let name = ''
    let type = 0
    let avatar = ''

    if (typeof char === 'number') {
        if (char === 1) name = 'sensei'
        else if (char === 2) name = i18n.global.t('storyEvent')
        else if (char === 3) name = i18n.global.t('reply')
        else if (char === 4) name = 'systemInfo'
        type = char
    } else {
        // student
        name = char.Name
        avatar = char.Avatar
        type = 0
    }

    const newTalk: Talk = {
        Id: talkHistory.talkId++,
        Name: name,
        Avatar: avatar,
        type: type,
        flag: flag,
        content: re.md2html(text)
    }
    talkHistory.pushTalk(newTalk)

    // 打字效果 & 自动 ScrollToBottom
    store.text = ''
    store.typing = 1
    const scroll_to_bottom = document.getElementById('talkList') as HTMLElement
    const timer = setInterval(() => {
        if (store.typing === 1 && scroll_to_bottom) {
            scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
        }
        if (store.typing < 0) {
            store.typing = 0
            if (scroll_to_bottom) {
                scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
            }
            clearInterval(timer)
        }
        store.typing -= 0.01
    }, 10)

    // === AI 自動返信トリガー ===
    // 先生 (char === 1) がメッセージを送信し、AI機能がONの場合、直近の生徒からAI返信を生成する
    if (char === 1) {
        playMomoTalkSound('send')
        if (store.aiEnabled && !store.isAiResponding) {
            const stickerDesc = getStickerDescription(text)
            handleAIReplyTrigger(stickerDesc ? `[スタンプを送信] ${stickerDesc}` : text)
        }
    }
}

export function resolveReplyStudent(): baseStudent | null {
    // 1. If talkHistory has an active student ID
    if (talkHistory.currentStudentId) {
        if (store.currentChatStudent && store.currentChatStudent.Id === talkHistory.currentStudentId) {
            const student = store.currentChatStudent
            const avatar = Array.isArray(student.Avatars)
                ? student.Avatars[student.cnt || 0]
                : (student.Avatar || '')
            return {
                Id: student.Id,
                Name: student.Name,
                Avatar: avatar
            }
        }

        // Look for student details in the active talk history
        for (let i = 0; i < talkHistory.talkHistory.length; i++) {
            const item = talkHistory.talkHistory[i]
            if (item.type === 0 && item.Avatar && item.Name) {
                return {
                    Id: talkHistory.currentStudentId,
                    Name: item.Name,
                    Avatar: item.Avatar
                }
            }
        }

        // Look in selectList for the matching student ID
        const matchInList = selectList.selectList.find((s) => s.Id === talkHistory.currentStudentId)
        if (matchInList) {
            return matchInList
        }

        if (talkHistory.currentStudentId === 10010) {
            return { Id: 10010, Name: '砂狼シロコ', Avatar: '' }
        }
    }

    // 2. If store.currentChatStudent is set
    if (store.currentChatStudent) {
        const student = store.currentChatStudent
        const avatar = Array.isArray(student.Avatars)
            ? student.Avatars[student.cnt || 0]
            : (student.Avatar || '')
        return {
            Id: student.Id,
            Name: student.Name,
            Avatar: avatar
        }
    }

    // 3. Fallback: look for any student message in talkHistory
    for (let i = talkHistory.talkHistory.length - 1; i >= 0; i--) {
        const item = talkHistory.talkHistory[i]
        if (item.type === 0 && item.Avatar) {
            return {
                Id: item.Id || talkHistory.currentStudentId,
                Name: item.Name,
                Avatar: item.Avatar
            }
        }
    }

    if (selectList.selectList.length > 0) {
        return selectList.selectList[0]
    }
    return null
}

/**
 * AI通信エラーメッセージをユーザー向けの親切な案内文に整形する
 */
export function formatAiErrorMessage(err: any): string {
    const rawMsg = err?.message || String(err || '')

    // 503 / 502 / 504 / Over capacity
    if (
        rawMsg.includes('503') ||
        rawMsg.includes('502') ||
        rawMsg.includes('504') ||
        rawMsg.includes('over capacity') ||
        rawMsg.includes('internal_server_error')
    ) {
        return '（回線が一時的に混み合っています。サーバーの混雑が緩和されるまで少し待つか、設定から「★ 最上位モデル (120B)」に切り替えてお試しください）'
    }

    // 429 / Rate limit / OTPM
    if (
        rawMsg.includes('429') ||
        rawMsg.includes('Rate limit') ||
        rawMsg.includes('OTPM') ||
        rawMsg.includes('quota')
    ) {
        return '（短時間のメッセージ送信制限（レートリミット）に達しました。10〜20秒ほど待ってから送信するか、設定から「★ 最上位モデル (120B)」をお試しください）'
    }

    // 401 / 403 / API Key
    if (
        rawMsg.includes('401') ||
        rawMsg.includes('403') ||
        rawMsg.includes('Invalid API key') ||
        rawMsg.includes('API key') ||
        rawMsg.includes('auth')
    ) {
        return '（APIキーの認証に失敗しました。右上の設定画面（歯車）でAPIキーが正しく入力されているかご確認ください）'
    }

    // Aborted
    if (rawMsg.includes('abort') || rawMsg.includes('Aborted')) {
        return ''
    }

    // Generic fallback: strip ugly JSON blobs or URLs
    const cleaned = rawMsg
        .replace(/\{"error":\{.*\}\}/gs, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/Groq API error \(\d+\):/g, '')
        .trim()

    return `（通信エラーが発生しました: ${cleaned || '時間をおいて再度お試しください'}）`
}

/**
 * 生徒が就寝中でAI返信を遅延（保留）すべきかを判定
 */
export function shouldDelayAIReplyForSleep(
    student: any,
    now: Date = new Date()
): { shouldDelay: boolean; wakeTime?: Date } {
    if (!store.sleepSimulationEnabled) {
        return { shouldDelay: false }
    }
    const target = student || resolveReplyStudent()
    if (!target) {
        return { shouldDelay: false }
    }
    const sleepStatus = isStudentSleeping(target, now)
    if (sleepStatus.isSleeping) {
        return { shouldDelay: true, wakeTime: sleepStatus.wakeTime }
    }
    return { shouldDelay: false }
}

/**
 * 睡眠スケジュール判定を含めたAI返信トリガー
 */
export async function handleAIReplyTrigger(
    userMessageText: string,
    now: Date = new Date(),
    studentOverride?: baseStudent | null
) {
    const targetStudent = studentOverride || resolveReplyStudent()
    if (!targetStudent) return

    const sleepCheck = shouldDelayAIReplyForSleep(targetStudent, now)
    if (sleepCheck.shouldDelay && sleepCheck.wakeTime) {
        console.log(`[AI] ${targetStudent.Name} is currently asleep until ${sleepCheck.wakeTime.toLocaleTimeString()}. Enqueuing wakeup reply.`)
        talkHistory.enqueuePendingWakeup(
            targetStudent.Id,
            targetStudent.Name,
            userMessageText,
            sleepCheck.wakeTime.getTime()
        )
        store.typing = 0
        talkHistory.saveCurrentStudentTalks()
        return
    }

    await triggerAIReply(userMessageText, { student: targetStudent })
}

/**
 * 保留中の就寝メッセージの起床時間をチェックし、起床返信をトリガー
 */
export function checkAndTriggerPendingWakeups(now: Date = new Date()): void {
    if (!store.aiEnabled || store.isAiResponding) return

    const nowTime = now.getTime()
    const activeStudentId = talkHistory.currentStudentId

    for (const [studentIdStr, item] of Object.entries(talkHistory.pendingWakeups)) {
        const studentId = Number(studentIdStr)
        if (nowTime >= item.scheduledWakeTime) {
            if (activeStudentId === studentId) {
                const userMessages = [...item.userMessages]
                talkHistory.removePendingWakeup(studentId)
                triggerAIReply(userMessages[userMessages.length - 1], {
                    isWakeUp: true,
                    userMessages,
                    student: { Id: studentId, Name: item.studentName, Avatar: '' }
                })
                break
            }
        }
    }
}

// ブラウザ環境での定期起床チェック（10秒ごと）
if (typeof window !== 'undefined') {
    setInterval(() => {
        checkAndTriggerPendingWakeups()
    }, 10000)
}

export function getApiKeyWarningNotice(lang?: string): string {
    let currentLang = lang
    if (!currentLang && typeof localStorage !== 'undefined') {
        try {
            const raw = localStorage.getItem('language')
            if (raw) currentLang = JSON.parse(raw)
        } catch {}
    }
    currentLang = currentLang || store.language || 'jp'
    if (currentLang === 'ja') currentLang = 'jp'

    switch (currentLang) {
        case 'kr':
            return '（API 키가 설정되지 않았습니다. 화면 우측 상단의 설정 ⚙️ 에서 API 키를 입력해 주세요. ※ Groq API Key는 https://console.groq.com/keys 에서 무료로 발급받을 수 있습니다）'
        case 'en':
            return '（API Key is not configured. Please enter your API Key from the top-right Settings ⚙️. ※ You can get a free Groq API Key at https://console.groq.com/keys）'
        case 'zh':
            return '（API密钥尚未设置。请点击右上角设置 ⚙️ 输入API密钥。※ 免费的 Groq API Key 可在 https://console.groq.com/keys 申请）'
        case 'tw':
            return '（API金鑰尚未設定。請點擊右上角設定 ⚙️ 輸入API金鑰。※ 免費的 Groq API Key 可在 https://console.groq.com/keys 申請）'
        case 'jp':
        default:
            return '（APIキーが未設定です。画面右上の設定 ⚙️ からAPIキーを入力してください。※Groq API Key は https://console.groq.com/keys から無料で取得できます）'
    }
}

/**
 * Detects whether the user interaction was pleasant/friendly or negative/offensive.
 * If negative, student Kizuna (relationship) rank decreases.
 */
export function detectInteractionSentiment(
    userText: string,
    studentReply: string = '',
    studentId?: number
): 'positive' | 'negative' | 'neutral' {
    const normUser = (userText || '').toLowerCase().trim()
    const normReply = (studentReply || '').toLowerCase().trim()

    // 1. Direct offensive keywords in user message across Japanese, English, Korean, Chinese
    const offensivePatterns: (string | RegExp)[] = [
        // Japanese
        /バカ|ばか|馬鹿/,
        /死ね|しね|逝って/,
        /最低/,
        /気持ち悪い|きもちわるい|キモい|きもい/,
        /大嫌い|嫌い/,
        /クソ|くそ|糞/,
        /消えろ|邪魔|うざい|ウザい/,
        /デブ|ブス/,
        // English
        /\bshut up\b/,
        /\bhate you\b/,
        /\bidiot\b/,
        /\bstupid\b/,
        /\bget lost\b/,
        /\bdisgusting\b/,
        /\bkill yourself\b/,
        /\bfuck\b/,
        /\bgarbage\b/,
        // Korean
        /꺼져/,
        /바보/,
        /싫어/,
        /짜증/,
        /죽어/,
        /재수없/,
        // Chinese
        /去死/,
        /讨厌你|大讨厌/,
        /白痴|傻子|滚开|恶心/
    ]

    for (const pattern of offensivePatterns) {
        if (typeof pattern === 'string' ? normUser.includes(pattern) : pattern.test(normUser)) {
            return 'negative'
        }
    }

    // 2. Student response indicates anger, feeling hurt, shock, or resentment
    const hurtOrAngryReplyPatterns: (string | RegExp)[] = [
        /💢|😡|🤬|👿/,
        /大嫌い/,
        /信じられません|信じられない/,
        /許せません|許せない/,
        /ひどい|酷い/,
        /最低/,
        /傷つきまし|傷つく/,
        /もう口をききません|もう話しかけないで/,
        /怒り|怒って/,
        /\bi hate you\b/,
        /\bhow dare you\b/,
        /\bunforgivable\b/,
        /\bcruel\b/,
        /너무해요/,
        /대단히 실망/,
        /용서 못해요/,
        /太过分了/,
        /不可原谅/
    ]

    for (const pattern of hurtOrAngryReplyPatterns) {
        if (typeof pattern === 'string' ? normReply.includes(pattern) : pattern.test(normReply)) {
            return 'negative'
        }
    }

    return 'positive'
}

/**
 * 先生の発言に対して選択中または直近の生徒が返信する処理
 */
export async function triggerAIReply(
    userMessageText: string,
    options?: { isWakeUp?: boolean; userMessages?: string[]; student?: baseStudent }
) {
    const targetStudent = options?.student || resolveReplyStudent()
    if (!targetStudent) {
        console.log('[AI] No student selected or present to reply.')
        return
    }

    const apiKey = (store.aiApiKey || '').trim()
    if (!apiKey) {
        const replyTalk: Talk = {
            Id: talkHistory.talkId++,
            Name: targetStudent.Name,
            Avatar: targetStudent.Avatar,
            type: 0,
            flag: 2,
            content: getApiKeyWarningNotice(store.language)
        }
        talkHistory.pushTalk(replyTalk)
        store.typing = 0
        store.isAiResponding = false
        talkHistory.saveCurrentStudentTalks()
        return
    }

    const replyingStudentId = targetStudent.Id
    store.isAiResponding = true

    if (activeAbortController) {
        activeAbortController.abort()
    }
    const currentController = new AbortController()
    activeAbortController = currentController
    const signal = currentController.signal

    // 生徒の空メッセージ枠を作成して配置
    const replyTalk: Talk = {
        Id: talkHistory.talkId++,
        Name: targetStudent.Name,
        Avatar: targetStudent.Avatar,
        type: 0,
        flag: 2,
        content: ''
    }
    talkHistory.pushTalk(replyTalk)

    // タイピング表示を開始 & 自動最下部スクロール
    store.typing = 1
    const scroll_to_bottom = document.getElementById('talkList') as HTMLElement
    if (scroll_to_bottom) {
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
    }
    setTimeout(() => {
        const el = document.getElementById('talkList')
        if (el) el.scrollTop = el.scrollHeight
    }, 50)

    let accumulatedText = ''

    try {
        const aiProvider = getAIProvider()
        let systemPrompt = buildSystemPrompt(targetStudent, store.language)
        if (options?.isWakeUp && options?.userMessages) {
            systemPrompt += `\n\n${getWakeupSystemPromptModifier(targetStudent.Name, options.userMessages)}`
        }

        const promptInput = options?.isWakeUp
            ? `（先生からの昨晩のメッセージ: 「${(options.userMessages || []).join('」「')}」。朝起きたあなたのキャラクターとして、朝の挨拶と返信をしてください）`
            : userMessageText

        // 過去の会話履歴をChatMessage形式に変換（直近10件）
        const history: ChatMessage[] = []
        const relevantTalks = talkHistory.talkHistory.slice(-12, -2) // 直前の発言まで
        for (const t of relevantTalks) {
            if (t.type === 1) {
                history.push({ role: 'user', content: t.content })
            } else if (t.type === 0) {
                history.push({ role: 'assistant', content: t.content })
            }
        }

        // 会話感を出すため、最低1.5秒間は「入力中...」アニメーションを表示してから返信を開始する
        await new Promise<void>((resolve, reject) => {
            const timer = setTimeout(resolve, 1500)
            if (signal) {
                signal.addEventListener('abort', () => {
                    clearTimeout(timer)
                    reject(new Error('Aborted'))
                }, { once: true })
            }
        })

        await aiProvider.streamChat(
            systemPrompt,
            history,
            promptInput,
            (chunk) => {
                if (signal.aborted || talkHistory.currentStudentId !== replyingStudentId) return
                accumulatedText = chunk
                talkHistory.setTalkContent(replyTalk.Id, re.md2html(accumulatedText))
                if (scroll_to_bottom) {
                    scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
                }
            },
            signal
        )

        if (signal.aborted || talkHistory.currentStudentId !== replyingStudentId) return

        // 完了
        talkHistory.setTalkContent(replyTalk.Id, re.md2html(accumulatedText))
        talkHistory.saveCurrentStudentTalks()
        recordStudentInteraction(replyingStudentId, Date.now())

        const sentiment = detectInteractionSentiment(promptInput, accumulatedText, targetStudent.Id)
        if (sentiment === 'negative') {
            store.decreaseRelationshipRank(targetStudent.Id)
            playMomoTalkSound('receive')
            setTimeout(() => {
                playMomoTalkSound('rankdown')
            }, 250)
        } else {
            store.increaseRelationshipRank(targetStudent.Id)
            playMomoTalkSound('receive')
            setTimeout(() => {
                playMomoTalkSound('rankup')
            }, 250)
        }
    } catch (err: any) {
        if (err.name === 'AbortError' || err.message === 'Aborted' || signal.aborted) {
            console.log('[AI] Stream aborted.')
            if (!accumulatedText) {
                talkHistory.deleteTalkById(replyTalk.Id)
            }
        } else {
            console.error('[AI] Error generating reply:', err)
            talkHistory.setTalkContent(
                replyTalk.Id,
                formatAiErrorMessage(err)
            )
            talkHistory.saveCurrentStudentTalks()
        }
    } finally {
        if (activeAbortController === currentController) {
            activeAbortController = null
        }
        store.isAiResponding = false
        store.typing = 0
        if (scroll_to_bottom) {
            scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
        }
    }
}

export function sendImagePayload(
    char: baseStudent | number,
    imageDataUrl: string,
    flag: number = 2,
    caption?: string
) {
    if (!isSenseiOrStudent(char)) return false
    const textToSend = caption !== undefined ? caption : (char === 1 ? store.text.trim() : '')
    const isSensei = char === 1

    // 1. Send image message
    const imgTalk: Talk = {
        Id: talkHistory.talkId++,
        Name: isSensei ? 'sensei' : (typeof char === 'number' ? 'student' : char.Name),
        Avatar: isSensei ? '' : (typeof char === 'number' ? '' : char.Avatar),
        type: isSensei ? 1 : 0,
        flag: flag,
        content: imageDataUrl,
        time: Date.now()
    }
    talkHistory.pushTalk(imgTalk)

    // 2. If caption / accompanying text exists, send as follow-up text bubble
    if (textToSend) {
        const textTalk: Talk = {
            Id: talkHistory.talkId++,
            Name: isSensei ? 'sensei' : (typeof char === 'number' ? 'student' : char.Name),
            Avatar: isSensei ? '' : (typeof char === 'number' ? '' : char.Avatar),
            type: isSensei ? 1 : 0,
            flag: flag,
            content: re.md2html(textToSend),
            time: Date.now()
        }
        talkHistory.pushTalk(textTalk)
    }

    if (isSensei) {
        store.text = ''
        store.typing = 1
        playMomoTalkSound('send')
        if (store.aiEnabled && !store.isAiResponding) {
            const combinedMessage = textToSend ? `${textToSend}\n${imageDataUrl}` : imageDataUrl
            handleAIReplyTrigger(combinedMessage)
        }
    }
    talkHistory.saveCurrentStudentTalks()
    return true
}

const sendImage = (char: baseStudent | number, flag: number = 2, caption?: string) => {
    if (!isSenseiOrStudent(char)) return false // 非师生不能插入图片
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        const text = reader.result as string // 将图像文件转换为 base64 字符串
        sendImagePayload(char, text, flag, caption)
    })
    readFile(reader)
}

const sendSticker = (char: baseStudent | number, url: string, flag: number = 2) => {
    if (!isSenseiOrStudent(char)) return false
    sendText(char, url, flag)
    // 发送后收回 popover
    const sticker = document.getElementById('sticker') as HTMLElement
    sticker.click()
}

/**
 * 先生としてメッセージを送信する（MomoTalk AIチャット用）
 */
const sendSenseiMessage = (text: string, flag: number = 2) => {
    sendText(1, text, flag)
}

export { sendText, sendImage, sendSticker, sendSenseiMessage }

