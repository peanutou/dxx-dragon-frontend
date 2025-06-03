<template>
    <n-split :max="0.7" :min="0.3" :default-size="0.4" class="h-full" style="height: 100%;">
        <!-- 左侧面板 -->
        <template #1>
            <n-card :bordered="true" size="small" class="h-full w-full overflow-hidden"
                :title="currentTestNode.data.name">
                <!-- Extra header content -->
                <template #header-extra>
                    <div class="flex items-center space-x-2">
                        <n-tag size="small" type="info">{{ currentTestNode.type }}</n-tag>
                    </div>
                </template>
                <div style="height: 100%; display: flex; flex-direction: column;">

                    <!-- 动态渲染模拟上下文输入字段 -->
                    <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">上下文：全局输入</n-divider>
                    <FlowInputs :inputs="inputs || []" v-model:input-values="mockContext.inputs" />

                    <!-- 保留原始 mock_upstream 输入区域 -->
                    <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">上下文：节点输出</n-divider>
                    <div style="flex: 1 0 0; overflow-y: auto;">
                        <n-form label-placement="top" label-width="280px" :model="mockContext.outputs">
                            <n-form-item v-for="node in nodes || []" :key="node.id">
                                <template #label>
                                    <div class="flex items-center gap-2">
                                        <n-icon :size="16" color="#666">
                                            <BookmarkOutline />
                                        </n-icon>
                                        <div>当前输出：{{ node.data.name }}</div>
                                    </div>
                                </template>
                                <div style="max-height: 150px; overflow-y: auto; width: 100%;">
                                    <vue-json-pretty :data="mockContext.outputs[node.data.name]" :deep="-1" showLength
                                        showIcon theme="dark" selectableType="single" :highlightSelectedNode="true" />
                                </div>
                            </n-form-item>
                        </n-form>
                    </div>
                </div>
                <template #action>
                    <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                </template>
            </n-card>
        </template>
        <!-- 右侧结果预览面板 -->
        <template #2>
            <ResultPreview :result="result || ''" :result-path="nodeResultPath"
                @update:schema="(data) => emit('update:node-schema', data)" />
        </template>
    </n-split>
</template>

<script setup lang="ts">
import ResultPreview from './ResultPreview.vue'
import { NodeProps } from '@vue-flow/core'
import VueJsonPretty from 'vue-json-pretty'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NIcon, NCard, NFormItem, NTag, NButton, NEmpty } from 'naive-ui'
import { ref, computed } from 'vue'
import request from '@/utils/axios'
import { useRoute } from 'vue-router'
import { useFlowStore } from '@/store/flow'
import FlowInputs from '@/components/flows/FlowInputs.vue'
import schematize from '@/utils/schematize'
import { BookmarkOutline } from '@vicons/ionicons5'

const props = defineProps<{
    currentTestNode: NodeProps
}>()
const emit = defineEmits(['update:node-schema'])
const { mockContext, nodes, inputs } = useFlowStore()
const route = useRoute()
const loading = ref(false)
const nodeName = computed(() => props?.currentTestNode?.data.name)
const result = ref<string | null>(null)
const parsedResult = computed(() => {
    try {
        return result.value ? JSON.parse(result.value) : null
    } catch {
        return { error: 'Invalid JSON' }
    }
})
const nodeResultPath = computed(() => {
    return `root.data.context_list[0].outputs.${nodeName.value}`
    // return `root.data.context_list[0].node_results[0].outputs.result`
})
const nodeResultData = computed(() => {
    return getValueByPath(parsedResult.value, nodeResultPath.value)
})
const nodeResultSchema = computed(() => {
    return schematize(
        getValueByPath(parsedResult.value, nodeResultPath.value)
    )
})

async function handleRun() {
    loading.value = true
    try {
        delete mockContext.outputs[props.currentTestNode.id]
        const res = await request.post(
            TenantSpaceAPI.flows.testNode(route.params.id as string),
            {
                node_id: props.currentTestNode.id,
                inputs: {
                    "mock_flow_inputs": mockContext.inputs,
                    "mock_upstream": mockContext.outputs,
                }
            }
        )
        result.value = JSON.stringify(res.data, null, 4)
        mockContext.outputs[nodeName.value] = nodeResultData.value
    } catch (err: any) {
        result.value = `❌ ${err.message}`
    } finally {
        loading.value = false
    }
}

function getValueByPath(obj: any, path: string): any {
    if (!path) return obj;
    // If path starts with 'root.', remove it
    if (path.startsWith('root.')) {
        path = path.slice(5);
    }
    const keys = path
        .replace(/\[(\w+)\]/g, '.$1') // 将索引转换为属性访问
        .replace(/^\./, '')           // 移除开头的点
        .split('.');
    return keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, obj);
}

</script>

<style scoped>
:deep(.vjs-tree-node) {
    font-size: 12px;
}

:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
    font-size: 12px;
}

:deep(.vue-json-pretty .vjs-tree-node.is-selected) {
    background-color: #ffe58f !important;
    /* 自定义背景色 */
    color: #000000 !important;
    /* 自定义文字颜色 */
}

:deep(.vjs-tree-node .vjs-key) {
    white-space: nowrap;
}
</style>