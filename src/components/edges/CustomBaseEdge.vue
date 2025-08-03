<script setup lang="ts">
import { computed, h } from 'vue'
import type { EdgeProps } from '@vue-flow/core'
import { BaseEdge, getBezierPath } from '@vue-flow/core'
import { NTooltip } from 'naive-ui';

const props = defineProps<EdgeProps>()

const edgePath = computed(() => getBezierPath(props))

// Provide a default strokeWidth if not present in props
const strokeWidth = computed(() => {
    return (props as any).strokeWidth ?? 2
})
</script>

<template>
    <BaseEdge :id="props.id"
              :source="props.source"
              :target="props.target"
              :sourceHandle="props.sourceHandleId"
              :targetHandle="props.targetHandleId"
              :markerStart="props.markerStart"
              :markerEnd="props.markerEnd"
              :stroke-width="strokeWidth"
              :path="edgePath[0]"
              :label="props.data.on.map((event: string) => event.charAt(0).toUpperCase()).join(', ') + (props.data.description ? `: ${props.data.description}` : '')"
              :label-show-bg="true"
              :label-bg-style="{ fill: '#000', opacity: 0.5, padding: '2px 4px', borderRadius: '4px' }"
              :label-bg-padding="[2, 4]"
              :label-x="edgePath[1]"
              :label-y="edgePath[2]"
              :label-style="{ fontSize: '12px', fill: '#fff' }">
    </BaseEdge>
</template>

<style scoped>
.vue-flow__edge-path {
    pointer-events: none;
}
</style>
