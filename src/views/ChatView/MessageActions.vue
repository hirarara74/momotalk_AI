<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Talk } from '@/assets/requestUtils/interface'
import { talkHistory } from '@/assets/storeUtils/talkHistory'
import { abortStreaming, isMessageTyping } from '@/assets/chatUtils/send'
import { myReExp } from '@/assets/utils/markdown'

const props = defineProps<{ element: Talk }>()
const menu = ref(false)
const editing = ref(false)
const draft = ref('')
const position = ref({ x: 0, y: 0 })
const editor = ref<HTMLTextAreaElement>()
const actions = ref<HTMLButtonElement>()
const options = ref<HTMLButtonElement>()
const available = computed(() => !isMessageTyping(props.element) &&
    !['📷 撮影中...', '[SHOOTING_PHOTO]', '📷 撮影中'].includes(props.element.content))
const re = new myReExp()
let timer: ReturnType<typeof setTimeout> | undefined
let start = { x: 0, y: 0 }
let suppressClick = false

function cancelHold() {
    clearTimeout(timer)
    window.removeEventListener('scroll', cancelHold, true)
}
function openMenu(x: number, y: number) {
    if (!available.value) return
    position.value = {
        x: Math.max(8, Math.min(x, window.innerWidth - 240)),
        y: Math.max(8, Math.min(y, window.innerHeight - 184))
    }
    menu.value = true
    nextTick(() => actions.value?.focus())
}
function contextMenu(event: MouseEvent) {
    event.preventDefault()
    cancelHold()
    openMenu(event.clientX, event.clientY)
}
function pointerDown(event: PointerEvent) {
    cancelHold()
    suppressClick = false
    if (event.pointerType === 'mouse' || event.isPrimary === false) return
    start = { x: event.clientX, y: event.clientY }
    window.addEventListener('scroll', cancelHold, true)
    timer = setTimeout(() => {
        cancelHold()
        suppressClick = true
        openMenu(start.x, start.y)
    }, 550)
}
function pointerMove(event: PointerEvent) {
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) cancelHold()
}
function click(event: MouseEvent) {
    if (suppressClick) {
        event.preventDefault()
        event.stopPropagation()
        suppressClick = false
    }
}
function close() {
    menu.value = false
    editing.value = false
    nextTick(() => options.value?.focus())
}
function edit() {
    if (!available.value || !talkHistory.getTalkById(props.element.Id)) return close()
    draft.value = re.html2md(props.element.content)
    menu.value = false
    editing.value = true
    nextTick(() => editor.value?.focus())
}
function save() {
    if (!draft.value.trim()) return
    abortStreaming()
    talkHistory.setTalkContent(props.element.Id, re.md2html(draft.value.replace(/</g, '&lt;').replace(/>/g, '&gt;')))
    talkHistory.saveCurrentStudentTalks()
    close()
}
function remove() {
    abortStreaming()
    talkHistory.deleteTalkById(props.element.Id)
    talkHistory.saveCurrentStudentTalks()
    close()
}
function trapFocus(event: KeyboardEvent) {
    if (event.key === 'Escape') return close()
    if (event.key !== 'Tab') return
    const controls = Array.from((event.currentTarget as HTMLElement)
        .querySelectorAll<HTMLElement>('button:not(:disabled), textarea'))
    const current = controls.indexOf(document.activeElement as HTMLElement)
    event.preventDefault()
    controls[(current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus()
}
watch(() => talkHistory.currentStudentId, close)
onBeforeUnmount(() => {
    cancelHold()
})
</script>

<template>
    <div class="message-actions" @contextmenu="contextMenu" @pointerdown="pointerDown"
        @pointermove="pointerMove" @pointerup="cancelHold" @pointercancel="cancelHold"
        @pointerleave="cancelHold" @click.capture="click">
        <slot />
        <button ref="options" class="message-options" :aria-label="$t('messageActions')" :disabled="!available"
            @click.stop="openMenu($event.clientX || 8, $event.clientY || 8)">⋯</button>
        <Teleport to="body">
            <div v-if="menu" class="message-overlay" @click.self="close">
                <div class="message-menu" role="dialog" aria-modal="true" :aria-label="$t('messageActions')" @keydown="trapFocus"
                    :style="{ left: position.x + 'px', top: position.y + 'px' }">
                    <button ref="actions" @click="edit">{{ $t('editMessage') }}</button>
                    <button class="delete" @click="remove">{{ $t('deleteMessage') }}</button>
                    <button @click="close">{{ $t('cancel') }}</button>
                </div>
            </div>
            <div v-if="editing" class="message-overlay editor-overlay" @click.self="close">
                <form class="message-editor" role="dialog" aria-modal="true" :aria-label="$t('editMessage')" @keydown="trapFocus" @submit.prevent="save">
                    <label for="message-edit">{{ $t('editMessage') }}</label>
                    <textarea id="message-edit" ref="editor" v-model="draft" rows="5" />
                    <div><button type="button" @click="close">{{ $t('cancel') }}</button>
                        <button type="submit" :disabled="!draft.trim()">{{ $t('saveMessage') }}</button></div>
                </form>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
/* アプリ共通のポップアップ（フィルター等）と同じフォント・角丸・配色に揃える */
.message-actions { position: relative; -webkit-touch-callout: none; }
@media (pointer: coarse) { .message-actions { user-select: none; } }
.message-options { border: 0; background: transparent; color: #87929e; font-size: 22px; cursor: pointer; min-width: 44px; min-height: 44px; }
.message-overlay { position: fixed; inset: 0; z-index: 10000; }
.message-menu, .message-editor {
    font-family: 'Blueaka', 'Blueaka-kr-medium', sans-serif; font-weight: 600;
    background: #fff; color: #4b5a6f; border-radius: 11px; box-shadow: rgb(45 35 66 / 15%) 0 0 4px 2px; padding: 8px;
}
.message-menu { position: absolute; width: 224px; user-select: none; }
.message-menu button, .message-editor button {
    font-family: inherit; font-weight: inherit; font-size: 17px;
    color: #87929e; background: #fff; border: 1px solid #cdd3dc; border-radius: 5px; cursor: pointer;
}
.message-menu button:active, .message-editor button:active { transform: scale(0.95); transition: 0.08s; }
.message-menu button { display: block; white-space: nowrap; width: 100%; height: 44px; margin: 5px 0; text-align: center; }
.message-menu button:hover, .message-editor button:hover { background: #f3f7f8; }
.message-menu .delete { color: #bc3434; }
.editor-overlay { display: flex; align-items: center; justify-content: center; background: #0005; }
.message-editor { width: min(420px, calc(100vw - 32px)); padding: 16px; }
.message-editor label { font-size: 18px; }
.message-editor textarea { box-sizing: border-box; width: 100%; margin: 12px 0; padding: 8px; font: inherit; font-weight: 400; border: 1px solid #cdd3dc; border-radius: 5px; }
.message-editor div { display: flex; justify-content: flex-end; gap: 12px; }
.message-editor button { min-height: 44px; padding: 8px 16px; }
.message-editor button[type='submit'] { color: #fff; background: var(--theme_title_color, rgb(252, 150, 171)); border-color: var(--theme_title_color, rgb(252, 150, 171)); }
.message-editor button[type='submit']:disabled { opacity: 0.5; cursor: default; }
</style>
