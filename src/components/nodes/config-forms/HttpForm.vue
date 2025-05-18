<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="请求方法">
            <n-select v-model:value="node.method" :options="[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' }
            ]" placeholder="请选择 HTTP 方法" />
        </n-form-item>

        <n-form-item label="请求地址">
            <n-input v-model:value="node.url" placeholder="如：https://api.example.com" />
        </n-form-item>

        <n-form-item label="Headers (JSON)">
            <n-input v-model:value="headersJson" type="textarea" placeholder="{ 'Authorization': 'Bearer token' }" />
        </n-form-item>

        <n-form-item label="Body (JSON)">
            <n-input v-model:value="bodyJson" type="textarea" placeholder='{ "key": "value" }' />
        </n-form-item>

        <!-- 保存配置按钮已移除 -->
    </n-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'

// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()

// JSON text for headers and body, synchronized via watch
const headersJson = ref(JSON.stringify(node.headers || {}, null, 4))
const bodyJson = ref(JSON.stringify(node.body || {}, null, 4))

watch(headersJson, (val) => {
    try {
        node.headers = JSON.parse(val || '{}')
    } catch { 
        console.log('Invalid JSON in headers:', val)
    }
})
watch(bodyJson, (val) => {
    try {
        node.body = JSON.parse(val || '{}')
    } catch { }
})
</script>
