<template>
    <n-split :max="0.8" :min="0.2" :default-size="0.3" class="h-full" style="height: 100%;">
        <template #1>
            <!-- 左边内容 -->
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
                    <n-button v-if="flowResult" type="warning" size="small">
                        ⏱️ 执行耗时: {{ flowResult.duration.toFixed(2) }} 秒
                        ｜开始时间: {{ new Date(flowResult.start_time).toLocaleString() }}
                        ｜成功: <span :style="{ color: flowResult.status === 'success' ? 'green' : 'red' }"
                            class="ms-1 bold">
                            {{ flowResult.status === 'success' ? '是' : '否' }}
                        </span>
                    </n-button>
                    <!-- execute result: nodes trace -->
                    <n-data-table v-if="nodeResults" :columns="nodeResultColumns" :data="Object.values(nodeResults)" size="small"
                        class="mt-4 text-xs" />
                </template>
                <template #action>
                    <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                </template>
            </n-card>
        </template>
        <template #2>
            <!-- 右边内容 -->
            <ResultPreview 
                :result="result || ''" 
                :result-path="testMode ? 'root.data.result' : 'root'"
                :data-tool="false"
                @update:schema="(data) => emit('update:flow-schema', data)" />
        </template>
    </n-split>
</template>

<script setup lang="ts">
import 'vue-json-pretty/lib/styles.css'
import { ref, onMounted, watch, h } from 'vue'
import { useRoute } from 'vue-router'
import { NCard, NTag, NButton, NTooltip, NDivider, NDataTable, NSplit } from 'naive-ui'
import request from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import FlowInputs from '@/components/flows/FlowInputs.vue'
import ResultPreview from '@/components/nodes/test-run/ResultPreview.vue'

const props = defineProps<{ flowId: string, testMode?: boolean }>()
const emit = defineEmits(['update:flow-schema'])
const route = useRoute()
const flowId = props.flowId || route.params.flowId as string
const testMode = props.testMode ?? false
const inputValues = ref<Record<string, any>>({})
const loading = ref(false)
const result = ref<string | null>(null)
const nodeResults = ref<any>(null)
const flowResult = ref<any>(null)
const flowDefinition = ref<any>(null)
const selectedRunId = ref('')
const nodeResultColumns = [
    {
        title: '节点',
        key: 'node_name',
    },
    {
        title: '耗时',
        key: 'duration',
        render: (row: any) => `${row.duration.toFixed(2)} 秒`
    },
    {
        title: '开始时间',
        key: 'start_time',
        render: (row: any) => new Date(row.start_time).toLocaleString()
    },
    {
        title: '成功',
        key: 'status',
        render: (row: any) => h(
            'span',
            { style: { color: row.status === 'success' ? 'green' : 'red' } },
            row.status === 'success' ? '是' : '否'
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
    result.value = null

    let parsedInput = inputValues.value

    try {
        const endpoint = testMode
            ? TenantSpaceAPI.flows.runTest(flowId)
            : TenantSpaceAPI.flows.run(flowId)
        const res = await request.post(endpoint, parsedInput)
        result.value = JSON.stringify(res.data)
        nodeResults.value = res.data?.data?.context_list[0]?.node_results || null
        flowResult.value = res.data?.data
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

<style scoped></style>
