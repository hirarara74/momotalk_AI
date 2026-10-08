<script lang="ts">
import { ref } from 'vue'
import type { studentInfo } from '@/assets/requestUtils/interface'
import { getStudents } from '@/assets/requestUtils/request'
import { store } from '@/assets/storeUtils/store'

store.getData()
export const database = ref<studentInfo[]>(await getStudents(store.language))
</script>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import MomoIcon from './components/icons/IconMomo.vue'
import SettingIcon from './components/icons/IconSetting.vue'
import StudentIcon from './components/icons/IconStudent.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import ListUpIcon from './components/icons/IconListUp.vue'
import ListDownIcon from './components/icons/IconListDown.vue'
import ResetIcon from './components/icons/IconReset.vue'
import LanguageIcon from './components/icons/IconLanguage.vue'
import PlayerDialog from '@/views/DialogView/PlayerWindow.vue'
import SettingDialog from '@/views/DialogView/SettingWindow.vue'
import HelpDialog from '@/views/DialogView/HelpWindow.vue'
import FilterDialog from '@/views/DialogView/FilterWindows.vue'
import i18n from '@/locales/i18n'
import type { baseStudent, studentInfo as StudentInfoType } from '@/assets/requestUtils/interface'
import { getSchoolIcon } from '@/assets/requestUtils/request'
import { birthday_sort, SupportedLanguage } from '@/assets/requestUtils/dateFormat'
import { talkHistory, getStudentLatestSnippet, getStudentSubline } from '@/assets/storeUtils/talkHistory'
import { selectList } from '@/assets/storeUtils/selectList'
import { debounce, search } from '@/assets/utils/search'
import { isPromptSupported } from '@/assets/ai/prompts'
import { normalizeLanguageCode } from '@/assets/storeUtils/store'
import Popper from 'vue3-popper'

// Fit the app to the visible area: mobile keyboards shrink only visualViewport, not innerHeight,
// so sizing by innerHeight let the keyboard cover the newest messages.
const fitToVisibleViewport = () => {
    const height = window.visualViewport?.height ?? window.innerHeight
    document.documentElement.style.setProperty('--vh', `${height * 0.01}px`)
    window.scrollTo(0, 0)
    // ponytail: always jumps to the newest message on resize, even if the user had scrolled up
    const talkList = document.getElementById('talkList')
    if (talkList) talkList.scrollTop = talkList.scrollHeight
}
fitToVisibleViewport()
window.visualViewport?.addEventListener('resize', fitToVisibleViewport)
window.addEventListener('resize', fitToVisibleViewport)

const route = useRoute()
const router = useRouter()

/************************* */
/*  student data           */
/************************* */
const studentSelected = ref<studentInfo | null>(null)
const student = ref<baseStudent | null>(null)

const dataDisplay = ref<studentInfo[]>(database.value)

// Resolve initial student from URL query id (e.g. /chat?id=10003) if present, else default to Shiroko (10010)
let initialStudent: studentInfo | undefined
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const idParam = urlParams.get('id')
    if (idParam) {
        const idNum = parseInt(idParam, 10)
        initialStudent = database.value.find((s) => s.Id === idNum)
    }
}
if (!initialStudent && database.value && database.value.length > 0) {
    initialStudent = database.value.find((s) => s.Id === 10010) || database.value[0]
}

if (initialStudent) {
    studentSelected.value = initialStudent
    student.value = {
        Id: initialStudent.Id,
        Name: initialStudent.Name,
        Avatar: initialStudent.Avatars[initialStudent.cnt || 0]
    }
    store.currentChatStudent = initialStudent
    talkHistory.loadStudentTalks(student.value)
}

