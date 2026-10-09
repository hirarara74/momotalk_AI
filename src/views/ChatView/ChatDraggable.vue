<script setup lang="ts">
import TypingAnimation from '@/components/TypingAnimation.vue'
import ImageModalViewer from '@/components/ImageModalViewer.vue'
import ChatBlock from './ChatBlock.vue'
import ReplyBlock from './ReplyBlock.vue'
import MessageActions from './MessageActions.vue'
import { isMessageTyping } from '@/assets/chatUtils/send'
import { formatChatTime, formatChatDate, isDifferentDay } from '@/assets/storeUtils/talkHistory'
import { resolveCanonicalStudent } from '@/assets/ai/prompts'
import { isPhotoUrl, isPhotoFailed } from '@/assets/imageGen'

const isShootingPlaceholder = (content: string): boolean => {
    if (!content || typeof content !== 'string') return false
    return (
        content === '📷 撮影中...' ||
        content === '[SHOOTING_PHOTO]' ||
        content === '📷 撮影中'
    )
}

const getLocalizedStudentName = (name: string): string => {
    if (!name || name === 'sensei') return name
    const canonical = resolveCanonicalStudent(name)
    if (canonical && canonical.names) {
        const lang = store.language || 'jp'
        const names = (canonical.names as any)[lang] || canonical.names.jp
        if (names && names[0]) return names[0]
    }
    return name
}

const shouldShowDateDivider = (index: number, element: any, tasks: any[]) => {
    if (!element || !element.time) return false
    if (index === 0) return true
    const prev = tasks?.[index - 1]
    return isDifferentDay(prev?.time, element.time)
}
</script>

<template>
    <image-modal-viewer />
    <draggable :list="tasks" :group="{ name: 'g1' }" item-key="id" @end="checkMove" :disabled="!store.draggable">
        <template #item="{ element, index }">
            <div class="chat-item-wrapper">
                <div class="chat-date-divider" v-if="shouldShowDateDivider(index, element, tasks as any)">
                    <span>{{ formatChatDate(element.time, store.language) }}</span>
                </div>
                <div
                    :class="{
                        student: element.type === 0,
                        sensei: element.type === 1,
                        story: element.type === 2,
                        choice: element.type == 3,
                        message: element.type === 4,

                        first: element.type <= 1 && element.flag > 0
                    }"
                >
                    <!-- 学生信息 -->
                    <div
                        class="student--split"
                        v-if="element.type === 0 && element.flag === 0"
                        @click="splitTalks(element)"
                    ></div>
                    <div class="avatar" v-if="element.type === 0 && element.flag > 0">
                        <img
                            v-lazy="element.Avatar"
                            style="cursor: pointer"
                            :title="$t('openProfile')"
                            @click="$router.push({ path: '/', query: { id: talkHistory.currentStudentId } })"
                        />
                    </div>
                    <div
                        class="name"
                        v-if="element.type === 0 && element.flag > 0"
                        contenteditable
                        @blur="saveEdit($event, element.Id, 'name')"
                    >
                        {{ getLocalizedStudentName(element.Name) }}
                    </div>

                    <message-actions class="container" :element="element">
                        <!-- 羁绊剧情 -->
                        <div class="box-story" v-if="element.type === 2">
                            <div
                                class="header"
                                contenteditable
                                @blur="saveEdit($event, element.Id, 'name')"
                            >
                                <div class="title">{{ element.Name }}</div>
                            </div>
                            <div class="content">
                                <chat-block :element="element"/>
                            </div>
                        </div>
                        <!-- 回复 -->
                        <div class="box-choice" v-else-if="element.type === 3">
                            <div
                                class="header"
                                contenteditable
                                @blur="saveEdit($event, element.Id, 'name')"
                            >
                                <div class="title">{{ element.Name }}</div>
                            </div>
                            <div class="content">
                                <span v-for="(con, index) of element.content.split('\n')" :key="index">
                                    <reply-block :element="element" :content="con" :index="index"/>
                                </span>
                            </div>
                        </div>
                        <!-- 系统通知 -->
                        <div class="box-message" v-else-if="element.type === 4">
                            <div class="content">
                                <chat-block :element="element"/>
                            </div>
                        </div>
                        <!-- 撮影中プレースホルダー -->
                        <div
                            class="box shooting-box"
                            v-else-if="isShootingPlaceholder(element.content)"
                        >
                            <div class="shooting-indicator">
                                <span class="camera-icon">📷</span>
                                <span class="shooting-text">{{ $t('takingPhotoPlaceholder') || '📷 撮影中...' }}</span>
                                <typing-animation class="shooting-dots" />
                            </div>
                        </div>
                        <!-- 图片消息 -->
                        <div
                            class="box img"
                            v-else-if="checkImg(element.content) || isPhotoUrl(element.content)"
                        >
                            <typing-animation
                                class="loading"
                                v-if="isMessageTyping(element)"
                            ></typing-animation>
                            <img
                                v-else
                                :src="element.content"
                                class="chat-img"
                                referrerpolicy="no-referrer"
                                @click="handleImageClick($event, element)"
                                @error="handleImageError($event, element)"
                            />
                        </div>
                        <!-- 文本消息 -->
                        <div class="box" v-else>
                            <typing-animation
                                class="loading"
                                v-if="isMessageTyping(element)"
                            ></typing-animation>
                            <template v-else>
                                <chat-block :element="element"/>
                                <div
                                    v-if="element.type === 0 && element._originalUrl && isPhotoFailedText(element.content)"
                                    class="photo-retry-banner"
                                    @click="retryPhoto(element)"
                                    style="margin-top: 6px; font-size: 11px; color: #2888e2; cursor: pointer; display: flex; align-items: center; gap: 4px; user-select: none;"
                                >
                                    <span>🔄 写真を再読み込みする</span>
                                </div>
                            </template>
                        </div>
                        <div class="chat-meta" v-if="element.time && !isMessageTyping(element)">
                            <span class="chat-read" v-if="element.type === 1 && !element.unread">{{ $t('readStatus') }}</span>
                            <span class="chat-time">{{ formatChatTime(element.time) }}</span>
                        </div>
                    </message-actions>
                    <!-- 【割り込み編集機能の復元用メモ】
                         割り込み挿入ガイド表示（insert here）を復活させる場合は、下記コメントを解除してください。
                         <div class="insert-indicator" v-if="store.insertId === element.Id">insert here</div>
                    -->
                </div>
            </div>
        </template>
    </draggable>
