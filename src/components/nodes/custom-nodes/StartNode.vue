<template>
    <NodeLayout
        :node-type="props?.data?.type"
        :selected="props.selected"
        @run="handleRunClick"
        :show-run-button="true"
        :left-handles="0"
    >
        <NodeName :title="getNodeCapitalizedType(props?.data?.type)" :data="props.data" />
    </NodeLayout>
</template>

<script setup lang="ts">
import './shared-style.css'
import type { NodeProps } from '@vue-flow/core'
import NodeName from '@/components/shared/NodeName.vue'
import { getNodeCapitalizedType } from './shared-behavior'
import NodeLayout from '@/components/shared/NodeLayout.vue'
import { useFlowStore } from '@/store/flow'

const props = defineProps<NodeProps>()
const emit = defineEmits(['updateNodeInternals', 'node-event'])
const flowStore = useFlowStore()

function handleRunClick() {
    flowStore.setTestNode(props.data)
}
</script>

<style scoped></style>