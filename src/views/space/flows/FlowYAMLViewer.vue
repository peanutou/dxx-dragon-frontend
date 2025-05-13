<template>
    <n-card title="" size="small" class="h-full w-full" style="overflow-y: auto;">
        <VueJsonPretty :data="reorderedConfig" :deep="Infinity" showLength showIcon theme="dark" style="font-size: 12px;"/>
    </n-card>
</template>

<script setup lang="ts">
import { NCard } from 'naive-ui'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { computed } from 'vue'

const props = defineProps<{
    config: object
}>()

const reorderedConfig = computed(() => {
    if (typeof props.config !== 'object' || props.config === null || Array.isArray(props.config)) {
        return props.config
    }
    const entries = Object.entries(props.config)
    const simpleEntries = entries.filter(([_, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v))
    const complexEntries = entries.filter(([_, v]) => v !== null && typeof v === 'object')
    return Object.fromEntries([...simpleEntries, ...complexEntries])
})
</script>

<style scoped>
:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
}
</style>