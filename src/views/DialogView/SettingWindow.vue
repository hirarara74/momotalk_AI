<script setup lang="ts">
import { computed, ref } from 'vue'
import { store } from '@/assets/storeUtils/store'
import IconClose from '@/components/icons/IconClose.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLog from '@/components/icons/IconLog.vue'
import { testImageProviderConnection } from '@/assets/imageGen'

const activePage = computed(() => store.settingDialogPage || 1)

const showPage = (num: number) => {
    store.setSettingDialogPage(num)
}

const showImageApiKey = ref(false)
const isTestingImageKey = ref(false)
const imageKeyTestResult = ref<{ success: boolean; warning?: boolean; message: string; details?: any } | null>(null)

const runImageKeyTest = async () => {
    if (isTestingImageKey.value) return
    isTestingImageKey.value = true
    imageKeyTestResult.value = null
    try {
        const result = await testImageProviderConnection(
            store.imageGenProvider || 'pollinations',
            store.imageGenApiKey,
            store.imageGenModel
        )
        imageKeyTestResult.value = result
    } catch (err: any) {
        imageKeyTestResult.value = {
            success: false,
            message: `テスト失敗: ${err?.message || String(err)}`
        }
    } finally {
        isTestingImageKey.value = false
    }
}


const onImageProviderChange = () => {
    if (store.imageGenProvider === 'pollinations') {
        if (!store.imageGenModel || store.imageGenModel.includes('fal-ai') || store.imageGenModel.includes('black-forest-labs')) {
            store.imageGenModel = 'flux'
        }
    } else if (store.imageGenProvider === 'fal') {
        if (!store.imageGenModel || store.imageGenModel === 'flux' || store.imageGenModel.includes('black-forest-labs')) {
            store.imageGenModel = 'fal-ai/flux/schnell'
        }
    } else if (store.imageGenProvider === 'together') {
        if (!store.imageGenModel || store.imageGenModel === 'flux' || store.imageGenModel.includes('fal-ai')) {
            store.imageGenModel = 'black-forest-labs/FLUX.1-schnell'
        }
    } else if (store.imageGenProvider === 'openai') {
        if (!store.imageGenModel || !store.imageGenModel.startsWith('dall-e')) {
            store.imageGenModel = 'dall-e-3'
        }
    } else if (store.imageGenProvider === 'stability') {
        if (!store.imageGenModel || !store.imageGenModel.includes('stable-diffusion')) {
            store.imageGenModel = 'stable-diffusion-xl-1024-v1-0'
        }
    }
    store.setData()
}

const changeTheme = () => {
    if (store.theme !== 'momotalk') store.theme = 'momotalk'
    if (store.zoom < 0.5 || store.zoom > 1.5) store.zoom = 1
    var fullScreen = store.fullScreen ? 'full-screen' : 'not-full-screen'
    document.body.className = store.theme + ' ' + fullScreen
    document.body.style.setProperty('--zoom', store.zoom.toString())
}

const onProviderChange = () => {
    if (store.aiProvider === 'groq') {
        if (!store.aiApiKey || store.aiApiKey.startsWith('AIzaSy')) {
            store.aiApiKey = ''
        }
        if (!store.aiModel || store.aiModel.includes('gemini') || store.aiModel.includes('gpt-')) {
            store.aiModel = 'qwen/qwen3.8-27b'
        }
        if (!store.aiBaseUrl || store.aiBaseUrl.includes('openai.com')) {
            store.aiBaseUrl = 'https://api.groq.com/openai/v1'
        }
    }
    store.setData()
}
</script>

