<template>
    <div class="text-left w-100 px-2">
        <div class="text-xs font-bold text-ellipsis overflow-hidden whitespace-nowrap">{{ props.title }}</div>
        <div class="text-xs text-gray-400 text-ellipsis overflow-hidden whitespace-nowrap">{{ props.data.name }}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    title: string
    data: {
        name: string
    }
}>()
</script>