/************************* */
/* filter and sort popper  */
/************************* */
const showPopper = ref<boolean>(false)
const filter_condition = ref(
    {
        sort_type: '',          // 排序类型 名字 生日 学校 社团
        sort_asc: true,         // 排序顺序 true 升序 false 降序
        filter_star: 0,         // 稀有度 0 1 2 3
        filter_released: true,  // 已实装 true false
        search_text: '',        // 搜索内容
        search_school: '',      // 搜索学校
        only_prompt_supported: true, // プロンプト対応済みの生徒のみ表示
    }
)
const filter_condition_copy = ref(filter_condition.value)
const popperTrigger = () => {
    showPopper.value = !showPopper.value
    filter_condition_copy.value = JSON.parse(JSON.stringify(filter_condition.value))
}
const popperConfirm = () => {
    showPopper.value = false
    filter_condition.value = filter_condition_copy.value
}

/************************* */
/* filter, search and sort */
/************************* */
const processData = debounce(() => {
    dataDisplay.value = database.value
        // filter
        .filter(item => {
            if (filter_condition.value.only_prompt_supported && !isPromptSupported(item)) return false
            if ((filter_condition.value.filter_star > 0 && item.Star !== filter_condition.value.filter_star) ||
                (filter_condition.value.search_school && !item.School.includes(filter_condition.value.search_school)) ||
                (item.Released !== filter_condition.value.filter_released)) return false
            return true
        })
        // search
        .filter(item => search([item], filter_condition.value.search_text).length > 0)
        // sort
        .sort((a, b) => {
            if (filter_condition.value.sort_type === '') {
                const timeA = talkHistory.getStudentLastChatTime(a.Id)
                const timeB = talkHistory.getStudentLastChatTime(b.Id)
                if (timeA !== timeB) {
                    return filter_condition.value.sort_asc ? (timeB - timeA) : (timeA - timeB)
                }
                return database.value.indexOf(a) - database.value.indexOf(b)
            }

            if (filter_condition.value.sort_type === 'Birthday') {
                return filter_condition.value.sort_asc ?
                    birthday_sort(a, b, store.language as SupportedLanguage) :
                    birthday_sort(b, a, store.language as SupportedLanguage)
            }

            const aValue = a[filter_condition.value.sort_type as keyof studentInfo] as string
            const bValue = b[filter_condition.value.sort_type as keyof studentInfo] as string
            return filter_condition.value.sort_asc ?
                aValue.localeCompare(bValue, 'zh-CN') : // "zh-CN" to fix the sort order when lng = "zh" or "tw"
                bValue.localeCompare(aValue, 'zh-CN')
        })
}, 100) // 防抖

processData()
watch(
    () => [filter_condition.value, talkHistory.lastChatUpdate],
    () => {
        processData()
    },
    { deep: true }
)

// ========================= Filter School with Flag Birthday Start =========================
const filter_school = (item: studentInfo) => {
    if (filter_condition.value.search_school === item.School.replaceAll("-Birthday", ""))
        filter_condition.value.search_school = ''
    else filter_condition.value.search_school = item.School.replaceAll("-Birthday", "")
}
// ========================= Filter School with Flag Birthday End =========================

/************************* */
/* sort order              */
/************************* */
const sortOrderTrigger = () => {
    filter_condition.value.sort_asc = !filter_condition.value.sort_asc
    processData()
}

/************************* */
/*  select student         */
/************************* */
const selectStudent = (item: studentInfo, updateRoute: boolean = true) => {
    studentSelected.value = item
    student.value = {
        Id: studentSelected.value.Id,
        Name: studentSelected.value.Name,
        Avatar: studentSelected.value.Avatars[studentSelected.value.cnt || 0]
    }
    store.currentChatStudent = item
    talkHistory.loadStudentTalks(student.value)

    if (updateRoute && router && route && route.path === '/chat') {
        router.replace({ path: '/chat', query: { id: item.Id } }).catch(() => {})
    }

    if (typeof window !== 'undefined' && window.innerWidth <= 1150) {
        const root = document.getElementById('root')
        if (root) {
            root.scrollTo({ left: window.innerWidth, behavior: 'smooth' })
        }
    }
}

