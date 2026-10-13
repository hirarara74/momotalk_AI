<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { groqUsage } from '@/assets/ai/groqUsage'

const props = defineProps<{ apiKey: string; baseUrl: string; visible: boolean }>()
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
watch(() => props.visible, visible => {
    clearInterval(timer)
    now.value = Date.now()
    if (visible) timer = setInterval(() => { now.value = Date.now() }, 1000)
}, { immediate: true })
onUnmounted(() => clearInterval(timer))
const snapshot = computed(() => {
    const data = groqUsage.value
    return data?.apiKey === props.apiKey.trim() && data.baseUrl === props.baseUrl.replace(/\/+$/, '') ? data : null
})
const tokens = computed(() => snapshot.value?.tokens)
const resetSeconds = computed(() => tokens.value?.resetAt == null ? null : Math.max(0, Math.ceil((tokens.value.resetAt - now.value) / 1000)))
</script>

<template>
    <section class="groq-usage" :aria-label="$t('groqUsageTitle')">
        <strong>{{ $t('groqUsageTitle') }}</strong>
        <template v-if="tokens">
            <small>{{ snapshot?.model }}</small>
            <div aria-live="polite" aria-atomic="true">{{ $t('groqUsageTokens', { used: tokens.used.toLocaleString(), limit: tokens.limit.toLocaleString() }) }}</div>
            <progress :value="tokens.used" :max="tokens.limit" :aria-label="$t('groqUsageTitle')" />
            <div>{{ $t('groqUsageRemaining', { remaining: tokens.remaining.toLocaleString() }) }}</div>
            <div v-if="resetSeconds === null">{{ $t('groqUsageResetUnknown') }}</div>
            <div v-else-if="resetSeconds > 0">{{ $t('groqUsageReset', { minutes: Math.floor(resetSeconds / 60), seconds: resetSeconds % 60 }) }}</div>
            <div v-else>{{ $t('groqUsageExpired') }}</div>
            <small>{{ $t('groqUsageObserved', { time: new Date(tokens.observedAt).toLocaleTimeString() }) }}</small>
        </template>
        <p v-else>{{ $t('groqUsageEmpty') }}</p>
        <small>{{ $t('groqUsageScope') }} <a href="https://console.groq.com/dashboard/usage" target="_blank" rel="noopener noreferrer">Groq Console ↗</a></small>
    </section>
</template>

<style scoped>
.groq-usage { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; padding: 12px; border: 1px solid #dce5ec; border-radius: 6px; color: #34495e; font-size: 13px; line-height: 1.5; }
.groq-usage small { font-size: 11px; overflow-wrap: anywhere; }
.groq-usage p { margin: 0; }
.groq-usage progress { width: 100%; height: 8px; accent-color: #ff8eab; }
.groq-usage a { color: #2888e2; }
</style>
