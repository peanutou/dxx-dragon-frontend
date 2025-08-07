<template>
    <ParentNodeLayout>
        <NodeLayout :node-type="props?.type"
                    :node-name="props?.data?.name || ''"
                    :selected="props.selected"
                    @run="handleRunClick"
                    :show-run-button="true"
                    :handle-mode="handleMode">
        </NodeLayout>
    </ParentNodeLayout>
</template>

<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core'
import { computed } from 'vue'
import { useNode } from '@vue-flow/core'
import NodeLayout from '@/components/shared/NodeLayout.vue'
import ParentNodeLayout from '@/components/shared/ParentNodeLayout.vue'
import { useFlowStore } from '@/store/flow'

const props = defineProps<NodeProps>()
const { node } = useNode()
const handleMode = computed(() => {
    return (typeof node.style === 'object' && node.style !== null && 'handlerMode' in node.style) ? (node.style as Record<string, any>).handlerMode : 'TOP-BOTTOM'
})
const emit = defineEmits(['updateNodeInternals', 'node-event'])
const flowStore = useFlowStore()
function handleRunClick() {
    flowStore.setTestNode(props)
}
</script>

<style scoped></style>