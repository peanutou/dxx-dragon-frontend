<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>

        <n-form-item label="合并方式">
            <n-select v-model:value="node.join_type" :options="[
                { label: 'All', value: 'all' },
                { label: 'Any', value: 'any' },
            ]" placeholder="请选择合并方式" />
        </n-form-item>

        <!-- 保存配置按钮已移除 -->
    </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'

// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()

</script>
