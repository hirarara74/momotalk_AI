<script setup lang="ts">
import { computed } from 'vue'
import { store } from '@/assets/storeUtils/store'
import { importJson, exportJson } from '@/assets/storeUtils/file'
import { importCard, exportCard } from '@/assets/chatUtils/play'
import IconClose from '@/components/icons/IconClose.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLog from '@/components/icons/IconLog.vue'

const activePage = computed(() => store.settingDialogPage || 1)

const showPage = (num: number) => {
    store.settingDialogPage = num
}

const changeTheme = () => {
    if (store.theme !== 'momotalk' && store.theme !== 'yuzutalk') store.theme = 'momotalk'
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
                    <li @click="showPage(3)" class="page-btn" :class="{ active: activePage === 3 }" id="page-3">
                        {{ $t('sharefile') }}
                    </li>
                </ul>

                <div class="featured">
                    <!-- Page 1: 基本設定 -->
                    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
                        <div class="dialog-content left-align" style="padding-top: 25px">
                            <div class="settings-row">
                                <span class="row-label">{{ $t('renderStyle') }}</span>
                                <div class="row-controls">
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="momotalk"
                                            name="style"
                                            v-model="store.theme"
                                            @change="store.setData(); changeTheme()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">momotalk</span>
                                    </label>
                                    <label class="custom-radio">
                                        <input
                                            type="radio"
                                            value="yuzutalk"
                                            name="style"
                                            v-model="store.theme"
                                            @change="store.setData(); changeTheme()"
                                        />
                                        <span class="radio-mark"></span>
                                        <span class="radio-text">yuzutalk</span>
                                    </label>
                                </div>
                            </div>

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
                                <span class="row-label">{{ $t('aiEnabled') }}</span>
                                <div class="row-controls">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.aiEnabled"
                                            @change="store.setData()"
                                        />
                                        <div class="switch-track">
                                            <div class="switch-thumb"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

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

                            <div class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 6px;">
                                <span class="row-label" style="font-size: 15px;">API Key</span>
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

                            <div class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 6px;">
                                <span class="row-label" style="font-size: 15px;">{{ $t('modelLabel') }}</span>
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

                            <div v-if="store.aiProvider !== 'gemini'" class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 6px;">
                                <span class="row-label" style="font-size: 15px;">{{ $t('customBaseUrlLabel') }}</span>
                                <input
                                    type="text"
                                    class="ai-input"
                                    :placeholder="store.aiProvider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1'"
                                    v-model="store.aiBaseUrl"
                                    @change="store.setData()"
                                    style="width: 100%; box-sizing: border-box; padding: 8px 12px; border: 1px solid #dce5ec; border-radius: 6px; font-size: 14px; outline: none;"
                                />
                            </div>

                            <div class="settings-row" style="margin-top: 8px; justify-content: space-between; align-items: center;">
                                <div style="display: flex; flex-direction: column; gap: 3px; max-width: 80%;">
                                    <span class="row-label" style="font-size: 14px;">{{ $t('sleepRhythm') }}</span>
                                    <span style="font-size: 11px; color: #7f8c8d; line-height: 1.4;">{{ $t('sleepRhythmDesc') }}</span>
                                </div>
                                <div class="row-controls" style="justify-content: flex-end; flex: 0 0 auto;">
                                    <label class="custom-switch">
                                        <input
                                            type="checkbox"
                                            v-model="store.sleepSimulationEnabled"
                                            @change="store.setData()"
                                        />
                                        <span class="switch-track"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Page 3: 共有ファイル -->
                    <div class="page" :style="{ transform: `translateX(${(activePage - 1) * -100}%)` }">
                        <div class="popper-content__line">
                            <span>{{ $t('importAndExport') }}</span>
                        </div>
                        <div class="popper-content__button-group">
                            <div>
                                <button @click="exportJson">
                                    <span>{{ $t('exportButton') }}</span>
                                </button>
                                <button class="active" @click="importJson">
                                    <span>{{ $t('importButton') }}</span>
                                </button>
                            </div>
                        </div>

                        <div class="popper-content__line">
                            <span>{{ $t('sharedFile') }}</span>
                        </div>
                        <div class="popper-content__button-group">
                            <div>
                                <button @click="exportCard">
                                    <span>{{ $t('exportButton') }}</span>
                                </button>
                                <button class="active" @click="importCard">
                                    <span>{{ $t('importButton') }}</span>
                                </button>
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
</style>
