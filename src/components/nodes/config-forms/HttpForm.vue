<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="localData.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="请求方法">
            <n-select v-model:value="localData.method" :options="[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' }
            ]" placeholder="请选择 HTTP 方法" />
        </n-form-item>

        <n-form-item label="请求地址">
            <n-input v-model:value="localData.url" placeholder="如：https://api.example.com" />
        </n-form-item>

        <n-form-item label="Headers (JSON)">
            <n-input v-model:value="headersJson" type="textarea" placeholder="{ 'Authorization': 'Bearer token' }" />
        </n-form-item>

        <n-form-item label="Body (JSON)">
            <n-input v-model:value="bodyJson" type="textarea" placeholder='{ "key": "value" }' />
        </n-form-item>

        <n-button type="primary" @click="submit">保存配置</n-button>
    </n-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NButton } from 'naive-ui'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
    node: Node
}>()
const localData = ref<any>({})
watch(
    () => props.node.data,
    (newData) => {
        localData.value = { ...newData }
    },
    { immediate: true, deep: true }
)

const emit = defineEmits<{
    (e: 'update:config', data: any): void
}>()

const headersJson = ref(JSON.stringify(localData.value.headers || {}, null, 2))
const bodyJson = ref(JSON.stringify(localData.value.body || {}, null, 2))

watch(() => props.node.data, (newData) => {
    localData.value = { ...newData }
    headersJson.value = JSON.stringify(newData.headers || {}, null, 2)
    bodyJson.value = JSON.stringify(newData.body || {}, null, 2)
})

function submit() {
    try {
        localData.value.headers = JSON.parse(headersJson.value || '{}')
        localData.value.body = JSON.parse(bodyJson.value || '{}')
        emit('update:config', localData.value)
    } catch (e) {
        window.$message?.error?.('请检查 Headers 和 Body 的 JSON 格式是否正确')
    }
}
</script>
