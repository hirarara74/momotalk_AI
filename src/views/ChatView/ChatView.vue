<template>
    <main class="talk-wrapper">
        <!-- 生徒ヘッダー (MomoTalk チャット対象生徒) -->
        <div class="chat-header-bar" v-if="activeStudentInfo">
            <div class="chat-header-bar__left">
                <button class="chat-header-bar__back" @click="handleGoBack" title="戻る">‹</button>
                <img class="chat-header-bar__avatar" :src="activeStudentAvatar" :alt="activeStudentInfo.Name" />
                <div class="chat-header-bar__meta">
                    <div class="chat-header-bar__name-row">
                        <span class="chat-header-bar__name">{{ activeStudentInfo.Name }}</span>
                        <span class="chat-header-bar__rank" title="絆ランク">
                            <HeartIcon class="rank-heart" />
                            <span>Lv.{{ store.getRelationshipRank(activeStudentInfo.Id) }}</span>
                        </span>
                        <span
                            v-if="store.sleepSimulationEnabled && studentSleepStatus.isSleeping"
                            class="chat-header-bar__sleep-badge"
                            :title="$t('sleepingBadge', { time: formatWakeupTime(studentSleepStatus.wakeTime) })"
                        >
                            💤 {{ $t('sleepingBadge', { time: formatWakeupTime(studentSleepStatus.wakeTime) }) }}
                        </span>
                    </div>
                    <div class="chat-header-bar__status" v-if="activeStudentInfo.Bio">
                        {{ activeStudentInfo.Bio }}
                    </div>
                </div>
            </div>
            <div class="chat-header-bar__right">
                <button class="clear-chat-btn" @click="handleClearChat" :title="$t('clearChat')">
                    {{ $t('clearChat') }}
                </button>
            </div>
        </div>

        <!-- 聊天主界面 -->
        <div class="talk-list show-action" id="talkList">
            <chat-draggable :tasks="talkHistory.talkHistory" />
        </div>
        <!-- 聊天主界面 -->

        <div class="add" id="sendBar">
            <!-- 添付画像プレビュー -->
            <div class="attachment-bar" v-if="attachedImage">
                <div class="attachment-preview-wrapper">
                    <img :src="attachedImage" class="attachment-preview-img" alt="添付画像" />
                    <button class="attachment-remove-btn" @click="removeAttachedImage" title="添付画像を削除">×</button>
                </div>
            </div>

            <div class="input-bar">
                <!-- 贴图 -->
                <Popper placement="top">
                    <div class="sticker" id="sticker" title="スタンプを送信">
                        <div class="sticker-badge">
                            <ProfileIcon class="icon profile" />
                        </div>
                    </div>
                    <template #content>
                        <div class="sticker-wrapper">
                            <div class="stk">
                                <div v-for="(sticker, index) in stickerList" :key="index">
                                    <img v-lazy="sticker" @click="_sticker(sticker)" />
                                </div>
                            </div>
                            <div class="tab">
                                <div @click="switchSticker(-1)" 
                                    :class="{ stk__active: stickerTab === 1 }" >1</div>
                                <div @click="switchSticker(1)" 
                                    :class="{ stk__active: stickerTab === 2 }" >2</div>
                            </div>
                        </div>
                    </template>
                </Popper>
                <!-- 贴图 -->

                <!-- 发送 -->
                <textarea
                    class="text"
                    :placeholder="attachedImage ? $t('imageMessagePlaceholder') : (store.sleepSimulationEnabled && studentSleepStatus.isSleeping ? $t('sleepingPlaceholder', { name: activeStudentInfo?.Name || '生徒' }) : (activeStudentInfo ? $t('chatInputPlaceholder', { name: activeStudentInfo.Name }) : 'Aa'))"
                    v-model="store.text"
                    id="textarea"
                    @keydown.enter.exact.prevent="_text()"
                    @paste="handlePaste"
                ></textarea>
                <div class="photo" title="画像を添付・送信" @click="_image()">
                    <ImageIcon class="image icon" />
                </div>
                <div class="message" title="送信" @click="_text()">
                    <SendIcon class="send icon"/>
                </div>
                <!-- 发送 -->
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import ProfileIcon from '@/components/icons/IconProfile.vue'
import SendIcon from '@/components/icons/IconSend.vue'
import ImageIcon from '@/components/icons/IconImage.vue'
import HeartIcon from '@/components/icons/IconHeart.vue'
// ======================= Icon
import ChatDraggable from '@/views/ChatView/ChatDraggable.vue'
import Popper from 'vue3-popper'
import { useRoute } from 'vue-router'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'

import { stickers, stickers2 } from '@/assets/utils/stickers'
import i18n from '@/locales/i18n'
import { getMessage, proxy, getStudents } from '@/assets/requestUtils/request'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { selectList } from '@/assets/storeUtils/selectList'
import { sendSenseiMessage, sendImage, sendSticker, sendImagePayload, checkAndTriggerPendingWakeups } from '@/assets/chatUtils/send'
import { insertImage, insertSticker, insertText } from '@/assets/chatUtils/insert'
import { readFile } from '@/assets/imgUtils/readFile'
import { isStudentSleeping } from '@/assets/ai/sleepSchedule'

