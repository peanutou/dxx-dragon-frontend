<template>
    <div :class="['relative bg-green-50 border border-green-300 rounded text-xs shadow node-container', { 'flash-border': isFlashing }]">
        <NodeName :title="capitalizedType" :data="props.data" />
        <Handle type="source" :position="Position.Right" />
        <Handle type="target" :position="Position.Left" />
    </div>
</template>

<script setup lang="ts">
import './default.css'
import { Handle, Position } from '@vue-flow/core'
import { onMounted, ref, computed } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import NodeName from '@/components/shared/NodeName.vue'

const isFlashing = ref(false)

function triggerFlash() {
    isFlashing.value = true
    setTimeout(() => {
        isFlashing.value = false
    }, 1200)
}

const props = defineProps<NodeProps>()

const capitalizedType = computed(() => {
    const type = props?.data?.type || ''
    return type.charAt(0).toUpperCase() + type.slice(1)
})

onMounted(() => {
})

defineExpose({
    triggerFlash
})

</script>

<style scoped>
.flash-border {
    animation: flash-outline 0.3s ease-in-out 2;
}

@keyframes flash-outline {

    0%,
    100% {
        outline: 2px solid #f87171;
        outline-offset: 0px;
    }

    50% {
        outline: 4px solid #facc15;
        outline-offset: 2px;
    }
}
</style>