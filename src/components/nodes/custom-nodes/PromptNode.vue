<template>
    <div :class="[
        'relative border rounded text-xs shadow node-container',
        getNodeBgClassByType(props?.data?.type),
        { 'node-selected': props.selected }
    ]">
        <NodeName :title="getNodeCapitalizedType(props?.data?.type)" :data="props.data" />
        <Handle type="source" :position="Position.Right" />
        <Handle type="target" :position="Position.Left" />
    </div>
</template>

<script setup lang="ts">
import './shared-style.css'
import { Handle, Position } from '@vue-flow/core'
import { onMounted, ref, computed, watch } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeName from '@/components/shared/NodeName.vue'
import { getNodeBgClassByType, getNodeCapitalizedType } from './shared-behavior.ts'

const props = defineProps<NodeProps>()

</script>

<style scoped>

</style>