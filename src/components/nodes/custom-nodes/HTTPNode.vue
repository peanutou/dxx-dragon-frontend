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
import { getNodeBgClassByType, getNodeCapitalizedType } from './shared-behavior'

const props = defineProps<NodeProps>()
// 显式声明 updateNodeInternals 事件，以避免 Vue 在 fragment 根节点组件中报出多余监听器警告。
// 该事件通常由 VueFlow 传入，用于请求节点更新内部布局。
defineEmits(['updateNodeInternals'])

</script>

<style scoped>

</style>