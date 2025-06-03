<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>
        <n-form-item label="输出节点">
            <n-select v-model:value="node.result_node"
                :options="nodes.map(node => ({ label: node.data.name, value: node.data.name }))" placeholder="选择输出节点"
                style="width: 100%;">
            </n-select>
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import { useFlowStore } from '@/store/flow';
const { nodes } = useFlowStore()

// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()
</script>

<style scoped></style>