<template>
    <n-dropdown trigger="click" :options="operatorOptions" @select="onSelect" >
        <n-button size="tiny" type="primary" ghost class="operator-picker">
            {{ displayLabel }}
        </n-button>
    </n-dropdown>
</template>


<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const operatorOptions = [
    { label: 'contain', key: 'contain' },
    { label: 'start with', key: 'start with' },
    { label: 'end with', key: 'end with' },
    { label: 'match', key: 'match' },
    { label: '==', key: 'equal' },
    { label: 'not =', key: 'not equal' },
    { label: '>', key: 'greater' },
    { label: '> or =', key: 'greater equal' },
    { label: '<', key: 'less' },
    { label: '< or =', key: 'less equal' },
]

const onSelect = (val) => {
    emit('update:modelValue', val)
}

const displayLabel = computed(() => {
    return operatorOptions.find(opt => opt.key === props.modelValue)?.label || 'Select Operator'
})

</script>

<style scoped>
.operator-picker {
    display: flex;
    width: 100%;
    height: 30px;
    box-sizing: border-box;
}
</style>
