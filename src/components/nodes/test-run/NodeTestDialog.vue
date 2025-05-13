<template>
    <n-layout has-sider style="height: 100%; border: 1px solid lightgrey;">
        <n-layout-sider width="480px" class="border-r-2 border-gray-200">
            <n-card :bordered="true" size="small" class="h-full w-full" style="overflow-y: auto;"
                :title="nodeData.name">
                <template #header-extra>
                    <div class="flex items-center space-x-2">
                        <n-tag size="small" type="info">{{ nodeData.type }}</n-tag>
                    </div>
                </template>
                <n-thing class="mb-4 flex">
                    Depends on:
                    <div class="flex flex-wrap gap-2">
                        <n-tag v-for="(item, index) in nodeData.depends_on" :key="index" size="small" type="info">{{
                            item }}</n-tag>
                    </div>
                </n-thing>
                <!-- 动态渲染模拟上下文输入字段 -->
                <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">全局输入</n-divider>
                <FlowInputs :inputs="flowSnapshot.inputs || []"
                    :input-values="props.nodeData.test_inputs.mock_flow_inputs" />
                <!-- 保留原始 mock_upstream 输入区域 -->
                <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">模拟输出</n-divider>
                <n-form label-placement="top" label-width="280px" :model="props.nodeData.test_inputs.mock_upstream"
                    class="max-h-[300px] overflow-y-auto">
                    <n-form-item v-for="node in props.nodeData.depends_on || []" :key="node" :label="`模拟输出：${node}`"
                        :path="node">
                        <template #label>
                            <div class="flex items-center gap-2">
                                <n-icon :size="16" color="#666">
                                    <BookmarkOutline />
                                </n-icon>
                                <div>模拟输出：{{ node }}</div>
                            </div>
                        </template>
                        <div style="max-height: 150px; overflow-y: auto; width: 100%;">
                            <vue-json-pretty :data="props.nodeData.test_inputs.mock_upstream[node]" :deep="-1"
                                showLength showIcon theme="dark" selectableType="single"
                                :highlightSelectedNode="true" />
                        </div>
                        <!-- <n-input type="textarea" v-model:value="props.nodeData.test_inputs.mock_upstream[node]"
                        placeholder="请输入 JSON 格式依赖节点输出" />                 -->
                    </n-form-item>
                </n-form>
                <template #action>
                    <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
                </template>
            </n-card>
        </n-layout-sider>
        <n-layout>
            <!-- Menu -->
            <n-layout-header bordered class="pt-1 h-[48px]">
                <n-menu mode="horizontal" :options="menuOptions" @update:value="handleMenuSelect" />
            </n-layout-header>
            <!-- JSON View -->
            <n-layout v-if="currentSelectedView === 'data-view-json'"
                style="overflow-y: auto; height: calc(100% - 48px);">
                <vue-json-pretty :data="parsedResult" :deep="6" showLength showIcon theme="dark"
                    @node-click="handleJsonNodeClick" selectableType="single" :highlightSelectedNode="true"
                    v-model:selectedValue="nodeResultPath" class="p-4" />

            </n-layout>
            <!-- Pretty Preview -->
            <n-layout v-else-if="currentSelectedView === 'data-view-preview'"
                style="overflow-y: auto; height: calc(100% - 48px);">
                <NodeResultPreview :data="parsedResult" />
            </n-layout>
        </n-layout>
    </n-layout>
</template>

