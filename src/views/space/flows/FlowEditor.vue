<template>
    <div class="flow-layout">
        <!-- 左侧节点面板 -->
        <div class="left-panel side-panel">
            <n-card title="节点面板" size="small" class="h-full">
                <n-button v-for="type in nodeTypes" :key="type" class="draggable-node" draggable="true" text block
                    @dragstart="onDragStart($event, type)">
                    {{ type }}
                </n-button>
            </n-card>
        </div>

        <!-- 中间流程画布 -->
        <div class="canvas-panel">
            <n-card size="small" class="h-full" content-style="padding: 0; height: 100%;">
                <n-tabs v-model:value="activeTab" type="segment" class="h-full" pane-style="height: 100%;">
                    <n-tab-pane name="canvas" tab="流程画布">
                        <div style="height: 100%;">
                            <VueFlow ref="vueFlowRef" class="h-full" v-model:nodes="nodes" v-model:edges="edges"
                                :node-types="nodeTypesMap" :connection-mode="ConnectionMode.Loose" :pan-on-drag="true"
                                :default-edge-options="{
                                    type: 'default',
                                    markerEnd: 'arrowclosed'
                                }" @drop="onDrop" @dragover="onDragOver" @node-click="onNodeClick"
                                @nodes-change="onNodesChange" @edges-change="onEdgesChange" @connect="onConnect"
                                @viewport-change="onViewportChange" :is-valid-connection="validateConnection" />
                        </div>
                    </n-tab-pane>
                    <n-tab-pane name="globals" tab="全局配置" class="overflow-hidden">
                        <FlowGlobalsEditor v-model:inputs="flowInputs" v-model:variables="flowVariables" />
                    </n-tab-pane>
                </n-tabs>
            </n-card>
        </div>

        <!-- 右侧属性编辑器 -->
        <div class="right-panel side-panel" v-if="activeTab === 'canvas' && showPropertyPanel">
            <n-card title="属性编辑" size="small" class="h-full">
                <template #header-extra>
                    <n-button quaternary circle size="tiny" @click="showPropertyPanel = false">✕</n-button>
                </template>
                <NodeConfigPanel :selected-node="selectedNode"
                    @update:config="(data) => handleNodeUpdate(data, 'config')" />
            </n-card>
        </div>
    </div>
    <n-modal v-model:show="showYamlModal" preset="card" title="流程 YAML" style="width: 100vw; height: 100vh;"
        :content-style="{ height: '100%', overflow: 'auto' }">
        <FlowYAMLViewer :config="{
            nodes: nodes.map(n => ({ ...n.data, frontend: { position: n.position } })),
            inputs: flowInputs,
            variables: flowVariables,
            ...flowMeta
        }" />
    </n-modal>
    <n-modal v-model:show="showRunnerModal" preset="card" title="流程测试" style="width: 100vw; height: 100vh;"
        :content-style="{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }">
        <FlowRunner :test-mode="true" />
    </n-modal>
    <NodeTestDialog v-model:show="showNodeTestDialog" :node-data="testNodeData"
        @update:schema="(data) => handleNodeUpdate(data, 'schema')"
        @update:save-test="(data) => handleNodeUpdate(data, 'test')"
        @update:clear-test="(data) => handleNodeUpdate(data, 'clear')" />
</template>©

