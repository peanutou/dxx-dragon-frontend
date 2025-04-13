<template>
    <component :is="formComponent" :node="node" @update="emit('update', $event)" />
</template>

<script setup>
import { computed } from 'vue'
import PromptNodeForm from './config-forms/PromptNodeForm.vue'
import HttpNodeForm from './config-forms/HttpNodeForm.vue'
import RegexNodeForm from './config-forms/RegexNodeForm.vue'
import AggregatorForm from './config-forms/AggregatorForm.vue'

const props = defineProps({
    node: Object
})

const emit = defineEmits(['update'])

const formComponent = computed(() => {
    switch (props.node?.type) {
        case 'Prompt':
            return PromptNodeForm
        case 'Http':
            return HttpNodeForm
        case 'Regex':
            return RegexNodeForm
        case 'Aggregator':
            return AggregatorForm
        default:
            return null
    }
})
</script>
