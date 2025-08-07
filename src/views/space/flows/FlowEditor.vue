<template>
    <div class="flow-layout">
        <!-- 左侧节点面板 -->
        <n-card title="节点面板"
                size="small"
                class="left-panel side-panel">
            <template v-for="(type, index) in nodeTypeButtons"
                      :key="index">
                <n-button v-if="nodeTypeRegistry[type].label !== '-'"
                          class="draggable-node"
                          text
                          block
                          @dragstart="onDragStart($event, type)"
                          draggable="true">
                    <div class="node-text">
                        {{ nodeTypeRegistry[type].label }}
                    </div>
                    <n-tag v-if="nodeCountOfEachType[type]"
                           size="tiny"
                           class="ml-2">{{ nodeCountOfEachType[type]
                        }}</n-tag>
                </n-button>
                <n-divider v-else />
            </template>
        </n-card>
        <n-split direction="horizontal"
                 :max="0.85"
                 :min="0.15"
                 :default-size="0.65">
            <template #1> <!-- 中间流程画布 -->
                <n-tabs v-model:value="activeTab"
                        type="segment"
                        class="canvas-panel h-full"
                        pane-class="h-full">
                    <!-- Need to re-render on viewport change -->
                    <n-tab-pane name="canvas"
                                tab="流程画布"
                                style="padding: 0px;"
                                v-on:vue:mounted="vueFlowRef?.setViewport?.(viewport)">
                        <VueFlow ref="vueFlowRef"
                                 v-model:nodes="nodes"
                                 v-model:edges="edges"
                                 :connection-mode="ConnectionMode.Strict"
                                 :pan-on-drag="true"
                                 :node-types="nodeTypesMap"
                                 :edge-types="{
                                    'default': markRaw(CustomBaseEdge)
                                }"
                                 :default-edge-options="{
                                    type: 'default',
                                    markerEnd: 'arrowclosed',
                                }"
                                 @drop="onDrop"
                                 @dragover="onDragOver"
                                 @node-click="onNodeClick"
                                 @nodes-change="onNodesChange"
                                 @edges-change="onEdgesChange"
                                 @connect="onConnect"
                                 @viewport-change="onViewportChange"
                                 :is-valid-connection="validateConnection">
                            <MiniMap />
                            <Controls position="top-left">
                                <ControlButton title="Reset Transform"
                                               @click="resetTransform">
                                    <Icon name="reset" />
                                </ControlButton>
                                <ControlButton title="Toggle Dark Mode"
                                               @click="toggleDarkMode">
                                    <Icon v-if="dark"
                                          name="sun" />
                                    <Icon v-else
                                          name="moon" />
                                </ControlButton>
                                <ControlButton title="Log `toObject`"
                                               @click="logToObject">
                                    <Icon name="log" />
                                </ControlButton>
                            </Controls>
                        </VueFlow>
                    </n-tab-pane>
                    <n-tab-pane name="globals"
                                tab="全局配置"
                                class="overflow-hidden">
                        <FlowGlobalsEditor v-model:inputs="flowInputs"
                                           v-model:variables="flowVariables" />
                    </n-tab-pane>
                </n-tabs>
            </template>
            <template #2><!-- 右侧属性编辑器 -->
                <n-card title="属性编辑"
                        size="small"
                        class="right-panel"
                        v-if="activeTab === 'canvas' && showPropertyPanel">
                    <template #header-extra>
                        <n-button quaternary
                                  circle
                                  size="tiny"
                                  @click="showPropertyPanel = false">✕</n-button>
                    </template>
                    <template #default>
                        <!-- Scrollable area for NodeConfigPanel with a max height -->
                        <div style="height: calc(100vh - 120px);">
                            <NodeConfigPanel :selected-node="selectedNode" />
                        </div>
                    </template>
                </n-card>
                <n-card title="属性编辑"
                        size="small"
                        class="right-panel"
                        v-else-if="activeTab === 'globals' && showPropertyPanel">
                    <template #header-extra>
                        <n-button quaternary
                                  circle
                                  size="tiny"
                                  @click="showPropertyPanel = false">✕</n-button>
                    </template>
                    <template #default>
                        <!-- Scrollable area for NodeConfigPanel with a max height -->
                        <div style="height: calc(100vh - 120px);">
                            <FlowConfigPanel />
                        </div>
                    </template>
                </n-card>
            </template>
        </n-split>
    </div>
    <n-modal v-model:show="showYamlModal"
             preset="card"
             title="流程 JSON"
             style="width: 100vw; height: 100vh;"
             :content-style="{ height: '100%', overflow: 'auto' }">
        <FlowYAMLViewer :config="flowStore.generateFlowConfigPayload().config"
                        @update:flow-config="(data) => handleDataUpdate(data, 'update:flow-config')" />
    </n-modal>
    <n-modal v-model:show="showRunnerModal"
             preset="card"
             title="流程测试"
             style="width: 100vw; height: 100vh;"
             :content-style="{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }">
        <FlowRunner :flow-id="Array.isArray(route.params.id) ? route.params.id[0] : route.params.id"
                    :test-mode="true"
                    @update:flow-schema="(data) => handleDataUpdate(data, 'update:flow-schema')" />
    </n-modal>
    <n-modal v-model:show="showNodeTestDialog"
             preset="card"
             title="测试运行"
             style="width: 100vw; height: 100vh;"
             :content-style="{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }">
        <NodeTestDialog v-if="testNodeData"
                        :current-test-node="testNodeData"
                        @update:node-schema="(data) => handleDataUpdate(data, 'update:node-schema')" />
    </n-modal>