<script setup lang="ts">
import { TenantSpaceAPI } from '@/apis/endpoints'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import type { NodeChange, EdgeChange, Connection } from '@vue-flow/core';
import { ref, computed, onMounted, markRaw, h, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { VueFlow, ConnectionMode } from '@vue-flow/core'
import { useNavbarStore } from '@/store/navbar'
import { useFlowStore } from '@/store/flow'
import { storeToRefs } from 'pinia'
import { NButton, NTag, NCard } from 'naive-ui'
import request from '@/utils/axios'
import NodeConfigPanel from '@/components/nodes/NodeConfigPanel.vue'
import PromptNode from '@/components/nodes/custom-nodes/PromptNode.vue'
import HTTPNode from '@/components/nodes/custom-nodes/HTTPNode.vue'
import RegexNode from '@/components/nodes/custom-nodes/RegexNode.vue'
import AggregatorNode from '@/components/nodes/custom-nodes/AggregatorNode.vue'
import ExcelNode from '@/components/nodes/custom-nodes/ExcelNode.vue';
import ComparerNode from '@/components/nodes/custom-nodes/ComparerNode.vue';
import FlowGlobalsEditor from './FlowGlobalsEditor.vue'
import FlowYAMLViewer from './FlowYAMLViewer.vue'
import FlowRunner from './FlowRunner.vue'
import NodeTestDialog from '@/components/nodes/test-run/NodeTestDialog.vue'
import { generateShortId } from '@/utils/uid'


// 声明 flowDefinition
const flowDefinition = ref<any>(null)

const showYamlModal = ref(false)
const showRunnerModal = ref(false)
const statusOptions = [
    { label: '草稿', value: 'draft' },
    { label: '已发布', value: 'published' },
    { label: '已弃用', value: 'deprecated' }
]
const nodeTypesMap = {
    Prompt: markRaw(PromptNode),
    Http: markRaw(HTTPNode),
    Regex: markRaw(RegexNode),
    Aggregator: markRaw(AggregatorNode),
    Excel: markRaw(ExcelNode),
    Comparer: markRaw(ComparerNode),
}
const flowStore = useFlowStore()
const { undoStack, redoStack, hasChanges, inputs, variables } = storeToRefs(flowStore)
// 为了语义清晰，使用 flow* 前缀作为 storeToRefs 的别名
const flowInputs = inputs
const flowVariables = variables
let dragOffset = { x: 0, y: 0 }
const { nodes, edges } = storeToRefs(flowStore)
const nodeTypes = ['Prompt', 'HTTP', 'Regex', 'Aggregator', 'Excel', 'Comparer']
const selectedNode = ref<Record<string, any> | undefined>(undefined)
// Track if nodes are being dragged
const isDraggingNodes = ref(false)
const showPropertyPanel = ref(true)
const route = useRoute()

// 标志位: 是否正在恢复快照（undo/redo）
const isRestoringSnapshot = ref(false)

// Node test dialog control
const testNodeData = ref<any>(null)
const showNodeTestDialog = ref(false)

// Watch for changes in currentTestNode and display the dialog when set
watch(() => flowStore.currentTestNode, async (node) => {
    if (node) {
        if (hasChanges.value) {
            // Directly save if there are unsaved changes, no dialog
            const saved = await handleSave();
            // Only open modal if save succeeded and no unsaved changes remain
            if (saved && !hasChanges.value) {
                testNodeData.value = node
                showNodeTestDialog.value = true
            }
        }
        else {
            // No unsaved changes, directly open the dialog
            testNodeData.value = node
            showNodeTestDialog.value = true
        }
    }
})

// 延迟初始化标记
const inputsInitialized = ref(false)
const variablesInitialized = ref(false)
const nodesInitialized = ref(false)
const isInitializing = computed(() => {
    return !inputsInitialized.value || !variablesInitialized.value || !nodesInitialized.value
})

watch(flowInputs, () => {
    if (isRestoringSnapshot.value || isInitializing.value) {
        inputsInitialized.value = true
        return
    }
    snapshot()
}, { deep: true })

watch(flowVariables, () => {
    if (isRestoringSnapshot.value || isInitializing.value) {
        variablesInitialized.value = true
        return
    }
    snapshot()
}, { deep: true })

const { meta: flowMeta } = storeToRefs(flowStore)
// removed invalid import of VueFlowInstance; will use InstanceType<typeof VueFlow> instead

const vueFlowRef = ref<InstanceType<typeof VueFlow> | null>(null);
const navbarStore = useNavbarStore()
const activeTab = ref('canvas')

/*
    NOTE: 快照的时机
    1. VUE-FLOW
        - onNodesChange
        - onEdgesChange
        - onDrop
        - onConnect
        - onViewportChange (not supported yet)
    2. WATCH
        - flowInputs
        - flowVariables
        - flowMeta (not supported yet)
        - nodes's data (not supported yet)
    3. NODE FORM
        - handleNodeUpdate
    4. TEST DIALOG
        - ??
    5. SAVE / PUBLISH
        - handleSave
        - handlePublish
 */
function snapshot() {
    flowStore.snapshot()
}

function onViewportChange({ x, y, zoom }: { x: number; y: number; zoom: number }) {
    // 在这里可以保存视口状态到 flowMeta
    // 不支持撤销，仅在保存时进行存储
    flowMeta.value.frontend = {
        ...(flowMeta.value.frontend || {}),
        viewport: { x, y, zoom }
    }
}


const needsSnapshot = ref(false)

// VueFlow 事件处理
function onNodesChange(changes: NodeChange[]) {
    const hasRemoval = changes.some(change => change.type === 'remove')
    const hasPositionChange = changes.some(change => change.type === 'position')
    const hasSelectionChange = changes.some(change => change.type === 'select')
    const hasDimensionsChange = changes.some(change => change.type === 'dimensions')

    // console.log('onNodesChange', hasRemoval, hasPositionChange, hasSelectionChange, hasDimensionsChange, changes)

    // Set dragging state based on position change
    if (hasPositionChange) {
        if ('dragging' in changes[0] && changes[0].dragging) {
            isDraggingNodes.value = true
        } else {
            isDraggingNodes.value = false
            // End of dragging, save the position
            snapshot()
        }
    }

    if (hasRemoval) {
        changes.forEach(change => {
            if (change.type === 'remove' && change.id) {
                const removedNode = nodes.value.find(n => n.id === change.id)
                if (!removedNode?.data?.name) return

                const removedName = removedNode.data.name
                nodes.value.forEach(node => {
                    if (Array.isArray(node.data.depends_on)) {
                        node.data.depends_on = node.data.depends_on.filter(name => name !== removedName)
                    }
                })
            }
        })
        // Node removal, save the state
        needsSnapshot.value = true
        /* 
            NOTE: 删除节点时的 Lifecycle
            1. 有边，触发顺序
                onEdgesChange(hasRemoval true) -> 
                onNodesChange(removal true) -> 
                onEdgesChange([空数组]).
            2. 无边，触发顺序
                onNodesChange(removal true) ->
                onEdgesChange([空数组]).
        */
        selectedNode.value = undefined
    }
}

// VueFlow 事件处理
function onEdgesChange(changes: EdgeChange[]) {
    const hasRemoval = changes.some(change => change.type === 'remove')
    const isEmptyChange = changes.length === 0;

    // console.log('onEdgesChange', hasRemoval, changes)

    if (hasRemoval) {
        // 查找所有目标节点
        changes.forEach(change => {
            if (change.type === 'remove' && change.id) {
                const sourceId = change.source
                const targetId = change.target
                const sourceNode = nodes.value.find(n => n.id === sourceId)
                const targetNode = nodes.value.find(n => n.id === targetId)
                if (sourceNode && targetNode && Array.isArray(targetNode.data.depends_on)) {
                    targetNode.data.depends_on = targetNode.data.depends_on.filter(name => name !== sourceNode.data.name)
                }
            }
        })
        /* 
            如果是因为删除节点导致的，
            边的删除和节点删除会记录两次快照。
         */
        needsSnapshot.value = true
    }
    // Only snapshot if all changes have been processed, i.e. empty changes array
    if (isEmptyChange && needsSnapshot.value) {
        /* 
            This indicates that the changes have been processed 
            and no further changes are expected.
        */
        // Save the current state to the undo stack
        snapshot()
        needsSnapshot.value = false
    }
}

// 接收节点的 Form 更新事件
function handleNodeUpdate(updatedData: Record<string, any>, eventType?: string) {
    if (!selectedNode.value) return

    snapshot()

    if (eventType === 'schema') {
        selectedNode.value.data.outputs_schema = updatedData
    }
    else if (eventType === 'test') {
        selectedNode.value.data.test_inputs = updatedData.test_inputs
        selectedNode.value.data.debug_info = updatedData.debug_info
        selectedNode.value.data.outputs = updatedData.outputs
    }
    else if (eventType === 'config') {
        selectedNode.value.data = { ...selectedNode.value.data, ...updatedData }
    }
    else if (eventType === 'clear') {
        selectedNode.value.data.debug_info = {}
        selectedNode.value.data.outputs = {}
    }
    else {
        const newName = updatedData.name?.trim()
        const oldName = selectedNode.value.data.name
        const currentId = selectedNode.value.id

        const isDuplicate = nodes.value.some(n =>
            n.id !== currentId && n.data?.name === newName
        )

        if (isDuplicate) {
            window.$message?.error?.('名称已存在，请使用唯一名称')
            return
        }

        selectedNode.value.data = { ...updatedData }
        // 更新所有节点的 depends_on 中的引用
        nodes.value.forEach(node => {
            if (Array.isArray(node.data?.depends_on)) {
                node.data.depends_on = node.data.depends_on.map(dep => dep === oldName ? newName : dep)
            }
        })
    }
}

async function handleSave() {
    const flowId = route.params.id as string

    // 清理无效的 depends_on 引用
    flowStore.sanitizeDependsOn()

    const confirmed = await new Promise((resolve) => {
        window.$dialog?.warning({
            title: '校验完成',
            content: '已完成流程依赖校验，是否继续保存？',
            positiveText: '确认保存',
            negativeText: '取消',
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false)
        })
    })
    if (!confirmed) {
        return false
    }
    try {
        const res = await request.put(TenantSpaceAPI.flows.config(flowId), {
            ...flowStore.generateFlowConfigPayload()
        })
        window.$message?.success('保存成功')

        // Update flowMeta from backend response if available
        const updated = res?.data?.data
        if (updated) {
            flowStore.initializeFromFlowEntity(updated)
        }

        hasChanges.value = false
        return true
    } catch (err) {
        window.$message?.error('保存失败')
        console.error(err)
        return false
    }
}

