<template>
    <n-modal v-model:show="visible" title="测试运行" preset="dialog" style="width: 600px">
        <n-form :model="form">
            <!-- 动态渲染模拟上下文输入字段 -->
            <FlowInputs :inputs="flowSnapshot.inputs || []"
                :input-values="props.nodeData.test_inputs.mock_flow_inputs" />
            <!-- 保留原始 mock_upstream 输入区域 -->
            <n-form-item v-for="node in dependsOnList" :key="node" :label="`模拟输出：${node}`" :path="node">
                <n-input type="textarea" v-model:value="props.nodeData.test_inputs.mock_upstream[node]"
                    placeholder="请输入 JSON 格式依赖节点输出" />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button type="primary" @click="handleRun">运行</n-button>
            <n-button @click="visible = false">关闭</n-button>
        </template>

        <div v-if="result" class="mt-4">
            <vue-json-pretty :data="parsedResult" :deep="2" showLength showIcon
            style="font-size: 12px;"/>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NModal } from 'naive-ui'
import { ref, onMounted, computed } from 'vue'
import request from '@/utils/axios'
import { useRoute } from 'vue-router'
import { useFlowStore } from '@/store/flow'
import FlowInputs from '@/components/flows/FlowInputs.vue'
import VueJsonPretty from 'vue-json-pretty'

const route = useRoute()
// 显式声明 updateNodeInternals 事件，以避免 Vue 在 fragment 根节点组件中报出多余监听器警告。
// 该事件通常由 VueFlow 传入，用于请求节点更新内部布局。
defineEmits(['updateNodeInternals'])
const visible = defineModel<boolean>('show')

const props = defineProps<{
    nodeData: any
}>()

const form = ref({
    mock_upstream: '{}',
})

const result = ref<string | null>(null)
const flowSnapshot = ref<any>({})
const flowStore = useFlowStore()
const dependsOnList = ref<string[]>([])

onMounted(() => {
    flowSnapshot.value = flowStore.getFlowState()
    dependsOnList.value = props.nodeData.depends_on || []
    console.log(props.nodeData)
    if (!props.nodeData.test_inputs) {
        props.nodeData.test_inputs = { mock_flow_inputs: {}, mock_upstream: {} }
    }
    for (const nodeName of dependsOnList.value) {
        if (!props.nodeData.test_inputs.mock_upstream[nodeName]) {
            props.nodeData.test_inputs.mock_upstream[nodeName] = '{}'
        }
    }
})

async function handleRun() {
    console.log(props.nodeData.test_inputs)
    try {
        const res = await request.post(
            TenantSpaceAPI.flows.testNode(route.params.id as string),
            {
                node_name: props.nodeData.name,
                inputs: props.nodeData.test_inputs,
            }
        )
        result.value = JSON.stringify(res.data, null, 4)
    } catch (err: any) {
        result.value = `❌ ${err.message}`
    }
}

const parsedResult = computed(() => {
    try {
        return result.value ? JSON.parse(result.value) : null
    } catch {
        return { error: 'Invalid JSON' }
    }
})
</script>
<style scoped>
:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
}

.tight-form :deep(.n-form-item) {
    margin-bottom: -24px;
}
</style>