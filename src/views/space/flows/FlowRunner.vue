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
                                    :options="(field.options || []).map((o: string) => ({ label: o, value: o }))"
                                    :placeholder="`请选择`" />
                            </n-form-item>

                            <n-form-item class="flex flex-col items-start space-y-2">
                                <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                            </n-form-item>
                        </n-form>
                        <!-- execute result: outputs.trace -->
                        <div v-if="output?.outputs?.trace" class="text-xs text-gray-500 mt-2">
                            ⏱️ 执行耗时: {{ output.outputs.trace.duration.toFixed(2) }} 秒
                            ｜开始时间: {{ new Date(output.outputs.trace.start_time).toLocaleString() }}
                            ｜成功: <span :style="{ color: output.outputs.trace.success ? 'green' : 'red' }">
                                {{ output.outputs.trace.success ? '是' : '否' }}
                            </span>
                        </div>
                        <!-- execute result: nodes trace -->
                        <div v-if="output?.debug_info?.flow_config?.nodes" class="text-xs text-gray-500 mt-4">
                            <div class="grid grid-cols-4 font-bold pb-1 border-b border-gray-300">
                                <div>节点</div>
                                <div>耗时</div>
                                <div>开始时间</div>
                                <div>成功</div>
                            </div>
                            <div v-for="node in output.debug_info.flow_config.nodes" :key="node.name"
                                class="grid grid-cols-4 py-1 border-b border-dashed border-gray-200">
                                <div>{{ node.name }}</div>
                                <div>{{ node.outputs.trace.duration.toFixed(2) }} 秒</div>
                                <div>{{ new Date(node.outputs.trace.start_time).toLocaleString() }}</div>
                                <div :style="{ color: node.outputs.trace.success ? 'green' : 'red' }">
                                    {{ node.outputs.trace.success ? '是' : '否' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </n-card>
        </div>
        <!-- 右边内容 -->
        <div style="flex: 1; border-right: 1px solid #eee;">
            <n-card title="运行结果" size="small" style="max-height: 100%; overflow-y: auto;">
                <VueJsonPretty :data="output ? output : ''" :deep="Infinity" showLength showIcon
                    style="font-size: 12px;" />
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
import { ROUTE } from '@/constants/routes' // Import ROUTE

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
        const res = await request.get(ROUTE.SPACE.FLOWS.DETAIL(flowId)) // Updated URL
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
        const endpoint = debugMode
          ? ROUTE.SPACE.FLOWS.RUN_DEBUG(flowId) // Updated URL
          : ROUTE.SPACE.FLOWS.RUN(flowId) // Updated URL
        const res = await request.post(endpoint, parsedInput)
        output.value = res.data?.data
        message.succeed('运行成功')
    } catch (err) {
        message.error('运行失败')
        console.error(err)
    } finally {
        loading.value = false
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        message.succeed('已复制流程 ID')
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