const props = defineProps(['student', 'studentInfo'])
const emits = defineEmits(['deactive'])
const route = useRoute()

const syncRouteStudent = async (studentIdStr?: string) => {
    if (!studentIdStr) return
    const idNum = Number(studentIdStr)
    if (!idNum) return
    if (store.currentChatStudent && store.currentChatStudent.Id === idNum && talkHistory.currentStudentId === idNum) {
        return
    }
    if (props.studentInfo && props.studentInfo.Id === idNum) {
        store.currentChatStudent = props.studentInfo
        talkHistory.loadStudentTalks(props.studentInfo)
        return
    }
    try {
        const students = await getStudents(store.language)
        const match = students.find((s) => s.Id === idNum)
        if (match) {
            store.currentChatStudent = match
            talkHistory.loadStudentTalks(match)
        }
    } catch (e) {
        console.error('Failed to sync student from route query:', e)
    }
}

watch(
    () => route.query.id,
    (newId) => {
        syncRouteStudent(newId as string)
    }
)

watch(
    () => store.language,
    async (newLang) => {
        const targetId = Number(route.query.id) || talkHistory.currentStudentId || (activeStudentInfo.value ? activeStudentInfo.value.Id : 0)
        if (targetId) {
            try {
                const students = await getStudents(newLang)
                const match = students.find((s) => s.Id === targetId)
                if (match) {
                    store.currentChatStudent = match
                }
            } catch (e) {
                console.error('Failed to sync student on language switch:', e)
            }
        }
    }
)

const activeStudentInfo = computed<any>(() => {
    const routeId = Number(route.query.id)
    if (routeId) {
        if (store.currentChatStudent && store.currentChatStudent.Id === routeId) return store.currentChatStudent
        if (props.studentInfo && props.studentInfo.Id === routeId) return props.studentInfo
        if (props.student && props.student.Id === routeId) return props.student
    }
    if (talkHistory.currentStudentId) {
        if (store.currentChatStudent && store.currentChatStudent.Id === talkHistory.currentStudentId) return store.currentChatStudent
        if (props.studentInfo && props.studentInfo.Id === talkHistory.currentStudentId) return props.studentInfo
        if (props.student && props.student.Id === talkHistory.currentStudentId) return props.student
    }
    if (store.currentChatStudent) return store.currentChatStudent
    if (props.studentInfo) return props.studentInfo
    if (props.student) return props.student
    if (selectList.selectList.length > 0) return selectList.selectList[0]
    return null
})

const activeStudentAvatar = computed(() => {
    const s = activeStudentInfo.value
    if (!s) return ''
    if (Array.isArray(s.Avatars)) return s.Avatars[s.cnt || 0]
    return s.Avatar || ''
})

const studentSleepStatus = computed(() => {
    if (!activeStudentInfo.value) {
        return { isSleeping: false, wakeTime: new Date() }
    }
    return isStudentSleeping(activeStudentInfo.value)
})

const formatWakeupTime = (date?: Date) => {
    if (!date) return ''
    const h = String(date.getHours()).padStart(2, '0')
    const m = String(date.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
}

const handleGoBack = () => {
    const root = document.getElementById('root')
    if (root) {
        root.scrollTo({ left: 0, behavior: 'smooth' })
    }
}

const handleClearChat = () => {
    if (activeStudentInfo.value) {
        const studentName = activeStudentInfo.value.Name || '生徒'
        if (confirm(i18n.global.t('resetChatConfirm', { name: studentName }))) {
            talkHistory.clearStudentTalks(activeStudentInfo.value)
        }
    }
}

watch(
    activeStudentInfo,
    (newStudent) => {
        if (newStudent) {
            talkHistory.loadStudentTalks(newStudent)
            const avatar = Array.isArray(newStudent.Avatars)
                ? newStudent.Avatars[newStudent.cnt || 0]
                : newStudent.Avatar || ''
            if (!selectList.selectList.find((s) => s.Id === newStudent.Id)) {
                selectList.pushStudent({
                    Id: newStudent.Id,
                    Name: newStudent.Name,
                    Avatar: avatar
                })
            }
        }
    },
    { immediate: true }
)

// 添付画像
const attachedImage = ref<string | null>(null)

const removeAttachedImage = () => {
    attachedImage.value = null
}

const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile()
            if (file) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    attachedImage.value = event.target?.result as string
                }
                reader.readAsDataURL(file)
                e.preventDefault()
                break
            }
        }
    }
}