// Handler for the 测试 button, checks for unsaved changes before opening runner modal
async function handleTestClick() {
    if (hasChanges.value) {
        // Directly save if there are unsaved changes, no dialog
        const saved = await handleSave();
        // Only open modal if save succeeded and no unsaved changes remain
        if (saved && !hasChanges.value) {
            showRunnerModal.value = true;
        }
    } else {
        showRunnerModal.value = true;
    }
}

function undo() {
    if (undoStack.value.length === 0) return
    isRestoringSnapshot.value = true
    flowStore.undo()
    setTimeout(() => {
        isRestoringSnapshot.value = false
    })
}

function redo() {
    if (redoStack.value.length === 0) return
    isRestoringSnapshot.value = true
    flowStore.redo()
    setTimeout(() => {
        isRestoringSnapshot.value = false
    })
}

onMounted(async () => {
    const flowId = route.params.id as string
    if (flowId) {
        try {
            const res = await request.get(TenantSpaceAPI.flows.get(flowId))
            const flowEntity = res?.data?.data
            if (flowEntity?.config) {
                flowDefinition.value = flowEntity
                flowStore.initializeFromFlowEntity(flowEntity)

                // Restore viewport
                const viewport = flowMeta.value.frontend?.viewport
                if (viewport) {
                    vueFlowRef.value?.setViewport?.(viewport)
                }
            }
        } catch (e) {
            window.$message?.error?.('加载流程失败')
        }
    }

    navbarStore.setActions([
        () =>
            h(NButton, {
                size: 'small',
                type: 'primary',
                onClick: handleSave,
            }, { default: () => '保存' }),

        () =>
            h(NButton, {
                size: 'small',
                type: 'warning',
                onClick: publishFlow,
            }, { default: () => '发布' }),
        () =>
            h('div', {}, '|'),
        () =>
            h(NButton, {
                size: 'small',
                onClick: handleTestClick,
            }, { default: () => '测试' }),

        () =>
            h('div', {}, '|'),
        () =>
            h(NButton, {
                size: 'small',
                onClick: () => (showYamlModal.value = true)
            }, { default: () => '查看 YAML' }),
        () =>
            h(NButton, {
                size: 'small',
                onClick: undo,
                disabled: undoStack.value.length === 0
            }, { default: () => '撤销' }),
        () =>
            h(NButton, {
                size: 'small',
                onClick: redo,
                disabled: redoStack.value.length === 0
            }, { default: () => '重做' }),
        () =>
            h(NTag, {
                type: 'info',
                size: 'small',
                style: 'margin-left: 8px;'
            }, {
                default: () => {
                    const match = statusOptions.find(opt => opt.value === flowMeta.value.status)
                    return match ? match.label : flowMeta.value.status || ''
                }
            }),
        () =>
            h(NTag, {
                type: 'default',
                size: 'small',
                onClick: () => console.log(undoStack.value.length),
                style: ''
            }, { default: () => flowMeta.value.name || '未命名流程' }),
    ])
})

