<script setup lang="ts">
import BirhdayIcon from '@/components/icons/IconBirhday.vue'
import PlayIcon from '@/components/icons/IconPlay.vue'
import MessageIcon from '@/components/icons/IconMessage.vue'
const props = defineProps(['studentInfo'])
const emits = defineEmits(['deactive'])
</script>

<template>
    <main class="student-info">
        <div v-if="props.studentInfo">
            <RouterLink class="student-info__play" :to="{ path: '/chat', query: { id: props.studentInfo.Id } }">
                <PlayIcon class="icon play" />
            </RouterLink>
            <div class="student-info__avatar">
                <img :src="props.studentInfo.Avatars[props.studentInfo.cnt || 0]" :alt="props.studentInfo.Name" />
            </div>
            <div class="student-info__name">{{ props.studentInfo.Name }}</div>
            <div class="student-info__bio">{{ props.studentInfo.Bio }}</div>
            <div class="student-info__birthday">
                <BirhdayIcon style="margin-left: 10px" />
                <p style="margin-right: 10px">{{ props.studentInfo.Birthday }}</p>
            </div>
            <RouterLink class="student-info__chat-btn" :to="{ path: '/chat', query: { id: props.studentInfo.Id } }">
                <MessageIcon class="chat-btn-icon" />
                <span>{{ $t('talkWith', { name: props.studentInfo.Name }) }}</span>
            </RouterLink>
            <div class="student-info__related">
                <div class="student-info__related-title">
                    {{ $t('relatedStudentTitle') }}
                </div>
                <div class="student-info__related-list" v-if="props.studentInfo.RelatedStudent.length">
                    <div class="student-info__related-item" v-for="ele in props.studentInfo.RelatedStudent"
                        :key="ele.Id">
                        <a :href="`#${ele.Id}`" class="student-info__related-avatar">
                            <img v-lazy="ele.Avatar" :title="ele.Name" />
                        </a>
                    </div>
                </div>
                <div class="student-info__related-list"
                    style="display: flex; align-items: center; justify-content: center; height: 112px;" v-else> {{
                        $t('noRelatedStudent') }} </div>
            </div>
        </div>
        <div v-else style="display: flex; align-items: center; justify-content: center">
            {{ $t('selectInfo') }}
        </div>
    </main>
</template>

<style scoped lang="scss">
@import '@/assets/css/icons.scss';
@import './info-view.scss';
</style>
