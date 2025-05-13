<template>
    <n-layout has-sider style="height: 100%; border: 1px solid lightgrey;">
        <!-- 左边内容 -->
        <div style="width: 50%; border-right: 1px solid #eee;">
            <n-card v-if="flowDefinition" :title="flowDefinition.name" size="small" class="h-full w-full"
                style="overflow-y: auto;">
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
                        <n-tag size="small" type="info">{{ `版本：${flowDefinition.version}` }}</n-tag>
                    </div>
                </template>
                <template #default>
                    <n-thing class="mb-4">{{ flowDefinition.description }}</n-thing>
                    <!-- Run Histroy Items -->
                    <n-form :model="{ inputValues }" label-width="80" class="space-y-0">
                        <n-form-item label="运行历史">
                            <n-select v-if="flowDefinition.test_inputs_history" v-model:value="selectedRunId" :options="flowDefinition.test_inputs_history.map((item: any, index: number) => ({
                                label: `#${index + 1} ｜${new Date(item.run_at).toLocaleString()}`,
                                value: item.run_id
                            }))" placeholder="选择一次历史运行" style="width: 100%;">
                            </n-select>
                        </n-form-item>
                        <!-- Seperator -->
                        <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">全局输入</n-divider>
                        <FlowInputs v-if="flowDefinition" :inputs="flowDefinition?.config?.inputs || []"
                            v-model:inputValues="inputValues" />
                    </n-form>
                    <!-- execute result: outputs.trace -->
                    <n-button v-if="output?.outputs?.trace" type="warning" size="small">
                        ⏱️ 执行耗时: {{ output.outputs.trace.duration.toFixed(2) }} 秒
                        ｜开始时间: {{ new Date(output.outputs.trace.start_time).toLocaleString() }}
                        ｜成功: <span :style="{ color: output.outputs.trace.success ? 'green' : 'red' }" class="ms-1 bold">
                            {{ output.outputs.trace.success ? '是' : '否' }}
                        </span>
                    </n-button>
                    <!-- execute result: nodes trace -->
                    <n-data-table v-if="output?.debug_info?.flow_config?.nodes" :columns="traceColumns"
                        :data="output.debug_info.flow_config.nodes" size="small" class="mt-4 text-xs" />
                </template>
                <template #action>
                    <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                </template>
            </n-card>
        </div>
        <!-- 右边内容 -->
        <div style="flex: 1; border-right: 1px solid #eee;">
            <n-card title="运行结果" size="small" style="max-height: 100%; overflow-y: auto;">
                <VueJsonPretty :data="output ? output : ''" :deep="Infinity" showLength showIcon theme="dark" />
            </n-card>
        </div>
    </n-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { NCard, NTag, NButton, NTooltip, NDivider, NDataTable } from 'naive-ui'
import request from '@/utils/axios'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { TenantSpaceAPI } from '@/apis/endpoints'
import FlowInputs from '@/components/flows/FlowInputs.vue'


const props = defineProps<{ flowId: string, debugMode?: boolean, testMode?: boolean }>()
const route = useRoute()
const flowId = props.flowId || route.params.flowId as string
const debugMode = props.debugMode ?? false
const testMode = props.testMode ?? false
const inputValues = ref<Record<string, any>>({})
const loading = ref(false)
const output = ref<any>(null)
const flowDefinition = ref<any>(null)
const selectedRunId = ref('')

// traceColumns for node trace info
const traceColumns = [
    {
        title: '节点',
        key: 'name',
    },
    {
        title: '耗时',
        key: 'duration',
        render: (row: any) => `${row.outputs.trace.duration.toFixed(2)} 秒`
    },
    {
        title: '开始时间',
        key: 'start_time',
        render: (row: any) => new Date(row.outputs.trace.start_time).toLocaleString()
    },
    {
        title: '成功',
        key: 'success',
        render: (row: any) => h(
            'span',
            { style: { color: row.outputs.trace.success ? 'green' : 'red' } },
            row.outputs.trace.success ? '是' : '否'
        )
    }
]

async function fetchFlow() {
    try {
        const res = await request.get(TenantSpaceAPI.flows.get(flowId))
        flowDefinition.value = res.data?.data
        // 填充 inputValues 的初始值，boolean 类型为 false，其它为 null
        if (flowDefinition.value?.config?.inputs) {
            flowDefinition.value.config.inputs.forEach((field: any) => {
                if (!(field.name in inputValues.value)) {
                    inputValues.value[field.name] = field.type === 'boolean' ? false : null;
                }
            });
        }
        selectedRunId.value = flowDefinition.value.test_inputs_history?.[0]?.run_id || ''
    } catch (err) {
        window.$message.error('获取流程信息失败')
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
        const endpoint = testMode
            ? TenantSpaceAPI.flows.runTest(flowId)
            : debugMode
                ? TenantSpaceAPI.flows.runDebug(flowId)
                : TenantSpaceAPI.flows.run(flowId)
        const res = await request.post(endpoint, parsedInput)
        output.value = res.data?.data
        window.$message.success('运行成功')
    } catch (err) {
        window.$message.error('运行失败')
        console.error(err)
    } finally {
        loading.value = false
        fetchFlow()
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
        window.$message.success('已复制流程 ID')
    }).catch(() => {
        window.$message.error('复制失败')
    })
}

// 监听 selectedRunId 变化，自动填充 inputValues
watch(selectedRunId, (runId) => {
    if (!runId || !flowDefinition.value?.test_inputs_history) return
    const selectedRun = flowDefinition.value.test_inputs_history.find((item: any) => item.run_id === runId)
    if (selectedRun?.inputs) {
        Object.entries(selectedRun.inputs).forEach(([key, value]) => {
            inputValues.value[key] = value
        })
    }
})
</script>

<style scoped>
:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
}

:deep(.vjs-tree-node) {
    font-size: 12px;
}

.tight-form :deep(.n-form-item) {
    margin-bottom: -24px;
}
</style>
