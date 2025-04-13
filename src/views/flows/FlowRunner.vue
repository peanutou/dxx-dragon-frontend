<template>
    <n-layout has-sider style="height: 100vh; border: 1px solid lightgrey;">
        <!-- 左边内容 -->
        <div style="width: 50%; border-right: 1px solid #eee;">
            <n-card v-if="flowDefinition" :title="flowDefinition.name" :description="`版本：${flowDefinition.version}`"
                size="small" class="h-full w-full" style="overflow-y: auto;">
                <template #header-extra>
                    <div class="flex items-center space-x-2">
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                <n-tag size="small" type="success" quaternary
                                    @click="copyToClipboard(flowDefinition.flow_id)">ID</n-tag>
                            </template>
                            <span>复制</span>
                        </n-tooltip>
                        <n-tag size="small" type="info">{{ flowDefinition.status }}</n-tag>
                    </div>
                </template>

                <template #default>
                    <div class="space-y-4 text-gray-600 text-sm">
                        <div class="leading-relaxed">
                            {{ flowDefinition.description }}
                        </div>

                        <n-form :model="form" label-width="80" class="tight-form">
                            <n-form-item v-for="field in flowDefinition?.config?.inputs || []" :key="field.name"
                                :label="field.label || field.name" :path="field.name">
                                <n-input v-if="field.type === 'string'" v-model:value="inputValues[field.name]"
                                    :placeholder="`请输入 ${field.label || field.name}`" />
                                <n-input-number v-else-if="field.type === 'number'"
                                    v-model:value="inputValues[field.name]" :placeholder="`请输入数字`" />
                                <n-select v-else-if="field.type === 'select'" v-model:value="inputValues[field.name]"
                                    :options="(field.options || []).map(o => ({ label: o, value: o }))"
                                    :placeholder="`请选择`" />
                            </n-form-item>

                            <n-form-item>
                                <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                            </n-form-item>
                        </n-form>

                    </div>
                </template>
            </n-card>
        </div>
        <!-- 右边内容 -->
        <div style="flex: 1; border-right: 1px solid #eee;">
            <n-card title="运行结果" size="small" style="max-height: 100%; overflow-y: auto;">
                <VueJsonPretty :data="output ? output : ''" :deep="Infinity" showLength showIcon style="font-size: 12px;" />
            </n-card>
        </div>
    </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage, NForm, NFormItem, NInput, NButton, NCard, NTag, NInputNumber, NSelect, NThing, NTooltip } from 'naive-ui'
import request from '@/utils/axios'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const route = useRoute()
const flowId = route.params.id as string

const inputValues = ref<Record<string, any>>({})
const loading = ref(false)
const output = ref<any>(null)
const flowDefinition = ref<any>(null)
const message = useMessage()

const form = { inputValues }

const props = defineProps<{ debugMode?: boolean }>()
const debugMode = props.debugMode ?? false

async function fetchFlow() {
    try {
        const res = await request.get(`/flows/${flowId}`)
        flowDefinition.value = res.data?.data
        // output.value = flowDefinition.value
    } catch (err) {
        message.error('获取流程信息失败')
    }
}

onMounted(() => {
    fetchFlow()
})

async function handleRun() {
    loading.value = true
    output.value = null

    let parsedInput = inputValues.value

    try {
        const endpoint = debugMode ? 'run-debug' : 'run'
        const res = await request.post(`/flows/${flowId}/${endpoint}`, parsedInput)
        output.value = res.data?.data
        message.success('运行成功')
    } catch (err) {
        message.error('运行失败')
        console.error(err)
    } finally {
        loading.value = false
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        message.success('已复制流程 ID')
    }).catch(() => {
        message.error('复制失败')
    })
}
</script>

<style scoped>
:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
}

.tight-form :deep(.n-form-item) {
    margin-bottom: -24px;
}
</style>