onUnmounted(async () => {
    navbarStore.clearActions()
})

async function publishFlow() {
    const flowId = route.params.id as string
    try {
        if (hasChanges.value) {
            await handleSave()
        }
        const res = await request.post(TenantSpaceAPI.flows.publish(flowId))
        if (res?.data?.success) {
            window.$message?.success('发布成功')
        } else {
            window.$message?.info(res?.data?.message || '当前流程已发布或不可发布')
        }
    } catch (err) {
        window.$message?.error('发布失败')
        console.error(err)
    }
}

function getCanvasDropPosition(event: DragEvent) {
    const bounds = (event.target as HTMLElement).getBoundingClientRect()
    const viewport = vueFlowRef.value?.getViewport?.()
    const zoom = viewport?.zoom || 1
    const defaultNodeWidth = 120 * zoom
    const defaultNodeHeight = 40 * zoom
    return {
        x: (event.clientX - bounds.left - defaultNodeWidth / 2 - (viewport?.x || 0)) / zoom,
        y: (event.clientY - bounds.top - defaultNodeHeight / 2 - (viewport?.y || 0)) / zoom
    }
}

function createMarker(x: number, y: number, color: string) {
    const marker = document.createElement('div')
    marker.id = 'marker123'
    marker.style.position = 'absolute'
    marker.style.width = '10px'
    marker.style.height = '10px'
    marker.style.backgroundColor = color
    marker.style.left = `${x}px`
    marker.style.top = `${y}px`
    marker.style.zIndex = '1000'
    document.body.appendChild(marker)
}

