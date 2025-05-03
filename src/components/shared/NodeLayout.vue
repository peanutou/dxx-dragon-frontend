<template>
    <n-button text block :class="[
        'border rounded text-xs shadow node-container',
        // getNodeBgClassByType(nodeType || 'default'),
        { 'node-selected': selected }
    ]">
        <div class="flex-1 overflow-hidden">
            <slot />
        </div>
        <div class="h-[48px] justify-center items-center flex" v-if="showRunButton">
            <NodeRunButton @click="$emit('run')"/>
        </div>
        <Handle type="source" :position="Position.Right" />
        <Handle type="target" :position="Position.Left" />
    </n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'
import { Handle, Position } from '@vue-flow/core'
import NodeRunButton from './NodeRunButton.vue'

defineProps<{
    nodeType?: string
    selected?: boolean
    showRunButton?: boolean
}>()

const emit = defineEmits(['run'])
</script>
