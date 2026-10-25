<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import i18n from '@/locales/i18n'
import { rateLimitNotice, formatWait } from '@/assets/ai/rateLimit'
import IconClose from '@/components/icons/IconClose.vue'

const tr = (key: string, params?: Record<string, unknown>) => String(i18n.global.t(key, params || {}))
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
watch(rateLimitNotice, notice => {
    clearInterval(timer)
    now.value = Date.now()
    if (notice) timer = setInterval(() => { now.value = Date.now() }, 1000)
}, { immediate: true })
onUnmounted(() => clearInterval(timer))

const remainingMs = computed(() => rateLimitNotice.value ? rateLimitNotice.value.resetAt - now.value : 0)
const close = () => { rateLimitNotice.value = null }
</script>

<template>
    <transition name="dialog-fade">
        <div v-if="rateLimitNotice" class="dialog-mask flex-center" @click="close">
            <div class="popper-content rate-limit-dialog" role="alertdialog" aria-live="assertive" @click.stop>
                <div class="popper-content__title">
                    <header>{{ $t('rateLimitPopupTitle') }}</header>
                    <button class="close-btn" @click="close" aria-label="Close" title="Close">
                        <IconClose class="icon close" />
                    </button>
                </div>
                <div class="popper-content__body rate-limit-body">
                    <p v-if="remainingMs > 0"><strong>{{ $t('rateLimitPopupBody', { time: formatWait(remainingMs, tr) }) }}</strong></p>
                    <p v-else><strong>{{ $t('rateLimitPopupResumed') }}</strong></p>
                    <p>{{ $t('rateLimitPopupShared') }}</p>
                    <button class="rate-limit-ok" @click="close">{{ $t('rateLimitPopupClose') }}</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
@import './dialog-view.scss';

.rate-limit-body {
    padding: 16px 20px 20px;
    line-height: 1.6;
    font-size: 15px;
    color: #2a323e;
}

.rate-limit-ok {
    margin-top: 8px;
    padding: 8px 24px;
    border: 0;
    border-radius: 8px;
    background: #4c5b70;
    color: #fff;
    cursor: pointer;
}
</style>
