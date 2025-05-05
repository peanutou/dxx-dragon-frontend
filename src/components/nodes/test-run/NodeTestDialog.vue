<template>
    <n-modal v-model:show="visible" title="测试运行" preset="dialog" style="width: 80%; max-height: 80vw">
        <n-form>
            <!-- 动态渲染模拟上下文输入字段 -->
            <FlowInputs :inputs="flowSnapshot.inputs || []"
                :input-values="props.nodeData.test_inputs.mock_flow_inputs" />
            <!-- 保留原始 mock_upstream 输入区域 -->
            <n-form-item v-for="node in props.nodeData.depends_on || []" :key="node" :label="`模拟输出：${node}`"
                :path="node">
                <n-input type="textarea" v-model:value="props.nodeData.test_inputs.mock_upstream[node]"
                    placeholder="请输入 JSON 格式依赖节点输出" />
            </n-form-item>
        </n-form>
        <n-space vertical>
            <n-layout has-sider>
                <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed"
                    show-trigger @collapse="collapsed = true" @expand="collapsed = false">
                    <n-menu :collapsed="collapsed" :collapsed-width="64" :collapsed-icon-size="22"
                        :options="menuOptions" :render-label="renderMenuLabel" :render-icon="renderMenuIcon"
                        :expand-icon="expandIcon" :default-expanded-keys="defaultExpandedKeys"
                        @update:value="handleMenuSelect">
                    </n-menu>
                </n-layout-sider>
                <n-layout>
                    <div v-if="result" style="max-height: 500px;" class="py-2 px-2">
                        <vue-json-pretty :data="parsedResult" :deep="6" showLength showIcon theme="dark"
                            @node-click="handleJsonNodeClick" selectableType="single" :highlightSelectedNode="true"
                            v-model:selectedValue="nodeResultPath" />
                    </div>
                </n-layout>
            </n-layout>
        </n-space>
        <template #action>
            <n-button type="primary" @click="handleRun" :loading="loading">运行</n-button>
            <n-button @click="visible = false">关闭</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NModal, NFormItem, NInput, NMenu, pProps } from 'naive-ui'
import { ref, computed, watch, h } from 'vue'
import request from '@/utils/axios'
import { useRoute } from 'vue-router'
import { useFlowStore } from '@/store/flow'
import FlowInputs from '@/components/flows/FlowInputs.vue'
import VueJsonPretty from 'vue-json-pretty'
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
} from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'

const route = useRoute()
const collapsed = ref(true)
const defaultExpandedKeys = ref(['data-processing-tools', 'people', 'beverage'])
const visible = defineModel<boolean>('show')
const props = defineProps<{
    nodeData: any
}>()
const result = ref<string | null>(null)
const flowSnapshot = ref<any>({})
const flowStore = useFlowStore()
const loading = ref(false)
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

function expandIcon() {
    return h(NIcon, null, { default: () => h(CaretDownOutline) })
}

function renderMenuLabel(option: MenuOption) {
    if ('href' in option) {
        return h('a', { href: option.href, target: '_blank' }, [
            option.label as string
        ])
    }
    return option.label as string
}

function renderMenuIcon(option: MenuOption) {
    // return render placeholder for indent
    if (option.key === 'sheep-man')
        return true
    // return falsy, don't render icon placeholder
    if (option.key === 'food')
        return null
    return h(NIcon, null, { default: () => h(ConstructIcon) })
}

function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}

const emit = defineEmits(['update:schema', 'update:save-test', 'update:clear-test'])
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
                        icon: renderIcon(PersonIcon)
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
]

function handleMenuSelect(selectedKeys: string | string[]) {
    // 确保 selectedKeys 是数组类型
    const keys = Array.isArray(selectedKeys) ? selectedKeys : [selectedKeys];
    const selectedKey = keys[0];

    if (selectedKey === 'generate-schema') {
        emit('update:schema', nodeSchema.value)
    }
    if (selectedKey === 'save-test') {
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

function initializeTestData(node: any) {
    if (!node) return
    result.value = null
    if (node.outputs) {
        result.value = JSON.stringify({
            data: node
        })
    } else {
        node.test_inputs = {}
    }
    nodeResultPath.value = 'root.data.node.outputs.result'
    flowSnapshot.value = flowStore.getFlowState()

    // Ensure test_inputs and mock_flow_inputs are initialized
    if (!node.test_inputs || typeof node.test_inputs !== 'object') {
        node.test_inputs = {}
    }
    if (!node.test_inputs.mock_flow_inputs || typeof node.test_inputs.mock_flow_inputs !== 'object') {
        node.test_inputs.mock_flow_inputs = {}
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