<template>
    <component :is="formComponent" :node="node" @update="emit('update', $event)" />
</template>

<script setup>
import { computed } from 'vue'
import PromptForm from './config-forms/PromptForm.vue'
import HttpForm from './config-forms/HttpForm.vue'
import RegexForm from './config-forms/RegexForm.vue'
import AggregatorForm from './config-forms/AggregatorForm.vue'
import ExcelForm from './config-forms/ExcelForm.vue'

const props = defineProps({
    node: Object
})

const emit = defineEmits(['update'])

const formComponent = computed(() => {
    switch (props.node?.type) {
        case 'Prompt':
            return PromptForm
        case 'Http':
            return HttpForm
        case 'Regex':
            return RegexForm
        case 'Aggregator':
            return AggregatorForm
        case 'Excel':
            return ExcelForm
        default:
            return null
    }
})
</script>
