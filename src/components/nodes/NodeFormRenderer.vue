<template>
    <component :is="formComponent" :node="data" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const modules = import.meta.glob('./config-forms/*.vue', { eager: true })
const props = defineProps<{
    type: string,
    data: Record<string, any>
}>()

const formComponent = computed(() => {
    if (!props.type) {
        return null
    }
    // Dynamically import the form component based on the node type
    if (Object.keys(modules).includes(`./config-forms/${props.type}Form.vue`)) {
        return (modules as any)[`./config-forms/${props.type}Form.vue`].default
    }
    return null
})
</script>
