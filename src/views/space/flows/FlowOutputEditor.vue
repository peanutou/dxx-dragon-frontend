<template>
    <vue-json-pretty :data="flowOutputs" :deep="2" showLength showIcon :showLine="false" theme="dark" selectableType="single"
        :highlightSelectedNode="true" class="p-4" />
</template>

<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'
import { useFlowStore } from '@/store/flow'
import { computed } from 'vue'
const { outputs } = useFlowStore()

const flowOutputs = computed(() => {
    return JSON.parse(JSON.stringify(outputs))
})


</script>

<style scoped>
:deep(.vjs-tree-node) {
    font-size: 12px;
}

:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
    font-size: 12px;
}

:deep(.vue-json-pretty .vjs-tree-node.is-selected) {
    background-color: #ffe58f !important;
    /* 自定义背景色 */
    color: #000000 !important;
    /* 自定义文字颜色 */
}

:deep(.vjs-tree-node .vjs-key) {
    white-space: nowrap;
}
</style>