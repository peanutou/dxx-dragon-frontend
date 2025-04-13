<template>
    <div class="pt-4 h-full overflow-auto">
        <NodeFormRenderer v-if="selectedNode" :node="selectedNode" @update="handleUpdate" />
        <div v-else class="text-gray-400 text-sm">请选择一个节点进行配置</div>
    </div>
</template>

<script setup>
import NodeFormRenderer from './NodeFormRenderer.vue'

const props = defineProps({
    selectedNode: Object
})

const emit = defineEmits(['update'])

function handleUpdate(updatedData) {
    emit('update', updatedData)
}
</script>
