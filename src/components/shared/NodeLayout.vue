<template>
    <n-button text
              block
              :class="[
                'border rounded text-xs shadow node-container',
                // getNodeBgClassByType(nodeType || 'default'),
                { 'node-selected': selected }
            ]">
        <div class="flex-1 overflow-hidden">
            <NodeName :title="nodeType ?? ''"
                      :name="nodeName ?? ''" />
            <slot />
        </div>
        <div class="h-[48px] justify-center items-center flex"
             v-if="showRunButton">
            <NodeRunButton @click="$emit('run')" />
        </div>
        <!-- Left handles: target -->
        <div v-if="handleMode === 'LEFT-RIGHT'"
             class="absolute left-[-8px] top-0 h-full w-4 pointer-events-none">
            <Handle v-for="i in (targetHandles ?? 1)"
                    :key="'target-' + i"
                    type="target"
                    :position="Position.Left"
                    :id="'target-' + i"
                    class="pointer-events-auto absolute -left-2"
                    :style="{ top: `${(i / ((targetHandles ?? 1) + 1)) * 100}%` }" />
        </div>

        <!-- Right handles: source -->
        <div v-if="handleMode === 'LEFT-RIGHT'"
             class="absolute right-[-8px] top-0 h-full w-4 pointer-events-none">
            <Handle v-for="i in (sourceHandles ?? 1)"
                    :key="'source-' + i"
                    type="source"
                    :position="Position.Right"
                    :id="'source-' + i"
                    class="pointer-events-auto absolute -right-2"
                    :style="{ top: `${(i / ((sourceHandles ?? 1) + 1)) * 100}%` }" />
        </div>

        <!-- Top handles: target -->
        <div v-if="handleMode === 'TOP-BOTTOM'"
             class="absolute top-[-8px] left-0 w-full pointer-events-none">
            <Handle v-for="i in (targetHandles ?? 1)"
                    :key="'target-' + i"
                    type="target"
                    :position="Position.Top"
                    :id="'target-' + i"
                    class="pointer-events-auto absolute -top-2"
                    :style="{ left: `${(i / ((targetHandles ?? 1) + 1)) * 100}%` }" />
        </div>

        <!-- Bottom handles: source -->
        <div v-if="handleMode === 'TOP-BOTTOM'"
             class="absolute bottom-[-8px] left-0 w-full pointer-events-none">
            <Handle v-for="i in (sourceHandles ?? 1)"
                    :key="'source-' + i"
                    type="source"
                    :position="Position.Bottom"
                    :id="'source-' + i"
                    class="pointer-events-auto absolute -bottom-2"
                    :style="{ left: `${(i / ((sourceHandles ?? 1) + 1)) * 100}%` }" />
        </div>
    </n-button>
</template>

<script setup lang="ts">
import './shared-style.css'
import { computed, watch } from 'vue'
import { NButton } from 'naive-ui'
import { Handle, Position } from '@vue-flow/core'
import NodeRunButton from './NodeRunButton.vue'
import NodeName from './NodeName.vue'

const props = defineProps<{
    nodeType?: string
    nodeName?: string
    selected?: boolean
    showRunButton?: boolean
    targetHandles?: number
    sourceHandles?: number
    handleMode?: 'LEFT-RIGHT' | 'TOP-BOTTOM'
}>()

watch(() => props.handleMode, (newMode) => {
    console.log('Handle mode changed:', newMode)
})

const emit = defineEmits(['run'])
const handleMode = computed(() => (props.handleMode ?? '').trim() || 'TOP-BOTTOM')
</script>
