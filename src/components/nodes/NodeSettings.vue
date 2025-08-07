<template>
    <n-form>
        <n-form-item v-if="connectedFromEdges.length > 0"
                     label="在节点后运行">
            <n-collapse :accordion="false"
                        :default-expanded-names="connectedFromEdges.map(edge => edge.id)"
                        :animated="true">
                <n-collapse-item v-for="(edge, index) in connectedFromEdges"
                                 :key="edge.id"
                                 :name="edge.id">
                    <template #header>
                        <div class="flex items-center justify-between w-full">
                            <span>{{ getNodeById(edge.source)?.data?.name || '未知节点' }}</span>
                            <div class="flex items-center space-x-1 ms-auto ml-auto">
                                <n-icon v-if="Array.isArray(edge.data?.on) && edge.data.on.includes('success')"
                                        class="success-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-else
                                        class="unknown-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-if="Array.isArray(edge.data?.on) && edge.data.on.includes('failed')"
                                        class="failed-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-else
                                        class="unknown-icon">
                                    <EllipseSharp />
                                </n-icon>
                            </div>
                        </div>
                    </template>
                    <n-space vertical
                             class="ms-6">
                        <n-checkbox :checked="Array.isArray(edge.data?.on) && edge.data.on.includes('success')"
                                    value="success"
                                    :on-update:checked="handleCheckboxChange(edge, 'success')">成功后</n-checkbox>
                        <n-checkbox :checked="Array.isArray(edge.data?.on) && edge.data.on.includes('failed')"
                                    value="failed"
                                    :on-update:checked="handleCheckboxChange(edge, 'failed')">失败后</n-checkbox>
                        <n-input-group>
                            <n-input-group-label style="width: 120px">Description: </n-input-group-label>
                            <n-input v-model:value="edge.data.description"
                                     placeholder="请输入描述" />
                        </n-input-group>
                        <n-input-group>
                            <n-input-group-label style="width: 120px">Condition: </n-input-group-label>
                            <context-input type="textarea"
                                           v-model:model-value="edge.data.condition" />
                        </n-input-group>
                    </n-space>
                </n-collapse-item>
            </n-collapse>
        </n-form-item>
        <n-form-item label="Handler 模式"
                     :key="props.selectedNode?.id + '-handler-mode'">
            <n-select placeholder="请选择 Handler 模式"
                      :default-value="typeof props.selectedNode?.style === 'object' && !Array.isArray(props.selectedNode?.style) ? (props.selectedNode?.style as any).handlerMode || '' : ''"
                      :options="handleModeOptions"
                      :on-update:value="handleSelectChange" />

        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import type { Node, GraphEdge, Connection } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core';
import { updateEdgeAction } from '@vue-flow/core/dist/utils';
import { useFlowStore } from '@/store/flow';
import { computed, nextTick } from 'vue'
import {
    NForm, NFormItem, NCollapse, NCollapseItem, NCheckbox,
    NSpace, NIcon, NInput, NInputGroup, NInputGroupLabel,
    NSelect
} from 'naive-ui'
import { EllipseSharp } from '@vicons/ionicons5'
import { storeToRefs } from 'pinia';
import ContextInput from '@/components/shared/ContextInput.vue'
import { generateShortId } from '@/utils/uid';
const { nodes, edges } = storeToRefs(useFlowStore())
const props = defineProps<{
    selectedNode: Node | undefined | null
}>()
const selectedNodeId = computed(() => props.selectedNode?.id || '')
const connectedFromEdges = computed(() => {
    return edges.value.filter(edge => edge.target === selectedNodeId.value)
})
const handleModeOptions = [
    { label: 'Default', value: '' },
    { label: 'LEFT-RIGHT', value: 'LEFT-RIGHT' },
    { label: 'LEFT-BOTTOM', value: 'LEFT-BOTTOM' },
    { label: 'TOP-BOTTOM', value: 'TOP-BOTTOM' },
    { label: 'TOP-RIGHT', value: 'TOP-RIGHT' },
]
const getNodeById = (id: string) => {
    return nodes.value.find(node => node.id === id)
}
const handleCheckboxChange = (edge: any, type: 'success' | 'failed') => {
    return (checked: boolean) => {
        const onEvents = edge.data?.on || []
        if (checked) {
            if (!onEvents.includes(type)) {
                onEvents.push(type)
            }
        } else {
            const index = onEvents.indexOf(type)
            if (index > -1) {
                onEvents.splice(index, 1)
            }
        }
        edge.data.on = onEvents
    }
}
const handleSelectChange = (value: string) => {
    if (!props.selectedNode) return
    // Ensure style object exists
    if (props.selectedNode && !props.selectedNode.style) {
        props.selectedNode.style = {}
    }
    // Set handlerMode in style
    if (typeof props.selectedNode.style === 'object' && !Array.isArray(props.selectedNode.style)) {
        (props.selectedNode.style as any).handlerMode = value
    } else {
        // If style is not an object, reset it to an empty object
        props.selectedNode.style = { handlerMode: value }
    }
    // Find edges where source or target === selectedNode.id
    const connectedEdges = edges.value.filter(edge => edge.source === selectedNodeId.value || edge.target === selectedNodeId.value)
    // Update each edge's style
    const changedValue = value || 'TOP-BOTTOM';
    if (changedValue === 'LEFT-RIGHT') {
        connectedEdges.forEach(edge => {
            if (selectedNodeId.value === edge.source) {
                edge.sourceHandle = edge.sourceHandle?.replace('bottom', 'right')
            } else if (selectedNodeId.value === edge.target) {
                edge.targetHandle = edge.targetHandle?.replace('top', 'left')
            }
        })
    } else if (changedValue === 'LEFT-BOTTOM') {
        connectedEdges.forEach(edge => {
            if (selectedNodeId.value === edge.source) {
                edge.sourceHandle = edge.sourceHandle?.replace('right', 'bottom')
            } else if (selectedNodeId.value === edge.target) {
                edge.targetHandle = edge.targetHandle?.replace('top', 'left')
            }
        })
    } else if (changedValue === 'TOP-BOTTOM' || value === '') {
        connectedEdges.forEach(edge => {
            if (selectedNodeId.value === edge.source) {
                edge.sourceHandle = edge.sourceHandle?.replace('right', 'bottom')
            } else if (selectedNodeId.value === edge.target) {
                edge.targetHandle = edge.targetHandle?.replace('left', 'top')
            }
        })
    } else if (changedValue === 'TOP-RIGHT') {
        connectedEdges.forEach(edge => {
            if (selectedNodeId.value === edge.source) {
                edge.sourceHandle = edge.sourceHandle?.replace('bottom', 'right')
            } else if (selectedNodeId.value === edge.target) {
                edge.targetHandle = edge.targetHandle?.replace('left', 'top')
            }
        })
    } else {
        console.log(`Mode ${value} not supported yet.`)
    }
}
</script>

<style scoped>
.success-icon {
    display: flex;
    color: #22c55e;
    /* Green */
    font-size: 0.8em;
    width: 12px;
    align-items: center;
    justify-content: center;
}

.failed-icon {
    display: flex;
    color: #ef4444;
    /* Red */
    font-size: 0.8em;
    width: 12px;
    align-items: center;
    justify-content: center;
}

.unknown-icon {
    display: flex;
    color: #9ca3af;
    /* Gray */
    font-size: 0.4em;
    width: 12px;
    align-items: center;
    justify-content: center;
}
</style>