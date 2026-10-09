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
        x: Math.max(8, Math.min(x, window.innerWidth - 208)),
        y: Math.max(8, Math.min(y, window.innerHeight - 152))
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
.message-actions { position: relative; -webkit-touch-callout: none; }
@media (pointer: coarse) { .message-actions { user-select: none; } }
.message-options { border: 0; background: transparent; color: #526677; font-size: 22px; cursor: pointer; min-width: 44px; min-height: 44px; }
.message-overlay { position: fixed; inset: 0; z-index: 10000; }
.message-menu, .message-editor { background: white; color: #263747; border-radius: 12px; box-shadow: 0 4px 24px #0003; padding: 8px; }
.message-menu { position: absolute; width: 192px; }
.message-menu button { display: block; width: 100%; text-align: left; padding: 12px; border: 0; background: white; cursor: pointer; }
.message-menu button:hover { background: #eef5fc; }
.message-menu .delete { color: #bc3434; }
.editor-overlay { display: flex; align-items: center; justify-content: center; background: #0005; }
.message-editor { width: min(420px, calc(100vw - 32px)); padding: 16px; }
.message-editor textarea { box-sizing: border-box; width: 100%; margin: 12px 0; padding: 8px; font: inherit; }
.message-editor div { display: flex; justify-content: flex-end; gap: 12px; }
.message-editor button { min-height: 44px; padding: 8px 16px; cursor: pointer; }
</style>
