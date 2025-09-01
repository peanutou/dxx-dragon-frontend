<template>
    <n-layout class="h-full">
        <!-- Menu -->
        <n-layout-header bordered
                         class="pt-1 h-[48px]">
            <n-menu mode="horizontal"
                    :options="menuOptions"
                    @update:value="handleMenuSelect" />
        </n-layout-header>
        <!-- JSON View -->
        <n-layout v-if="currentSelectedView === 'data-view-json'"
                  style="overflow-y: auto; height: calc(100% - 48px);">
            <vue-json-pretty :data="parsedResult"
                             :deep="2"
                             showLength
                             showIcon
                             theme="dark"
                             @node-click="handleJsonNodeClick"
                             selectableType="single"
                             :highlightSelectedNode="true"
                             v-model:selectedValue="nodeSelectedPath"
                             class="p-4" />
        </n-layout>
        <!-- Pretty Preview -->
        <n-layout v-else-if="currentSelectedView === 'data-view-preview'"
                  style="overflow-y: auto; height: calc(100% - 48px);">
            <ViewerContainer :data="nodeResultData" />
        </n-layout>
    </n-layout>
</template>

<script setup lang="ts">
import type { MenuOption } from 'naive-ui'
import { ref, computed, h, Component } from 'vue'
import { NIcon, NMenu } from 'naive-ui'
import VueJsonPretty from 'vue-json-pretty'
import schematize from '@/utils/schematize'
import ViewerContainer from '@/components/nodes/test-run/ViewerContainer.vue'
import {
    WineOutline as WineIcon,
    ConstructOutline as ConstructIcon,
    DiscOutline as DiscIcon,
    DocumentAttachOutline as DocumentIcon,
} from '@vicons/ionicons5'

const emit = defineEmits(['update:schema'])
const props = defineProps<{ resultPath: string, result: string, dataTool?: boolean }>()
function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
}
const nodeSelectedPath = ref('')
function handleJsonNodeClick(node: any) {
    console.log('Node clicked:', node, nodeSelectedPath.value)
    const selectedValue = getValueByPath(parsedResult.value, nodeSelectedPath.value)
    // Save selectedValue to clipboard
    navigator.clipboard.writeText(JSON.stringify(selectedValue, null, 4))
    window.$message.success('已复制到剪贴板')
}
function getValueByPath(obj: any, path: string): any {
    if (!path) return obj;
    if (path === 'root') return obj;
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
const nodeResultData = computed(() => {
    return getValueByPath(parsedResult.value, props.resultPath)
})
const currentSelectedView = ref('data-view-preview')
const parsedResult = computed(() => {
    try {
        return props.result ? JSON.parse(props.result) : null
    } catch {
        return { error: 'Invalid JSON' }
    }
})
const menuOptions: MenuOption[] = [
    {
        label: '数据处理工具',
        key: 'data-processing-tools',
        icon: renderIcon(ConstructIcon),
        show: props.dataTool,
        children: [
            {
                type: 'group',
                label: '数据模型',
                key: 'people',
                children: [
                    {
                        label: '更新 Schema',
                        key: 'generate-schema',
                        icon: renderIcon(DocumentIcon)
                    },
                ]
            },
        ]
    },
    {
        label: '视图',
        key: 'data-view-tools',
        icon: renderIcon(DiscIcon),
        children: [
            {
                label: 'Context 视图',
                key: 'data-view-json',
                icon: renderIcon(DiscIcon),
            },
            {
                label: 'Result 视图',
                key: 'data-view-preview',
                icon: renderIcon(DiscIcon),
            },
        ]
    },
    {
        label: `${props.resultPath}`,
        key: 'node-result-path',
        icon: renderIcon(WineIcon),
    }
]

function handleMenuSelect(selectedKeys: string | string[]) {
    // 确保 selectedKeys 是数组类型
    const keys = Array.isArray(selectedKeys) ? selectedKeys : [selectedKeys];
    const selectedKey = keys[0];

    if (selectedKey === 'generate-schema') {
        emit('update:schema',
            schematize(
                getValueByPath(parsedResult.value, props.resultPath)
            )
        )
    }
    if (selectedKey === 'data-view-json') {
        currentSelectedView.value = 'data-view-json'
    }
    if (selectedKey === 'data-view-preview') {
        currentSelectedView.value = 'data-view-preview'
    }
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