<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" />
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput } from 'naive-ui'

// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()
</script>

<style scoped>
</style>