watch(
    () => route?.query?.id,
    (newId) => {
        if (newId && database.value && database.value.length > 0) {
            const targetId = Number(newId)
            const target = database.value.find((s) => s.Id === targetId)
            if (target && (!studentSelected.value || studentSelected.value.Id !== target.Id)) {
                selectStudent(target, false)
            }
        }
    }
)

const deactiveStudent = () => {
    // Keep active student selection consistent across navigation
}

/************************* */
/* multi-avatar student   */
/************************* */
const studentShowAvatars = ref<studentInfo | null>(null)
const showAvatars = (item: any) => {
    if (studentShowAvatars.value !== item) studentShowAvatars.value = item
    else studentShowAvatars.value = null
}
const selectAvatar = (item: studentInfo, index: number) => {
    item.cnt = index
    selectStudent(item)
}

/************************* */
/*  switch language        */
/************************* */
const changeLanguageTo = async (targetLang: SupportedLanguage) => {
    store.language = targetLang
    i18n.global.locale = targetLang as any
    database.value = await getStudents(store.language)
    processData()

    // Sync selected student with new language data
    if (studentSelected.value) {
        const updated = database.value.find((s) => s.Id === studentSelected.value?.Id)
        if (updated) {
            studentSelected.value = updated
            student.value = {
                Id: updated.Id,
                Name: updated.Name,
                Avatar: updated.Avatars[updated.cnt || 0]
            }
            store.currentChatStudent = updated
        }
    }

    // Sync selectList student names with new language data
    for (const item of selectList.selectList) {
        const match = database.value.find((s) => s.Id === item.Id)
        if (match) {
            item.Name = match.Name
        }
    }
    selectList.setData()

    store.setData()
    deactiveStudent()
}

const changeLanguage = async () => {
    const languageList = i18n.global.availableLocales
    const currentLngIdx = languageList.findIndex((ele) => ele === store.language)
    const nextLang = languageList[(currentLngIdx + 1) % languageList.length] as SupportedLanguage
    await changeLanguageTo(nextLang)
}

watch(
    () => [route?.query?.lang, route?.query?.lng, route?.query?.locale, route?.query?.language],
    ([newLang, newLng, newLocale, newLanguage]) => {
        const queryLang = (newLang || newLng || newLocale || newLanguage) as string
        if (queryLang) {
            const detected = normalizeLanguageCode(queryLang)
            if (detected && detected !== store.language) {
                changeLanguageTo(detected as SupportedLanguage)
            }
        }
    },
    { immediate: true }
)

watch(
    () => route?.path,
    (path) => {
        if (path && (path === '/help' || path.endsWith('/help'))) {
            store.openHelpDialog()
        }
    },
    { immediate: true }
)


/************************* */
/*  switch theme           */
/************************* */
const changeTheme = () => {
    store.theme = 'momotalk'
    if (store.zoom < 0.5 || store.zoom > 1.5)
        store.zoom = 1
    var fullScreen = store.fullScreen ? 'full-screen' : 'not-full-screen'
    document.body.className = store.theme + ' ' + fullScreen
    document.body.style.setProperty('--zoom', store.zoom.toString())
}
changeTheme()

/************************* */
/*  shortcuts             */
/************************* */
document.onkeyup = (e) => {
    // 在输入框中不激活快捷键
    if (e.key === '/' && document.activeElement?.id !== 'textarea') {
        var box = document.getElementById('searchBox') as HTMLInputElement
        box.focus()
    }
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        talkHistory.undo()
    }
    if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        talkHistory.redo()
    }
}
</script>

