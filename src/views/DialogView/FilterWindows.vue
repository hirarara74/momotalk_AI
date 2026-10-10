<template>
    <div class="popper-content popper-content--filter">
        <div class="popper-content__title">
            <header><span>{{ $t('sort') }}</span></header>
            <button>
                <CloseIcon class="icon close" @click="popperTrigger" />
            </button>
        </div>
        <div class="popper-content__button-group">
            <div>
                <button
                    @click="props.filter_condition_copy.sort_type = props.filter_condition_copy.sort_type === 'Name' ? '' : 'Name'"
                    :class="props.filter_condition_copy.sort_type === 'Name' ? 'active' : ''"><span>{{ $t('name') }}</span></button>
                <button
                    @click="props.filter_condition_copy.sort_type = props.filter_condition_copy.sort_type === 'Birthday' ? '' : 'Birthday'"
                    :class="props.filter_condition_copy.sort_type === 'Birthday' ? 'active' : ''"><span>{{ $t('birthday') }}</span></button>
            </div>
            <div>
                <button
                    @click="props.filter_condition_copy.sort_type = props.filter_condition_copy.sort_type === 'School' ? '' : 'School'"
                    :class="props.filter_condition_copy.sort_type === 'School' ? 'active' : ''"><span>{{ $t('school') }}</span></button>
                <button
                    @click="props.filter_condition_copy.sort_type = props.filter_condition_copy.sort_type === 'Club' ? '' : 'Club'"
                    :class="props.filter_condition_copy.sort_type === 'Club' ? 'active' : ''"><span>{{ $t('club') }}</span></button>
            </div>
        </div>
        <div class="popper-content__line"><span>{{ $t('filter') }}</span></div>
        <div class="popper-content__button-group">
            <div>
                <button
                    @click="props.filter_condition_copy.filter_star = (props.filter_condition_copy.filter_star + 1) % 4"
                    :class="props.filter_condition_copy.filter_star > 0 ? 'active' : ''">
                    <span>{{ $t('rare') }}
                        {{ props.filter_condition_copy.filter_star ? '⭐'.repeat(props.filter_condition_copy.filter_star)
                        : ''}}</span>
                </button>
                <button
                    @click="props.filter_condition_copy.filter_released = !props.filter_condition_copy.filter_released"
                    :class="props.filter_condition_copy.filter_released ? 'active' : ''"><span>{{ 
                    props.filter_condition_copy.filter_released ? $t('released') : $t('unreleased')
                    }}</span></button>
            </div>
        </div>
        <footer class="popper-content__footer">
            <button @click="popperConfirm"><span>OK</span></button>
        </footer>
    </div>
</template>

<script setup lang="ts">
import CloseIcon from '@/components/icons/IconClose.vue'

const props = defineProps({
    filter_condition: {
        type: Object,
        required: true
    },
    filter_condition_copy: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['popperConfirm', 'popperTrigger'])

const popperConfirm = () => {
    emit('popperConfirm')
}

const popperTrigger = () => {
    emit('popperTrigger')
}
</script>

<style scoped lang="scss">
@import './dialog-view.scss';
@import '@/assets/css/mobile.scss';
</style>