// 送信 (先生として送信)
const _text = () => {
    if (attachedImage.value) {
        const img = attachedImage.value
        const caption = store.text ? store.text.trim() : ''
        attachedImage.value = null
        store.text = ''
        sendImagePayload(1, img, 2, caption)
        return
    }

    if (!store.text || !store.text.trim()) return

    /* 【割り込み編集機能の復元用メモ】
       割り込み機能を復活させる場合は以下に戻してください：
       store.insertId === -1
           ? sendSenseiMessage(store.text)
           : insertText(1, store.text, store.insertId)
    */
    sendSenseiMessage(store.text)
}
const _image = () => {
    /* 【割り込み編集機能の復元用メモ】
       割り込み機能を復活させる場合は以下を有効化してください：
       if (store.insertId !== -1) {
           insertImage(1, store.insertId)
           return
       }
    */
    const reader = new FileReader()
    reader.addEventListener('load', () => {
        attachedImage.value = reader.result as string
        const textarea = document.querySelector('textarea') as HTMLElement
        if (textarea) textarea.focus()
    })
    readFile(reader)
}
const _sticker = (sticker: string) => {
    /* 【割り込み編集機能の復元用メモ】
       割り込み機能を復活させる場合は以下に戻してください：
       store.insertId === -1
           ? sendSticker(1, sticker)
           : insertSticker(1, sticker, store.insertId)
    */
    sendSticker(1, sticker)
}

// 貼付スタンプ切り替え
const stickerList = ref<string[]>(proxy(stickers))
const stickerTab = ref<number>(1)
const switchSticker = (tab: number) => {
    if (tab === -1 || tab === 1) {
        stickerTab.value = 1
        stickerList.value = proxy(stickers)
    } else {
        stickerTab.value = 2
        stickerList.value = proxy(stickers2)
    }
}

// リスト追加監視
watch(props, (newProps) => {
    if (newProps.student) {
        selectList.pushStudent(newProps.student)
    }
})

onMounted(async () => {
    // 滚动 & 判断播放
    var scroll_to_bottom = document.getElementById('talkList') as HTMLElement
    if (scroll_to_bottom) {
        scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight
    }
    let id = route.query.id as string
    if (id) {
        await syncRouteStudent(id)
        if (route.query.story === 'true') {
            store.storyKey = id
            store.storyList = await getMessage<Record<string, string[]>>(store.storyKey, 'index')
            if (store.storyList) {
                if (!Object.keys(store.storyList).find((ele) => ele === store.storyFile))
                    store.storyFile = Object.keys(store.storyList)[0]
                store.showPlayerDialog = true
            }
        }
    }
    // 就寝中の保留メッセージのチェック＆定期監視
    checkAndTriggerPendingWakeups()
    ;(window as any).checkAndTriggerPendingWakeups = checkAndTriggerPendingWakeups
    wakeupInterval = setInterval(() => {
        checkAndTriggerPendingWakeups()
    }, 30000)

    // Enterキー送信
    var textarea = document.querySelector('textarea') as HTMLElement
    if (textarea) {
        textarea.onkeydown = (e) => {
            if (!e.shiftKey && e.key === 'Enter') {
                e.preventDefault()
                _text()
            }
        }
    }
})

let wakeupInterval: any = null
onUnmounted(() => {
    if (wakeupInterval) {
        clearInterval(wakeupInterval)
    }
})
</script>

<style scoped lang="scss">
@import './chat-view.scss';
@import '@/assets/css/icons.scss';

/* hide scrollbar */
::-webkit-scrollbar {
    display: none;
}

.chat-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #ffffff;
    border-bottom: 1px solid #e9edf0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    z-index: 10;
    flex-shrink: 0;

    &__left {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
    }

    &__back {
        display: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: #f0f4f8;
        color: #2b3b4c;
        font-size: 22px;
        font-weight: bold;
        line-height: 1;
        cursor: pointer;
        padding-bottom: 2px;
        flex-shrink: 0;
        transition: background 0.15s ease;

        &:hover {
            background: #e2e8f0;
        }

        @media screen and (max-width: 1150px) {
            display: inline-flex;
        }
    }

    &__avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #ff7b92;
        flex-shrink: 0;
    }

    &__meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    &__name-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    &__name {
        font-size: 15px;
        font-weight: bold;
        color: #2b3b4c;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__rank {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #fff0f3;
        color: #ff5577;
        font-size: 12px;
        font-weight: bold;
        padding: 1px 8px;
        border-radius: 12px;
        border: 1px solid #ffd1dc;

        .rank-heart {
            width: 12px;
            height: 12px;
            fill: #ff5577;
        }
    }

    &__sleep-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: #f0f2ff;
        color: #5c6bc0;
        border: 1px solid #d4dafa;
        font-size: 11px;
        font-weight: bold;
        padding: 2px 7px;
        border-radius: 10px;
        white-space: nowrap;
    }

    &__status {
        font-size: 12px;
        color: #7b8b9a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 320px;
    }

    &__right {
        flex-shrink: 0;
    }

    .clear-chat-btn {
        background: #f0f4f8;
        color: #6a7c8f;
        border: 1px solid #dce4ec;
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
            background: #ffebee;
            color: #d32f2f;
            border-color: #ffcdd2;
        }
    }
}

@import '@/assets/css/mobile.scss';
</style>
