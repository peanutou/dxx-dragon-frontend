<template>
    <NodeLayout 
        :node-type="props?.type" 
        :node-name="getNodeCapitalizedType(props?.data?.name || '')"
        :selected="props.selected" 
        @run="handleRunClick" 
        :show-run-button="true">
    </NodeLayout>
</template>

<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import { getNodeCapitalizedType } from './shared-behavior'
import NodeLayout from '@/components/shared/NodeLayout.vue'
import { useFlowStore } from '@/store/flow'

const props = defineProps<NodeProps>()
const emit = defineEmits(['updateNodeInternals', 'node-event'])
const flowStore = useFlowStore()

function handleRunClick() {
    flowStore.setTestNode(props)
}
</script>

<style scoped></style>