<script setup lang="ts">
import NodeResultPreview from '@/components/nodes/test-run/NodeResultPreview.vue'
import VueJsonPretty from 'vue-json-pretty'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NCard, NFormItem, NInput, NTag, NMenu, NButton, NSplit } from 'naive-ui'
import { ref, computed, watch, h } from 'vue'
import request from '@/utils/axios'
import { useRoute } from 'vue-router'
import { useFlowStore } from '@/store/flow'
import FlowInputs from '@/components/flows/FlowInputs.vue'
import schematize from '@/utils/schematize'
import type { MenuOption } from 'naive-ui'
import type { Component } from 'vue'
import {
    BookOutline as BookIcon,
    PersonOutline as PersonIcon,
    WineOutline as WineIcon,
    ConstructOutline as ConstructIcon,
    BookmarkOutline,
    CaretDownOutline,
    DiscOutline,
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

const props = defineProps<{ nodeData: any }>()
const emit = defineEmits(['update:schema', 'update:save-test', 'update:clear-test'])
const route = useRoute()
const result = ref<string | null>(null)
const flowSnapshot = ref<any>({})
const flowStore = useFlowStore()
const loading = ref(false)
const currentSelectedView = ref('data-view-preview')
const nodeResultPath = ref('');
const parsedResult = computed(() => {
    try {
        return result.value ? JSON.parse(result.value) : null
    } catch {
        return { error: 'Invalid JSON' }
    }
})
const nodeSchema = computed(() => {
    return schematize(
        getValueByPath(parsedResult.value, nodeResultPath.value)
    )
})

function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
    {
        label: '数据处理工具',
        key: 'data-processing-tools',
        icon: renderIcon(ConstructIcon),
        children: [
            {
                type: 'group',
                label: '结果数据模型',
                key: 'people',
                children: [
                    {
                        label: '更新 Schema',
                        key: 'generate-schema',
                        icon: renderIcon(BookIcon)
                    },
                ]
            },
            {
                type: 'group',
                label: '测试数据',
                key: 'debug',
                children: [
                    {
                        label: '保存测试数据',
                        key: 'save-test',
                        icon: renderIcon(WineIcon),
                    },
                    {
                        label: '清除测试数据',
                        key: 'clear-test',
                        icon: renderIcon(WineIcon),
                    },
                ]
            },
            // {
            //     label: 'The past increases. The future recedes.',
            //     key: 'the-past-increases-the-future-recedes',
            //     disabled: true,
            // }
        ]
    },
    {
        label: '视图',
        key: 'data-view-tools',
        icon: renderIcon(DiscOutline),
        children: [
            {
                label: 'JSON 视图',
                key: 'data-view-json',
                icon: renderIcon(DiscOutline),
            },
            {
                label: 'Preview 视图',
                key: 'data-view-preview',
                icon: renderIcon(DiscOutline),
            },
        ]
    }
]

function handleMenuSelect(selectedKeys: string | string[]) {
    // 确保 selectedKeys 是数组类型
    const keys = Array.isArray(selectedKeys) ? selectedKeys : [selectedKeys];
    const selectedKey = keys[0];

    if (selectedKey === 'generate-schema') {
        emit('update:schema', nodeSchema.value)
    }
    if (selectedKey === 'save-test') {
        emit('update:schema', nodeSchema.value)
        emit('update:save-test', {
            test_inputs: props.nodeData.test_inputs,
            debug_info: parsedResult.value?.data?.node.debug_info,
            outputs: parsedResult.value?.data?.node.outputs,
        })
    }
    if (selectedKey === 'clear-test') {
        result.value = null
        emit('update:clear-test', {})
    }
    if (selectedKey === 'data-view-json') {
        currentSelectedView.value = 'data-view-json'
    }
    if (selectedKey === 'data-view-preview') {
        currentSelectedView.value = 'data-view-preview'
    }
}

async function handleRun() {
    loading.value = true
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
    } finally {
        loading.value = false
    }
}

function handleJsonNodeClick(node: any) {
    // console.log(node.path)
    // console.log(nodeResultPath.value)
    if (node.path === nodeResultPath.value) {
        console.log(nodeSchema.value)
    } else {
        console.log('Clicked JSON node:', node)
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

function initializeTestData(nodeData: any) {
    if (!nodeData) return
    result.value = null
    if (nodeData.outputs) {
        result.value = JSON.stringify({
            data: {
                node: nodeData
            }
        })
    } else {
        nodeData.test_inputs = {}
    }
    nodeResultPath.value = 'root.data.node.outputs.result'
    flowSnapshot.value = flowStore.getFlowState()

    // Ensure test_inputs and mock_flow_inputs are initialized
    if (!nodeData.test_inputs || typeof nodeData.test_inputs !== 'object') {
        nodeData.test_inputs = {}
    }
    if (!nodeData.test_inputs.mock_flow_inputs || typeof nodeData.test_inputs.mock_flow_inputs !== 'object') {
        nodeData.test_inputs.mock_flow_inputs = {}
        nodeData.test_inputs.mock_upstream = {}
    }
    // Ensure mock_upstream is initialized
    if (!nodeData.test_inputs.mock_upstream || typeof nodeData.test_inputs.mock_upstream !== 'object') {
        nodeData.test_inputs.mock_upstream = {}
    }

    // 根据 node.depends_on 自动填充 mock_upstream
    if (Array.isArray(nodeData.depends_on)) {
        const targetId = nodeData.frontend.id
        const incoming = flowStore.edges.filter(e => e.target === targetId)
        const upstreamNodes = incoming.map(e => {
            const src = flowStore.nodes.find(n => n.id === e.source)
            return src?.data.outputs_schema
                ? { label: src.data.name, value: src.data.outputs?.result ?? null }
                : null
        })
        for (const node of upstreamNodes) {
            if (node && node.value) {
                // nodeData.test_inputs.mock_upstream[node.label] = JSON.stringify(node.value, null, 4)
                nodeData.test_inputs.mock_upstream[node.label] = node.value
            }
        }
    }
}

watch(
    () => props.nodeData,
    (newNodeData) => {
        initializeTestData(newNodeData)
    },
    { immediate: true }
)
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
</style>