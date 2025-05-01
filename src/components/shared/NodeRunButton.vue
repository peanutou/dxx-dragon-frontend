<template>
    <!-- 使用内联样式确保按钮高度充满节点容器 -->
    <n-button quaternary size="small" @click="$emit('click')" class="flex hover:bg-transparent items-center justify-center h-full w-full" style="height: 100%;">
        <PlayCircleOutline class="w-6 h-6 text-primary" />
    </n-button>
</template>

<script setup lang="ts">
import { PlayCircleOutline } from '@vicons/ionicons5'

defineEmits<{
    (e: 'click'): void
}>()
</script>