</template>

<script setup lang="ts">
import { TenantSpaceAPI } from '@/apis/endpoints'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import type { NodeProps, NodeChange, EdgeChange, Connection } from '@vue-flow/core';
import { NButton, NTag, NCard, NSplit, NTabs, NTabPane } from 'naive-ui'
import { ref, computed, onMounted, markRaw, h, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
// VueFlow 相关
import { VueFlow, ConnectionMode, Node } from '@vue-flow/core'
import { MiniMap } from '@vue-flow/minimap'
import { ControlButton, Controls } from '@vue-flow/controls'
import Icon from './FlowEditorIcon.vue'
const dark = ref(false)
function resetTransform() {
    vueFlowRef.value?.setViewport?.({ x: 0, y: 0, zoom: 1 })
}
function toggleDarkMode() {
    dark.value = !dark.value
}
function logToObject() {
    console.log('toObject', vueFlowRef.value?.toObject?.())
}
// Pinia 相关
import { useNavbarStore } from '@/store/navbar'
import { useFlowStore } from '@/store/flow'
import type { NodeType } from '@/store/flow'
import { storeToRefs } from 'pinia'
import request from '@/utils/axios'
// Panels
import FlowConfigPanel from './FlowConfigPanel.vue';
import NodeConfigPanel from '@/components/nodes/NodeConfigPanel.vue'
// Custom Edge
import CustomBaseEdge from '@/components/edges/CustomBaseEdge.vue';
// 其他组件
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
const nodeTypeRegistry: Record<string, { label: string; allowNested: boolean; canContainChildren?: boolean }> = {
    Start: { label: 'Start', allowNested: false },
    End: { label: 'End', allowNested: false },
    Prompt: { label: 'Prompt', allowNested: true },
    Http: { label: 'Http', allowNested: true },
    Regex: { label: 'Regex', allowNested: true },
    Aggregator: { label: 'Aggregator', allowNested: true },
    Excel: { label: 'Excel', allowNested: true },
    Comparer: { label: 'Comparer', allowNested: true },
    Python: { label: 'Python', allowNested: true },
    Join: { label: 'Join', allowNested: true, canContainChildren: true },
    ForEach: { label: 'ForEach', allowNested: true, canContainChildren: true },
}
const nodeDefaults = ref<Record<string, any>>({})
const nodeTypeButtons = Object.keys(nodeTypeRegistry)
const isNestedNodeType = (type: string): boolean => {
    const nodeType = nodeTypeRegistry[type]
    if (nodeType && 'canContainChildren' in nodeType && (nodeType as any).canContainChildren) {
        return true
    }
    return false
}
const nodeCountOfEachType = computed(() => {
    const countMap: Record<string, number> = {}
    nodes.value.forEach(node => {
        const type = node.type
        if (type) {
            countMap[type] = (countMap[type] || 0) + 1
        }
    })
    return countMap
})
const modules = import.meta.glob('@/components/nodes/custom-nodes/*Node.vue', { eager: true })
const nodeTypesMap: Record<string, any> = {}
for (const [key, _value] of Object.entries(nodeTypeRegistry)) {
    const filePath = Object.keys(modules).find(path => path.includes(`/${key}Node.vue`))
    if (filePath) {
        nodeTypesMap[key] = markRaw((modules as any)[filePath].default)
    } else {
        console.warn(`Component for ${key}Node.vue not found`)
    }
}
const flowStore = useFlowStore()
const {
    undoStack, redoStack, hasChanges, flowEntity, inputs,
    variables, outputs, nodes, edges, viewport, selectedNode
} = storeToRefs(flowStore)
// 为了语义清晰，使用 flow* 前缀作为 storeToRefs 的别名
const flowInputs = inputs
const flowVariables = variables
const nodesData = computed(() => {
    return nodes.value.map(node => {
        return {
            style: node.style,
            data: node.data,
        }
    })
})
const edgesData = computed(() => {
    return edges.value.map(edge => {
        return {
            data: edge.data,
        }
    })
})

let dragOffset = { x: 0, y: 0 }
// Track if nodes are being dragged
const isDraggingNodes = ref(false)
const showPropertyPanel = ref(true)
const route = useRoute()

// 标志位: 是否正在恢复快照（undo/redo）
const isRestoringSnapshot = ref(false)

// Node test dialog control
const testNodeData = ref<NodeProps | null>(null)
const showNodeTestDialog = ref(false)

// Watch for changes in currentTestNode and display the dialog when set
watch(() => flowStore.currentTestNode, async (node) => {
    if (node) {
        if (hasChanges.value) {
            // Directly save if there are unsaved changes, no dialog
            const saved = await handleSave();
            // Only open modal if save succeeded and no unsaved changes remain
            if (saved && !hasChanges.value) {
                testNodeData.value = node as unknown as NodeProps
                showNodeTestDialog.value = true
            }
        }
        else {
            // No unsaved changes, directly open the dialog
            testNodeData.value = node as unknown as NodeProps
            showNodeTestDialog.value = true
        }
    }
})

// 延迟初始化标记
const inputsInitialized = ref(false)
const variablesInitialized = ref(false)
const isInitializing = computed(() => {
    return !inputsInitialized.value || !variablesInitialized.value
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

watch(nodesData, () => {
    if (isRestoringSnapshot.value || isInitializing.value) {
        return
    }
    snapshot()
}, { deep: true })

watch(edgesData, () => {
    if (isRestoringSnapshot.value || isInitializing.value) {
        return
    }
    snapshot()
}, { deep: true })

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
    flowStore.viewport = { x, y, zoom }
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
        selectedNode.value = null
    }
}

// VueFlow 事件处理
function onEdgesChange(changes: EdgeChange[]) {
    const hasRemoval = changes.some(change => change.type === 'remove')
    const isEmptyChange = changes.length === 0;
    if (hasRemoval) {
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
        snapshot()
        needsSnapshot.value = false
    }
}

// 接收节点的 Form 更新事件
function handleDataUpdate(updatedData: any, eventType?: string) {

    snapshot()

    /* Flow Related */
    if (eventType === 'update:flow-schema') {
        outputs.value = updatedData
    }
    else if (eventType === 'update:flow-config') {
        handleFlowUpload(updatedData)
    }
    /* Node Related */
    else if (!selectedNode.value) {
        return
    }
    else if (eventType === 'update:node-schema') {
        selectedNode.value.data.outputs = updatedData
    }
    else if (eventType === 'update:node-name') {
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
        selectedNode.value.data.name = newName
    }
    else if (eventType === 'update:node-config') {
        selectedNode.value.data = { ...selectedNode.value.data, ...updatedData }
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
    }
}

async function handleSave(): Promise<boolean> {
    const flowId = route.params.id as string

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
            ...flowStore.generateFlowConfigPayload(),
        })
        if (res?.data?.success) {
            window.$message?.success('保存成功')
            const updated = res?.data?.data
            if (updated) {
                flowStore.initializeFromFlowEntity(updated)
            }
            hasChanges.value = false
            return true
        } else {
            window.$message?.error(res?.data?.message || '保存失败')
            return false
        }

    } catch (err) {
        window.$message?.error('保存失败')
        console.error(err)
        return false
    }
}