</template>

<script lang="ts">
import draggable from 'vuedraggable'
import { readFile } from '@/assets/imgUtils/readFile'
import { store } from '@/assets/storeUtils/store'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { saveEdit } from '@/assets/storeUtils/saveEdit'
import { Talk } from '@/assets/requestUtils/interface'

export default {
    props: {
        tasks: {
            required: true,
            type: Array
        }
    },
    components: {
        draggable,
        TypingAnimation,
        ChatBlock,
        ReplyBlock,
        MessageActions,
        ImageModalViewer
    },
    methods: {
        changeImage(evt: Event, id: number) {
            var reader = new FileReader()
            reader.addEventListener('load', () => {
                var ele = evt.target! as HTMLImageElement
                ele.src = reader.result as string
                talkHistory.setTalkContent(id, reader.result as string)
            })
            readFile(reader)
        },
        handleImageClick(evtOrElement: any, elementOrNone?: any) {
            let evt: Event | undefined
            let element: any
            if (elementOrNone && typeof elementOrNone === 'object' && 'content' in elementOrNone) {
                evt = evtOrElement as Event
                element = elementOrNone
            } else {
                element = evtOrElement
            }
            if (!element) return

            if (element.type === 0) {
                store.showImageModal = true
                store.modalImageUrl = element.content
                store.modalStudentName = element.Name
            } else if (element.type === 1) {
                if (evt) {
                    this.changeImage(evt, element.Id)
                } else {
                    const fakeEvt = { target: document.querySelector(`img[src="${element.content}"]`) } as any
                    this.changeImage(fakeEvt, element.Id)
                }
            }
        },
        handleImageError(evt: Event, element: any) {
            console.warn('[ChatDraggable] Image failed to load:', element?.content)
            if (element && element.type === 0) {
                element._retryCount = (element._retryCount || 0) + 1
                if (!element._originalUrl && isPhotoUrl(element.content)) {
                    element._originalUrl = element.content
                }

                if (element._retryCount <= 2 && element._originalUrl && isPhotoUrl(element._originalUrl)) {
                    console.log(`[ChatDraggable] Retrying photo load (attempt ${element._retryCount}/2)...`)
                    const base = element._originalUrl.replace(/[?&]retry=\d+/g, '')
                    const newSeed = Math.floor(Math.random() * 1000000)
                    let newUrl = base.replace(/([?&]seed=)\d+/g, `$1${newSeed}`)
                    if (!newUrl.includes('seed=')) {
                        newUrl += `${newUrl.includes('?') ? '&' : '?'}seed=${newSeed}`
                    }
                    newUrl += `&retry=${element._retryCount}`
                    element.content = newUrl
                    return
                }

                const studentName = element.Name || ''
                element.content = `（📷 ${studentName}: 写真の送受信に失敗しました。カメラまたは回線の調子が悪いようです）`
                talkHistory.setData()
            }
        },
        isPhotoUrl(content: string) {
            return isPhotoUrl(content)
        },
        isPhotoFailedText(content: string) {
            return isPhotoFailed(content)
        },
        retryPhoto(element: any) {
            if (element && element._originalUrl) {
                element._retryCount = 0
                const newSeed = Math.floor(Math.random() * 1000000)
                const base = element._originalUrl.replace(/[?&]retry=\d+/g, '').replace(/([?&]seed=)\d+/g, '')
                const sep = base.includes('?') ? '&' : '?'
                element.content = `${base}${sep}seed=${newSeed}`
                talkHistory.setData()
            }
        },
        isShootingPlaceholder(content: string) {
            if (!content || typeof content !== 'string') return false
            return (
                content === '📷 撮影中...' ||
                content === '[SHOOTING_PHOTO]' ||
                content === '📷 撮影中'
            )
        },
        checkMove(e: any) {
            // 拖动后设置 flag => 样式
            var i = e.newIndex
            var j = e.oldIndex
            talkHistory.checkMove(i, j)
        },
        splitTalks(element: Talk) {
            // 分段消息流: 0->1; 1->0; 2不可改
            if (element.flag < 2) element.flag = 1 - element.flag
            talkHistory.setData()
        },
        checkImg(content: string){
            const suffix = `(bmp|jpg|png|tif|gif|svg|webp|jpeg)`
            var regular = new RegExp(`(data:image.*)|((http|https)://.*\\.${suffix})|(/.*\\.${suffix})`)
            return regular.test(content)
        },
        /* 【割り込み編集機能の復元用メモ】
           割り込み編集機能を復活させる場合は、下記 setInsert を使用し、
           ChatView.vue 側の insertText / insertImage / insertSticker 呼び出しを有効化してください。
        */
        setInsert(insertId: number){
            if (store.insertId === insertId) {
                store.insertId = -1
            } else {
                store.insertId = insertId
                var textarea = document.querySelector('textarea') as HTMLElement
                textarea.focus()
            }
        }
    }
}
</script>
<style scoped lang="scss">
@import '@/views/ChatView/chat-draggable.scss';
</style>