<template>
    <transition name="dialog-fade">
        <div
            v-if="store.showSettingDialog"
            class="dialog-mask flex-center"
            @click="store.showSettingDialog = false"
        >
            <div class="popper-content popper-content--setting" @click.stop>
                <div class="popper-content__title">
                    <header>
                        <span>{{ $t('setting') }}</span>
                    </header>
                    <button class="close-btn" @click="store.showSettingDialog = false">
                        <IconClose class="icon close" />
                    </button>
                </div>

                <ul class="popper-content__tabs">
                    <li @click="showPage(1)" class="page-btn" :class="{ active: activePage === 1 }" id="page-1">
                        {{ $t('basicSetting') }}
                    </li>
                    <li class="divider">/</li>
                    <li @click="showPage(2)" class="page-btn" :class="{ active: activePage === 2 }" id="page-2">
                        {{ $t('aiSetting') || 'AI' }}
                    </li>
                    <li class="divider">/</li>
                    <li class="page-btn" :class="{ active: activePage === 3 }">
                        <button class="tab-button" :class="{ active: activePage === 3 }" @click="store.setSettingDialogPage(3)">{{ $t('imageGenSetting') }}</button>
                    </li>
                </ul>

                <div class="featured">
                    <!-- Page 1: 基本設定 -->
                    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
                        <div class="dialog-content left-align" style="padding-top: 25px">
                            <div class="settings-row">
                                <span class="row-label">{{ $t('zoom') }}</span>
                                <div class="row-controls custom-range">
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="1.5"
                                        step="0.01"
                                        v-model="store.zoom"
                                        @change="store.setData(); changeTheme()"
                                        :style="{
                                            '--range-progress': `${
                                                (store.zoom - 0.5) * 100
                                            }%`
                                        }"
                                    />
                                    <span class="range-value">{{
                                        Number(store.zoom).toFixed(2)
                                    }}</span>
                                </div>
                            </div>

                            <div class="settings-row">
                                <span class="row-label">{{ $t('fullScreen') }}</span>
                                <div class="row-controls">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.fullScreen"
                                            @change="store.setData(); changeTheme()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-row">
                                <span class="row-label">{{ $t('enableDrag') }}</span>
                                <div class="row-controls">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.draggable"
                                            @change="store.setData()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-row">
                                <span class="row-label">{{ $t('soundEffects') }}</span>
                                <div class="row-controls">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.soundEnabled"
                                            @change="store.setData()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-row" v-if="store.soundEnabled">
                                <span class="row-label">{{ $t('soundVolume') }}</span>
                                <div class="row-controls custom-range">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        v-model.number="store.soundVolume"
                                        @change="store.setData()"
                                        :style="{
                                            '--range-progress': `${
                                                store.soundVolume * 100
                                            }%`
                                        }"
                                    />
                                    <span class="range-value">{{
                                        Math.round(store.soundVolume * 100)
                                    }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Page 2: AI設定 -->
                    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
                        <div class="dialog-content left-align" style="padding-top: 20px">
                            <div class="settings-row">
                                <span class="row-label">{{ $t('aiProvider') }}</span>
                                <div class="row-controls">
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="groq"
                                            name="provider"
                                            v-model="store.aiProvider"
                                            @change="onProviderChange()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">Groq</span>
                                    </label>
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="gemini"
                                            name="provider"
                                            v-model="store.aiProvider"
                                            @change="onProviderChange()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">Gemini</span>
                                    </label>
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="openai"
                                            name="provider"
                                            v-model="store.aiProvider"
                                            @change="onProviderChange()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">OpenAI</span>
                                    </label>
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="claude"
                                            name="provider"
                                            v-model="store.aiProvider"
                                            @change="onProviderChange()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">Claude</span>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-row settings-row--column">
                                <span class="row-label">API Key</span>
                                <input
                                    type="password"
                                    class="ai-input"
                                    :placeholder="store.aiProvider === 'groq' ? $t('apiKeyPlaceholderGroq') : $t('apiKeyPlaceholder')"
                                    v-model="store.aiApiKey"
                                    @change="store.setData()"
                                    style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                />
                                <div class="api-key-hint" style="font-size: 12px; color: #8899a6; margin-top: 2px;">
                                    <span v-if="store.aiProvider === 'groq'">
                                        {{ $t('groqKeyNoticePrefix') }}<a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">Groq Console</a>{{ $t('groqKeyNoticeSuffix') }}
                                    </span>
                                    <span v-else-if="store.aiProvider === 'gemini'">
                                        {{ $t('geminiKeyNoticePrefix') }}<a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">Google AI Studio</a>{{ $t('geminiKeyNoticeSuffix') }}
                                    </span>
                                </div>
                                <div class="api-key-security-badge" style="font-size: 11px; color: #2e7d32; background: #e8f5e9; padding: 6px 10px; border-radius: 6px; margin-top: 6px; display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;">
                                    <span style="font-size: 13px; line-height: 1;">🔒</span>
                                    <span>{{ $t('keySecurityReassurance') }}</span>
                                </div>
                            </div>

                            <div class="settings-row settings-row--column">
                                <span class="row-label">{{ $t('modelLabel') }}</span>
                                <input
                                    type="text"
                                    class="ai-input"
                                    :placeholder="store.aiProvider === 'groq' ? $t('modelPlaceholderGroq') : (store.aiProvider === 'gemini' ? $t('modelPlaceholderGemini') : $t('modelPlaceholderOpenai'))"
                                    v-model="store.aiModel"
                                    @change="store.setData()"
                                    style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                />
                                <div v-if="store.aiProvider === 'groq'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.aiModel === 'openai/gpt-oss-120b' }"
                                        @click="store.aiModel = 'openai/gpt-oss-120b'; store.setData()"
                                        :title="$t('modelChipTop120bTitle')"
                                    >
                                        {{ $t('modelChipTop120b') }}
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.aiModel === 'qwen/qwen3.8-27b' || !store.aiModel }"
                                        @click="store.aiModel = 'qwen/qwen3.8-27b'; store.setData()"
                                        :title="$t('modelChipStd27bTitle')"
                                    >
                                        {{ $t('modelChipStd27b') }}
                                    </button>
                                </div>
                                <div v-if="store.aiProvider === 'gemini'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.aiModel === 'gemini-3.5-flash' }"
                                        @click="store.aiModel = 'gemini-3.5-flash'; store.setData()"
                                    >
                                        {{ $t('modelChipGeminiPro') }}
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.aiModel === 'gemini-3.5-flash-lite' || !store.aiModel }"
                                        @click="store.aiModel = 'gemini-3.5-flash-lite'; store.setData()"
                                    >
                                        {{ $t('modelChipGeminiLite') }}
                                    </button>
                                </div>
                            </div>

                            <div v-if="store.aiProvider !== 'gemini'" class="settings-row settings-row--column">
                                <span class="row-label">{{ $t('customBaseUrlLabel') }}</span>
                                <input
                                    type="text"
                                    class="ai-input"
                                    :placeholder="store.aiProvider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1'"
                                    v-model="store.aiBaseUrl"
                                    @change="store.setData()"
                                    style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                />
                            </div>

                            <div class="settings-row settings-row--sleep" style="margin-top: 8px; justify-content: space-between; align-items: center;">
                                <div style="display: flex; flex-direction: column; gap: 3px; max-width: 80%;">
                                    <span class="row-label sleep-label" style="font-size: 14px;">{{ $t('sleepRhythm') }}</span>
                                    <span style="font-size: 11px; color: #7f8c8d; line-height: 1.4;">{{ $t('sleepRhythmDesc') }}</span>
                                </div>
                                <div class="row-controls" style="justify-content: flex-end; flex: 0 0 auto;">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.sleepSimulationEnabled"
                                            @change="store.setData()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Page 3: 写真・画像設定 -->
                    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
                        <div class="dialog-content left-align" style="padding-top: 20px">
                            <!-- 1. Enable / Disable Photo Generation Switch -->
                            <div class="settings-row" style="justify-content: space-between; align-items: center;">
                                <div style="display: flex; flex-direction: column; gap: 3px; max-width: 80%;">
                                    <span class="row-label" style="font-size: 14px;">{{ $t('imageGenEnabled') }}</span>
                                    <span style="font-size: 11px; color: #7f8c8d; line-height: 1.4;">{{ $t('imageGenEnabledDesc') }}</span>
                                </div>
                                <div class="row-controls" style="justify-content: flex-end; flex: 0 0 auto;">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.imageGenEnabled"
                                            @change="store.setData()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- 2. Provider Selection -->
                            <div class="settings-row settings-row--column" style="margin-top: 10px;">
                                <span class="row-label">{{ $t('imageGenProvider') }}</span>
                                <div class="row-controls" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
                                    <label class="custom-radio" style="align-items: flex-start;">
                                        <input
                                            type="radio"
                                            value="pollinations"
                                            name="imageGenProvider"
                                            v-model="store.imageGenProvider"
                                            @change="onImageProviderChange()"
                                        />
                                        <span class="radio-mark" style="margin-top: 2px;"></span>
                                        <div style="display: flex; flex-direction: column; gap: 2px;">
                                            <span class="radio-text" style="font-weight: 500;">Pollinations.ai</span>
                                            <span style="font-size: 11px; color: #7f8c8d;">{{ $t('pollinationsDesc') }}</span>
                                        </div>
                                    </label>

                                    <label class="custom-radio" style="align-items: flex-start;">
                                        <input
                                            type="radio"
                                            value="fal"
                                            name="imageGenProvider"
                                            v-model="store.imageGenProvider"
                                            @change="onImageProviderChange()"
                                        />
                                        <span class="radio-mark" style="margin-top: 2px;"></span>
                                        <div style="display: flex; flex-direction: column; gap: 2px;">
                                            <span class="radio-text" style="font-weight: 500;">Fal.ai (BYOK)</span>
                                            <span style="font-size: 11px; color: #7f8c8d;">{{ $t('falDesc') }}</span>
                                        </div>
                                    </label>

                                    <label class="custom-radio" style="align-items: flex-start;">
                                        <input
                                            type="radio"
                                            value="together"
                                            name="imageGenProvider"
                                            v-model="store.imageGenProvider"
                                            @change="onImageProviderChange()"
                                        />
                                        <span class="radio-mark" style="margin-top: 2px;"></span>
                                        <div style="display: flex; flex-direction: column; gap: 2px;">
                                            <span class="radio-text" style="font-weight: 500;">Together AI (BYOK)</span>
                                            <span style="font-size: 11px; color: #7f8c8d;">{{ $t('togetherDesc') }}</span>
                                        </div>
                                    </label>

                                    <label class="custom-radio" style="align-items: flex-start;">
                                        <input
                                            type="radio"
                                            value="openai"
                                            name="imageGenProvider"
                                            v-model="store.imageGenProvider"
                                            @change="onImageProviderChange()"
                                        />
                                        <span class="radio-mark" style="margin-top: 2px;"></span>
                                        <div style="display: flex; flex-direction: column; gap: 2px;">
                                            <span class="radio-text" style="font-weight: 500;">OpenAI DALL-E (BYOK)</span>
                                            <span style="font-size: 11px; color: #7f8c8d;">{{ $t('openaiDesc') }}</span>
                                        </div>
                                    </label>

                                    <label class="custom-radio" style="align-items: flex-start;">
                                        <input
                                            type="radio"
                                            value="stability"
                                            name="imageGenProvider"
                                            v-model="store.imageGenProvider"
                                            @change="onImageProviderChange()"
                                        />
                                        <span class="radio-mark" style="margin-top: 2px;"></span>
                                        <div style="display: flex; flex-direction: column; gap: 2px;">
                                            <span class="radio-text" style="font-weight: 500;">Stability AI (BYOK)</span>
                                            <span style="font-size: 11px; color: #7f8c8d;">{{ $t('stabilityDesc') }}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <!-- 3. BYOK API Key Input (when non-pollinations is selected) -->
                            <div v-if="store.imageGenProvider !== 'pollinations'" class="settings-row settings-row--column" style="margin-top: 10px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span class="row-label">{{ $t('imageGenApiKey') }}</span>
                                    <button
                                        type="button"
                                        class="key-toggle-btn"
                                        @click="showImageApiKey = !showImageApiKey"
                                        style="background: none; border: none; cursor: pointer; font-size: 12px; color: #2888e2; padding: 2px 4px;"
                                    >
                                        {{ showImageApiKey ? 'Hide' : 'Show' }}
                                    </button>
                                </div>
                                <div style="position: relative; width: 100%;">
                                    <input
                                        :type="showImageApiKey ? 'text' : 'password'"
                                        class="ai-input"
                                        :placeholder="$t('imageGenApiKeyPlaceholder')"
                                        v-model="store.imageGenApiKey"
                                        @change="store.setData()"
                                        style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                    />
                                </div>
                                <div class="api-key-hint" style="font-size: 12px; color: #8899a6; margin-top: 4px;">
                                    <span v-if="store.imageGenProvider === 'fal'">
                                        {{ $t('imageGenKeyNoticePrefix') }}<a href="https://fal.ai/dashboard/keys" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">Fal.ai Dashboard</a>{{ $t('imageGenKeyNoticeSuffix') }}
                                    </span>
                                    <span v-else-if="store.imageGenProvider === 'together'">
                                        {{ $t('imageGenKeyNoticePrefix') }}<a href="https://api.together.ai/settings/api-keys" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">Together AI Settings</a>{{ $t('imageGenKeyNoticeSuffix') }}
                                    </span>
                                    <span v-else-if="store.imageGenProvider === 'openai'">
                                        {{ $t('imageGenKeyNoticePrefix') }}<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">OpenAI API Keys</a>{{ $t('imageGenKeyNoticeSuffix') }}
                                    </span>
                                    <span v-else-if="store.imageGenProvider === 'stability'">
                                        {{ $t('imageGenKeyNoticePrefix') }}<a href="https://platform.stability.ai/account/keys" target="_blank" rel="noopener noreferrer" style="color: #2888e2; text-decoration: underline;">Stability AI Keys</a>{{ $t('imageGenKeyNoticeSuffix') }}
                                    </span>
                                </div>
                                <div class="api-key-security-badge" style="font-size: 11px; color: #2e7d32; background: #e8f5e9; padding: 6px 10px; border-radius: 6px; margin-top: 6px; display: flex; align-items: flex-start; gap: 6px; line-height: 1.4;">
                                    <span style="font-size: 13px; line-height: 1;">🔒</span>
                                    <span>{{ $t('imageGenKeySecurityReassurance') }}</span>
                                </div>

                                <!-- Connection & Balance Test Action -->
                                <div style="display: flex; gap: 8px; margin-top: 8px; align-items: center; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="test-key-btn"
                                        @click="runImageKeyTest"
                                        :disabled="isTestingImageKey || !store.imageGenApiKey"
                                        style="padding: 5px 12px; font-size: 12px; font-weight: 500; background: #2888e2; color: #fff; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                                        :style="{ opacity: (!store.imageGenApiKey || isTestingImageKey) ? 0.6 : 1, cursor: (!store.imageGenApiKey || isTestingImageKey) ? 'not-allowed' : 'pointer' }"
                                    >
                                        <span v-if="isTestingImageKey">⏳ {{ $t('testingConnection') }}</span>
                                        <span v-else>🔍 {{ $t('testConnection') }}</span>
                                    </button>
                                    <span v-if="store.imageGenProvider === 'stability'" style="font-size: 11px;">
                                        <a href="https://platform.stability.ai/account/credits" target="_blank" rel="noopener noreferrer" style="color: #e67e22; text-decoration: underline;">
                                            💳 {{ $t('creditChargeLink') }}
                                        </a>
                                    </span>
                                </div>

                                <!-- Test Result Card -->
                                <div
                                    v-if="imageKeyTestResult"
                                    style="margin-top: 8px; padding: 8px 10px; border-radius: 6px; font-size: 12px; line-height: 1.4; display: flex; flex-direction: column; gap: 4px;"
                                    :style="{
                                        background: imageKeyTestResult.warning ? '#fff8e1' : (imageKeyTestResult.success ? '#e8f5e9' : '#ffebee'),
                                        color: imageKeyTestResult.warning ? '#f57c00' : (imageKeyTestResult.success ? '#2e7d32' : '#c62828'),
                                        border: `1px solid ${imageKeyTestResult.warning ? '#ffe082' : (imageKeyTestResult.success ? '#c8e6c9' : '#ffcdd2')}`
                                    }"
                                >
                                    <div style="display: flex; align-items: center; gap: 6px; font-weight: 600;">
                                        <span>{{ imageKeyTestResult.warning ? '⚠️' : (imageKeyTestResult.success ? '✅' : '❌') }}</span>
                                        <span>{{ imageKeyTestResult.message }}</span>
                                    </div>
                                    <div v-if="imageKeyTestResult.warning && store.imageGenProvider === 'stability'" style="margin-top: 2px;">
                                        <span>👉 </span>
                                        <a href="https://platform.stability.ai/account/credits" target="_blank" rel="noopener noreferrer" style="color: #d84315; text-decoration: underline; font-weight: 500;">
                                            Stability AI ダッシュボードでクレジットを購入する
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- 4. Model Selection & Chips -->
                            <div class="settings-row settings-row--column" style="margin-top: 10px;">
                                <span class="row-label">{{ $t('imageGenModel') }}</span>
                                <input
                                    type="text"
                                    class="ai-input"
                                    :placeholder="store.imageGenProvider === 'fal' ? 'fal-ai/flux/schnell' : (store.imageGenProvider === 'together' ? 'black-forest-labs/FLUX.1-schnell' : (store.imageGenProvider === 'openai' ? 'dall-e-3' : (store.imageGenProvider === 'stability' ? 'stable-diffusion-xl-1024-v1-0' : 'flux')))"
                                    v-model="store.imageGenModel"
                                    @change="store.setData()"
                                    style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                />
                                <div v-if="store.imageGenProvider === 'pollinations'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'flux' || !store.imageGenModel }"
                                        @click="store.imageGenModel = 'flux'; store.setData()"
                                    >
                                        flux (推奨・安定アニメ)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'sana' }"
                                        @click="store.imageGenModel = 'sana'; store.setData()"
                                    >
                                        sana (イラスト調)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'turbo' }"
                                        @click="store.imageGenModel = 'turbo'; store.setData()"
                                    >
                                        turbo (超高速)
                                    </button>
                                </div>
                                <div v-else-if="store.imageGenProvider === 'fal'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'fal-ai/illustrious' || (!store.imageGenModel && store.imageGenProvider === 'fal') }"
                                        @click="store.imageGenModel = 'fal-ai/illustrious'; store.setData()"
                                    >
                                        illustrious (★ アニメ最高峰)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'fal-ai/animagine-xl-3.1' }"
                                        @click="store.imageGenModel = 'fal-ai/animagine-xl-3.1'; store.setData()"
                                    >
                                        animagine-xl-3.1 (アニメ特化)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'fal-ai/flux/schnell' }"
                                        @click="store.imageGenModel = 'fal-ai/flux/schnell'; store.setData()"
                                    >
                                        flux/schnell (超高速)
                                    </button>
                                </div>
                                <div v-else-if="store.imageGenProvider === 'together'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'black-forest-labs/FLUX.1-schnell' || !store.imageGenModel }"
                                        @click="store.imageGenModel = 'black-forest-labs/FLUX.1-schnell'; store.setData()"
                                    >
                                        FLUX.1-schnell (Recommended)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'stabilityai/stable-diffusion-xl-base-1.0' }"
                                        @click="store.imageGenModel = 'stabilityai/stable-diffusion-xl-base-1.0'; store.setData()"
                                    >
                                        SDXL 1.0 (イラスト調)
                                    </button>
                                </div>
                                <div v-else-if="store.imageGenProvider === 'openai'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'dall-e-3' || !store.imageGenModel }"
                                        @click="store.imageGenModel = 'dall-e-3'; store.setData()"
                                    >
                                        dall-e-3 (★ 超美麗・高精細)
                                    </button>
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'dall-e-2' }"
                                        @click="store.imageGenModel = 'dall-e-2'; store.setData()"
                                    >
                                        dall-e-2 (標準/高速)
                                    </button>
                                </div>
                                <div v-else-if="store.imageGenProvider === 'stability'" style="display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap;">
                                    <button
                                        type="button"
                                        class="model-chip"
                                        :class="{ active: store.imageGenModel === 'stable-diffusion-xl-1024-v1-0' || !store.imageGenModel }"
                                        @click="store.imageGenModel = 'stable-diffusion-xl-1024-v1-0'; store.setData()"
                                    >
                                        SDXL 1.0 (★ アニメプリセット)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="popper-content__footer-links">
                    <a
                        href="https://github.com/hirarara74/momotalk_AI"
                        class="icon-link"
                        title="GITHUB"
                        target="_blank"
                        rel="noopener noreferrer"
                        ><IconGithub
                    /></a>
                    <a
                        href="https://github.com/hirarara74/momotalk_AI/blob/main/docs/update_log.md"
                        class="icon-link"
                        title="LOG"
                        target="_blank"
                        rel="noopener noreferrer"
                        ><IconLog
                    /></a>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
@import './dialog-view.scss';

.ai-input:focus {
    border-color: var(--theme_title_color) !important;
}

.tab-button {
    background: transparent;
    border: none;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    white-space: nowrap;
    outline: none;

    &.active {
        color: var(--theme_title_color);
        font-weight: bold;
    }
}

.featured .page {
    width: 100%;
    min-width: 100%;
    flex-shrink: 0;
}
</style>
