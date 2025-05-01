<template>
    <div :class="[
        'border rounded text-xs shadow node-container',
        getNodeBgClassByType(props?.data?.type),
        { 'node-selected': props.selected }
    ]">
        <div class="flex-1 overflow-hidden">
            <NodeName :title="getNodeCapitalizedType(props?.data?.type)" :data="props.data" />
        </div>
        <div class="w-[40px] h-full justify-center items-center flex">
            <NodeRunButton @click="showTestDialog = true" />
        </div>
        <Handle type="source" :position="Position.Right" />
        <Handle type="target" :position="Position.Left" />
    </div>
    <NodeTestDialog v-model:show="showTestDialog" :node-data="props.data" />
</template>

<script setup lang="ts">
import './shared-style.css'
import { Handle, Position } from '@vue-flow/core'
import { onMounted, ref, computed, watch } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeName from '@/components/shared/NodeName.vue'
import NodeRunButton from '@/components/shared/NodeRunButton.vue'
import { getNodeBgClassByType, getNodeCapitalizedType } from './shared-behavior'
import NodeTestDialog from '@/components/nodes/test-run/NodeTestDialog.vue'

const props = defineProps<NodeProps>()
const showTestDialog = ref(false)
// 显式声明 updateNodeInternals 事件，以避免 Vue 在 fragment 根节点组件中报出多余监听器警告。
// 该事件通常由 VueFlow 传入，用于请求节点更新内部布局。
defineEmits(['updateNodeInternals'])

</script>

<style scoped></style>