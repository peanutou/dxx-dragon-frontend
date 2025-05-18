<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="正则表达式">
            <n-input v-model:value="node.pattern" placeholder="请输入正则表达式" />
        </n-form-item>

        <n-form-item label="源变量名">
            <n-input v-model:value="node.source_variable" placeholder="请输入源变量名称" />
        </n-form-item>

        <n-form-item label="返回类型">
            <n-select v-model:value="node.return_type" :options="[
                { label: 'match', value: 'match' },
                { label: 'findall', value: 'findall' },
                { label: 'bool', value: 'bool' }
            ]" placeholder="请选择返回类型" />
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NFormItem, NInput, NSelect } from 'naive-ui'

// Define props with TypeScript generic and destructure node directly
const { node } = defineProps<{ node: Record<string, any> }>()
</script>