async function handleFlowUpload(updatedData: any) {
    const flowId = route.params.id as string

    const confirmed = await new Promise((resolve) => {
        window.$dialog?.warning({
            title: '上传确认',
            content: '流程 ID（flow_id） 、创建时间（created_at） 和状态（status）字段将被保持不变，是否继续？',
            positiveText: '确认保存',
            negativeText: '取消',
            onPositiveClick: () => resolve(true),
            onNegativeClick: () => resolve(false)
        })
    })

    if (!confirmed) {
        return
    }

    try {
        console.log('Uploading flow config:', updatedData)
        const res = await request.put(TenantSpaceAPI.flows.config(flowId), {
            config: updatedData
        })
        if (res?.data?.success) {
            window.$message?.success('上传成功')
            const updated = res?.data?.data
            if (updated) {
                flowStore.initializeFromFlowEntity(updated)
            }
            hasChanges.value = false
        } else {
            window.$message?.error(res?.data?.message || '上传失败')
        }
    } catch (err) {
        window.$message?.error('上传失败')
        console.error(err)
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
    selectedNode.value = null
    testNodeData.value = null
    if (flowId) {
        try {
            flowStore.resetFlowState()
            const res = await request.get(TenantSpaceAPI.flows.get(flowId))
            const flowEntity = res?.data?.data
            if (flowEntity?.config) {
                flowDefinition.value = flowEntity
                flowStore.initializeFromFlowEntity(flowEntity)
                // Restore viewport
                if (viewport) {
                    vueFlowRef.value?.setViewport?.(viewport.value)
                }
            }
        } catch (e) {
            window.$message?.error?.('加载流程失败')
        }
    }

    await request.get(
        TenantSpaceAPI.flows.nodeDefaults
    ).then(res => {
        nodeDefaults.value = res.data.data
        console.log('节点默认配置:', nodeDefaults.value)
    }).catch(err => {
        console.error('获取节点默认配置失败:', err)
        window.$message?.error?.('获取节点默认配置失败')
    })

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
            }, { default: () => '查看 JSON' }),
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
                    const match = statusOptions.find(opt => opt.value === flowEntity.value.status)
                    return match ? match.label : flowEntity.value.status || ''
                }
            }),
        () =>
            h(NTag, {
                type: 'default',
                size: 'small',
                onClick: () => console.log(undoStack.value.length, 'Nodes', nodes.value, 'Edges', edges.value, useFlowStore().mockContext),
                style: ''
            }, { default: () => flowEntity.value.name || '未命名流程' }),
    ])
})

