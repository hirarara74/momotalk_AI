<script setup lang="ts">
import { store } from '@/assets/storeUtils/store'
import { importJson, exportJson } from '@/assets/storeUtils/file'
import { importCard, exportCard } from '@/assets/chatUtils/play'
import IconClose from '@/components/icons/IconClose.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLog from '@/components/icons/IconLog.vue'

const showPage = (num: number) => {
    const pageElements = document.querySelectorAll('.page')
    pageElements.forEach((element) => {
        element.setAttribute('style', `transform: translateX(${(num - 1) * -100}%);`)
    })
    const btnElements = document.querySelectorAll('.page-btn')
    btnElements.forEach((element) => {
        element.classList.remove('active')
    })
    const selectedPage = document.getElementById(`page-${num}`)
    if (selectedPage) selectedPage.classList.add('active')
}

const changeTheme = () => {
    if (store.theme !== 'momotalk' && store.theme !== 'yuzutalk') store.theme = 'momotalk'
    if (store.zoom < 0.5 || store.zoom > 1.5) store.zoom = 1
    var fullScreen = store.fullScreen ? 'full-screen' : 'not-full-screen'
    document.body.className = store.theme + ' ' + fullScreen
    document.body.style.setProperty('--zoom', store.zoom.toString())
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
                    <li @click="showPage(1)" class="page-btn active" id="page-1">
                        {{ $t('basicSetting') }}
                    </li>
                    <li class="divider">/</li>
                    <li @click="showPage(2)" class="page-btn" id="page-2">
                        {{ $t('sharefile') }}
                    </li>
                </ul>

                <div class="featured">
                    <div class="page">
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
                        </div>
                    </div>

                    <div class="page">
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
                        href="https://github.com/U1805/momotalk"
                        class="icon-link"
                        title="GITHUB"
                        ><IconGithub
                    /></a>
                    <a
                        href="https://github.com/U1805/momotalk/blob/main/docs/update_log.md"
                        class="icon-link"
                        title="LOG"
                        ><IconLog
                    /></a>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
@import './dialog-view.scss';
</style>
