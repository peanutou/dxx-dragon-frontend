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
            <NodeRunButton @click="$emit('run')" />
        </div>
        <!-- Left handles -->
        <div class="absolute left-[-8px] top-0 h-full w-4 pointer-events-none">
            <Handle
                v-for="i in (leftHandles ?? 1)"
                :key="'left-' + i"
                type="target"
                :position="Position.Left"
                :id="'left-' + i"
                class="pointer-events-auto absolute -left-2"
                :style="{ top: `${(i / ((leftHandles ?? 1) + 1)) * 100}%` }"
            />
        </div>

        <!-- Right handles -->
        <div class="absolute right-[-8px] top-0 h-full w-4 pointer-events-none">
            <Handle
                v-for="i in (rightHandles ?? 1)"
                :key="'right-' + i"
                type="source"
                :position="Position.Right"
                :id="'right-' + i"
                class="pointer-events-auto absolute -right-2"
                :style="{ top: `${(i / ((rightHandles ?? 1) + 1)) * 100}%` }"
            />
        </div>
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
    leftHandles?: number
    rightHandles?: number
}>()

const emit = defineEmits(['run'])
</script>