function onDragStart(event: DragEvent, nodeType: string) {
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }
    event.dataTransfer?.setData('node/type', nodeType)
}

function onDragOver(event: DragEvent) {
    event.preventDefault()
}

async function onDrop(event: DragEvent) {
    // 检查被投放的组件是否是合法的 type
    const type = event.dataTransfer?.getData('node/type')
    if (!type) return

    const position = getCanvasDropPosition(event)
    const uniqueName = `${type.toLowerCase()}_${generateShortId()}`
    let defaultNodeData: Record<string, any> = {
        label: `${type} 节点`,
        name: uniqueName,
        type: type.toLowerCase(),
        frontend: { id: uniqueName }
    }

    function generateDefaultValue(schema: any, definitions: Record<string, any>): any {

        /** 必须先找 'default' 再查找 '$ref' **/

        if ('default' in schema) {
            return schema.default
        }

        if ('$ref' in schema) {
            const refKey = schema['$ref'].replace(/^#\/\$defs\//, '')
            const def = definitions[refKey]
            return generateDefaultValue(def, definitions)
        }

        if (schema.type === 'object' && schema.properties) {
            const obj: Record<string, any> = {}
            for (const [key, propSchema] of Object.entries(schema.properties)) {
                obj[key] = generateDefaultValue(propSchema, definitions)
            }
            return obj
        }

        if (schema.type === 'array') {
            return []
        }

        if (schema.type === 'string') return ''
        if (schema.type === 'number') return 0
        if (schema.type === 'boolean') return false

        return null
    }

    try {
        const res = await request.get(TenantSpaceAPI.flows.nodeTypes)
        const schema = res?.data?.data?.[type.toLowerCase()]
        // console.log('节点类型:', type, schema)
        if (schema?.properties) {
            const definitions = schema.$defs || {}
            for (const [key, prop] of Object.entries(schema.properties)) {
                if (key in defaultNodeData) continue
                defaultNodeData[key] = generateDefaultValue(prop, definitions)
            }
        }
        // console.log('默认节点数据:', defaultNodeData)

    } catch (err) {
        console.warn('无法加载默认节点配置:', err)
    }
    const nodeComponentType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
    snapshot()
    nodes.value.push({
        id: uniqueName,
        type: nodeComponentType, // This should already match keys like 'Prompt', 'HTTP', or 'Regex'
        position,
        data: { ...defaultNodeData, name: uniqueName }
    })
}

function onConnect(params: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) {
    const sourceNode = nodes.value.find((n) => n.id === params.source)
    const targetNode = nodes.value.find((n) => n.id === params.target)
    if (!sourceNode?.data?.name || !targetNode?.data?.name) {
        return
    }

    snapshot()
    edges.value.push({
        ...params,
        id: `e${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`
    })

    if (!Array.isArray(targetNode.data.depends_on)) {
        targetNode.data.depends_on = []
    }
    if (!targetNode.data.depends_on.includes(sourceNode.data.name)) {
        targetNode.data.depends_on.push(sourceNode.data.name)
    }
}

function onNodeClick(event: { node: Record<string, any> }) {
    selectedNode.value = event.node
    showPropertyPanel.value = true
}

// 验证连接是否有效：只允许 sourceHandle 以 'right' 开头且 targetHandle 以 'left' 开头
function validateConnection(connection: Connection): boolean {
    // console.log('validateConnection', connection)
    return (
        !!connection.sourceHandle?.startsWith('right') &&
        !!connection.targetHandle?.startsWith('left')
    )
}
</script>

<style scoped>
.h-full {
    height: 100%;
}

.flow-layout {
    display: flex;
    height: 100%;
}

.side-panel {
    flex: 0 0 auto;
}

.left-panel {
    width: 260px;
    /* border-right: 1px solid #eee; */
}

.right-panel {
    width: 300px;
    /* border-left: 1px solid #eee; */
}

.canvas-panel {
    flex: 1 1 0;
    overflow: hidden;
    position: relative;
    min-width: 100px;
}

.draggable-node {
    padding: 8px 8px;
    margin-bottom: 8px;
    border: 0.1rem solid #ccc;
    border-radius: 4px;
    cursor: grab;
    user-select: none;
}
</style>