onUnmounted(async () => {
    flowStore.resetFlowState()
    navbarStore.clearActions()
})

async function publishFlow() {
    const flowId = route.params.id as string
    try {
        if (hasChanges.value) {
            const saved = await handleSave()
            if (!saved) {
                return
            }
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

function getParentDropPosition(event: DragEvent) {
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

function getParentNodeId(event: DragEvent): string | null {
    const target = event.target as HTMLElement
    const parentNode = target.closest('.vue-flow__node')
    if (parentNode) {
        return parentNode.getAttribute('data-id') || null
    }
    return null
}

function getNodeTypeById(nodeId: string): string | null {
    const node = nodes.value.find(n => n.id === nodeId)
    return node ? node.type as string : null
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
    if (!type || !nodeTypeRegistry[type]) {
        console.warn('无效的节点类型:', type)
        return
    }
    // 如果是拖拽到节点上，获取节点的 ID
    const parentNodeId = getParentNodeId(event)
    const parentNodeType = getNodeTypeById(parentNodeId || '') || null
    // console.log('onDrop', type, event.type, event.target, parentNodeId, parentNodeType)
    if (parentNodeId && !isNestedNodeType(parentNodeType || '')) {
        console.warn('不能将节点放在此类型的节点下:', parentNodeType)
        return
    }

    const position = getParentDropPosition(event)
    const uniqueName = `${type.toLowerCase()}_${generateShortId()}`

    // 1. 找到是否有目标 Join 节点
    const defaultNodeData: Node = {
        id: uniqueName,
        type: type as NodeType,
        position: position,
        parentNode: parentNodeId || undefined,
        extent: parentNodeId ? 'parent' : undefined,
        data: {
            ...nodeDefaults.value[type].data || {},
            name: uniqueName,
        }
    }

    snapshot()
    nodes.value.push(defaultNodeData)
}

function onConnect(params: {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null
}) {
    const sourceNode = nodes.value.find((n) => n.id === params.source)
    const targetNode = nodes.value.find((n) => n.id === params.target)
    if (!sourceNode?.data?.name || !targetNode?.data?.name) {
        console.warn('源节点或目标节点缺少名称:', sourceNode, targetNode)
        return
    }

    snapshot()
    const edgeId = `edge-${generateShortId()}`
    const existingEdge = edges.value.find((e) => e.id === edgeId)
    // Edge already exists, no need to add it again
    if (existingEdge) {
        console.log('边已存在:', edgeId)
        return
    }
    // create a next data
    edges.value.push({
        ...params,
        id: edgeId,
        data: {
            on: ["success"],
            condition: "",
            description: "",
        },
    })
}

function onNodeClick(event: { node: Node }) {
    selectedNode.value = event.node
    showPropertyPanel.value = true
}

// 验证连接是否有效：只允许 sourceHandle 以 'right' 开头且 targetHandle 以 'left' 开头
function validateConnection(connection: Connection): boolean {
    // Only allow sourceHandle starting with 'right' and targetHandle starting with 'left'
    const isValidHandles =
        !!connection.sourceHandle?.startsWith('source') &&
        !!connection.targetHandle?.startsWith('target');
    if (!isValidHandles) return false;
    return true;
}

</script>

<style scoped>
/* Toolbar */
:deep(.vue-flow__controls) {
    box-shadow: 0 0 2px 1px var(--n-color-popover);
    display: flex;
}

:deep(.vue-flow__controls-button) {
    background-color: var(--n-text-color);
    border-bottom: 1px solid var(--n-border-color);
    box-sizing: content-box;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 16px;
    height: 16px;
    cursor: pointer;
    user-select: none;
    padding: 5px;
}

:deep(.vue-flow__controls-button) svg {
    width: 100%;
    max-width: 12px;
    max-height: 12px;
}

:deep(.vue-flow__controls-button:hover) {
    background: var(--n-bar-color);
}

:deep(.vue-flow__controls-button:disabled) {
    pointer-events: none;
}

:deep(.vue-flow__controls-button:disabled) svg {
    fill-opacity: 0.4;
}

/* Component */
.h-full {
    height: 100%;
}

.flow-layout {
    display: flex;
    height: 100%;
}

.left-panel {
    width: 200px;
}

.side-panel {
    flex: 0 0 auto;
}

.right-panel {
    width: auto;
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
    --node-width: 165px;
    width: var(--node-width);
    display: flex;
    align-items: center;
    justify-content: start;
}

.draggable-node .node-text {
    font-size: 14px;
    font-weight: 500;
    align-items: start;
    display: flex;
    justify-content: start;
    width: calc(var(--node-width) - 50px);
}


/* Minimap */
.vue-flow__minimap {
    transform: scale(75%);
    transform-origin: bottom right;
    background: var(--n-color-popover);
    opacity: 0.6;
}
</style>