<script setup lang="ts">
import { store } from '@/assets/storeUtils/store'
import { play } from '@/assets/chatUtils/play'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const router = useRouter()
const storyLng = ref<string>('MessageJP')

const openDropdown = ref<string | null>(null)

const toggleDropdown = (type: string) => {
    openDropdown.value = openDropdown.value === type ? null : type
}

const closeDropdowns = () => {
    openDropdown.value = null
}

const selectStory = (story: string) => {
    store.storyFile = story
    openDropdown.value = null
    const availableLngs = store.storyList[story] || []
    if (!availableLngs.includes(storyLng.value)) {
        storyLng.value = availableLngs[0] || ''
    }
}

const selectLng = (lng: string) => {
    storyLng.value = lng
    openDropdown.value = null
}

const playMomotalk = async (confirm: boolean) => {
    closeDropdowns()
    let res = await play(confirm, store.storyKey, store.storyFile, storyLng.value)
    let newQuery = JSON.parse(JSON.stringify(route.query))
    delete newQuery.id
    router.replace({ query: newQuery })
    if (!res) router.push({ name: 'info' })
}
</script>

<template>
    <transition name="dialog-fade">
        <div
            v-if="store.showPlayerDialog"
            class="dialog-mask flex-center"
            @click="playMomotalk(false)"
        >
            <div
                class="popper-content popper-content--player"
                @click.stop="closeDropdowns"
            >
                <div class="popper-content__title">
                    <header>
                        <svg
                            class="title-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        <span>{{ $t('playerTitle') }}</span>
                    </header>
                </div>

                <div class="popper-content__body">
                    <p class="desc">{{ $t('playerContent') }}</p>

                    <!-- 1. 选择故事 -->
                    <div class="form-group">
                        <label>{{ $t('selectStory') }}</label>
                        <div class="custom-select" @click.stop="toggleDropdown('story')">
                            <div
                                class="select-trigger"
                                :class="{ open: openDropdown === 'story' }"
                            >
                                <span>{{ store.storyFile }}</span>
                                <svg class="arrow" viewBox="0 0 24 24">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                            <transition name="dropdown">
                                <div
                                    class="select-dropdown"
                                    v-show="openDropdown === 'story'"
                                >
                                    <div
                                        class="option"
                                        v-for="(momotalk, index) in Object.keys(
                                            store.storyList
                                        )"
                                        :key="index"
                                        :class="{ active: store.storyFile === momotalk }"
                                        @click.stop="selectStory(momotalk)"
                                    >
                                        {{ momotalk }}
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>

                    <!-- 2. 选择语言 -->
                    <div class="form-group">
                        <label>{{ $t('selectLanguage') }}</label>
                        <div class="custom-select" @click.stop="toggleDropdown('lng')">
                            <div
                                class="select-trigger"
                                :class="{ open: openDropdown === 'lng' }"
                            >
                                <span>{{ storyLng }}</span>
                                <svg class="arrow" viewBox="0 0 24 24">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                            <transition name="dropdown">
                                <div
                                    class="select-dropdown"
                                    v-show="openDropdown === 'lng'"
                                >
                                    <div
                                        class="option"
                                        v-for="(lng, index) in store.storyList[
                                            store.storyFile
                                        ]"
                                        :key="index"
                                        :class="{ active: storyLng === lng }"
                                        @click.stop="selectLng(lng)"
                                    >
                                        {{ lng }}
                                    </div>
                                </div>
                            </transition>
                        </div>
                    </div>
                </div>

                <!-- 底部按钮组 -->
                <div class="popper-content__button-group footer-group">
                    <div>
                        <button @click="playMomotalk(false)">
                            <span>{{ $t('cancel') }}</span>
                        </button>
                        <button class="active" @click="playMomotalk(true)">
                            <span>{{ $t('confirm') }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped lang="scss">
@import './dialog-view.scss';

.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform-origin: top;
}
.dropdown-enter-from,
.dropdown-leave-to {
    opacity: 0;
    transform: scaleY(0.9);
}
</style>
