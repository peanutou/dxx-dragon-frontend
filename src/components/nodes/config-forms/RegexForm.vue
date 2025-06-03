<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>

        <n-form-item label="正则表达式">
            <ContextInput v-model:modelValue="node.pattern" placeholder="请输入正则表达式" />
        </n-form-item>

        <n-form-item label="字符串">
            <context-input v-model:modelValue="node.source_variable" placeholder="请输入字符串" />
        </n-form-item>

        <n-form-item label="返回类型">
            <n-select v-model:value="node.return_type" :options="[
                { label: 'match | 抽取第一个，返回 string', value: 'match' },
                { label: 'findall | 抽取所有，返回 string[]', value: 'findall' },
                { label: 'bool | 是否匹配，返回 true 或 false', value: 'bool' }
            ]" placeholder="请选择返回类型" />
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NFormItem, NInput, NSelect } from 'naive-ui'
import ContextInput from '@/components/shared/ContextInput.vue';

// Define props with TypeScript generic and destructure node directly
const { node } = defineProps<{ node: Record<string, any> }>()
</script>
