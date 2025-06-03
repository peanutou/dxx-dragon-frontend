<template>
    <component :is="formComponent" :node="data" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PromptForm from './config-forms/PromptForm.vue'
import HttpForm from './config-forms/HttpForm.vue'
import RegexForm from './config-forms/RegexForm.vue'
import AggregatorForm from './config-forms/AggregatorForm.vue'
import ExcelForm from './config-forms/ExcelForm.vue'
import ComparerForm from './config-forms/ComparerForm.vue'
import StartForm from './config-forms/StartForm.vue'
import EndForm from './config-forms/EndForm.vue'
import JoinForm from './config-forms/JoinForm.vue'
import ForEachForm from './config-forms/ForEachForm.vue'

const props = defineProps<{
    type: string,
    data: Record<string, any>
}>()

const formComponent = computed(() => {
    if (!props.type) {
        return null
    }
    switch (props.type) {
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
        case 'Comparer':
            return ComparerForm
        case 'Start':
            return StartForm
        case 'End':
            return EndForm
        case 'Join':
            return JoinForm
        case 'ForEach':
            return ForEachForm
        // Add more cases as needed for other node types
        default:
            return null
    }
})
</script>