<template>
    <PlayerDialog></PlayerDialog>
    <SettingDialog></SettingDialog>
    <HelpDialog></HelpDialog>
    <div id="root">
        <header id="header" role="banner">
            <div id="header__left">
                <MomoIcon class="icon momo" />
                <span id="header__title">MomoTalk</span>
                <button
                    class="help"
                    @click.stop="store.openHelpDialog()"
                    @touchend.prevent.stop="store.openHelpDialog()"
                    title="Help"
                    aria-label="Help"
                >
                    ?
                </button>
            </div>
            <div id="header__right">
                <SettingIcon class="icon setting" @click="store.openSettingDialog(store.aiApiKey ? 1 : 2)" />
            </div>
        </header>

        <nav id="sidebar" role="navigation">
            <div id="sidebar__up">
                <RouterLink :to="{ path: '/', query: { id: studentSelected?.Id || 10010 } }" title="Info">
                    <StudentIcon class="icon info" />
                </RouterLink>
                <RouterLink :to="{ path: '/chat', query: { id: studentSelected?.Id || 10010 } }" title="Chat">
                    <MessageIcon class="icon message" />
                </RouterLink>
            </div>
            <div id="sidebar__down">
                <div style="cursor: pointer" @click="store.resetData()" title="Reset">
                    <ResetIcon class="icon reset" />
                </div>
                <div style="cursor: pointer" @click="changeLanguage" title="Switch Language">
                    <LanguageIcon class="icon language" />
                </div>
            </div>
        </nav>

        <section id="listcard">
            <header id="listcard__header">
                <Popper placement="bottom" :show="showPopper" style="width: 100%;">
                    <span id="listcard__header-content">
                        <div class="search-group">
                            <input type="text" placeholder="Type / to search" class="search-group__text"
                                v-model="filter_condition.search_text" id="searchBox" aria-label="Search" />
                        </div>
                        <button class="student-list__button button1" title="Filter" aria-label="Filter"
                            @click="popperTrigger">
                            <span>{{ filter_condition.sort_type ? $t(filter_condition.sort_type.toLowerCase()) :
                                $t('default') }}</span>
                        </button>
                        <button class="student-list__button button2" title="Sort" aria-label="Sort"
                            @click="sortOrderTrigger">
                            <ListUpIcon v-if="filter_condition.sort_asc" class="icon list" />
                            <ListDownIcon v-else class="icon list" />
                        </button>
                    </span>
                    <template #content>
                        <FilterDialog :filter_condition="filter_condition"
                            :filter_condition_copy="filter_condition_copy" @popperConfirm="popperConfirm"
                            @popperTrigger="popperTrigger"></FilterDialog>
                    </template>
                </Popper>
            </header>
            <div id="listbody">
                <div class="list-item" v-for="(item, index) in dataDisplay" :key="index" :id="item.Id.toString()"
                    :class="{ active: item === studentSelected }" @click="selectStudent(item)">
                    <div class="list-item__avatar" @click.stop="" @click="showAvatars(item)" role="button" tabindex="0"
                        @keydown.enter="showAvatars(item)">
                        <img v-lazy="item.Avatars[item.cnt]" :alt="`${item.Name}'s avatar`" />
                        <button :class="item === studentShowAvatars ? 'minus' : 'add'" v-if="item.Avatars.length > 2"
                            aria-label="Toggle Avatar View"></button>
                    </div>
                    <span class="list-item__name">{{ item.Name }}</span>
                    <span class="list-item__bio">{{ getStudentSubline(item, route?.path || $route?.path) }}</span>
                    <div class="list-item__mark" v-if="item.School" @click.stop="" @click="filter_school(item)"
                        role="button" tabindex="0" @keydown.enter=" filter_school(item)">
                        <img v-lazy="getSchoolIcon(item.School)" :alt="`${item.School} icon`" />
                    </div>
                    <div class="list-item__avatars" @click.stop="" v-show="item === studentShowAvatars">
                        <img v-for="(avatar, index) in item.Avatars" :key="index" v-lazy="avatar"
                            @click="selectAvatar(item, index)" :alt="`${item.Name}'s avatar ${index + 1}`" />
                    </div>
                </div>
            </div>
        </section>
        <RouterView id="chatcard" @deactive="deactiveStudent()" :studentInfo="studentSelected" :student="student" />
    </div>
</template>

<style scoped lang="scss">
@import './app.scss';
@import '@/assets/css/icons.scss';

@import '@/assets/css/mobile.scss';
</style>
