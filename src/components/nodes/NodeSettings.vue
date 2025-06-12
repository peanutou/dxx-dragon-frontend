<template>
    <n-form>
        <n-form-item label="在节点后运行">
            <n-collapse :accordion="true" :animated="false" class="mt-4">
                <n-collapse-item v-for="(edge, index) in connectedFromEdges" :key="edge.id" :name="edge.id">
                    <template #header>
                        <div class="flex items-center justify-between w-full">
                            <span>{{ getNodeById(edge.source)?.data?.name || '未知节点' }}</span>
                            <div class="flex items-center space-x-1 ms-auto ml-auto">
                                <n-icon v-if="Array.isArray(edge.data?.on) && edge.data.on.includes('success')"
                                    class="success-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-else class="unknown-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-if="Array.isArray(edge.data?.on) && edge.data.on.includes('failed')"
                                    class="failed-icon">
                                    <EllipseSharp />
                                </n-icon>
                                <n-icon v-else class="unknown-icon">
                                    <EllipseSharp />
                                </n-icon>
                            </div>
                        </div>
                    </template>
                    <n-space vertical class="ms-6">
                        <n-checkbox :checked="Array.isArray(edge.data?.on) && edge.data.on.includes('success')"
                            value="success" :on-update:checked="handleCheckboxChange(edge, 'success')">成功后</n-checkbox>
                        <n-checkbox :checked="Array.isArray(edge.data?.on) && edge.data.on.includes('failed')"
                            value="failed" :on-update:checked="handleCheckboxChange(edge, 'failed')">失败后</n-checkbox>
                    </n-space>
                </n-collapse-item>
            </n-collapse>
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import type { Node } from '@vue-flow/core'
import { useFlowStore } from '@/store/flow';
import { computed } from 'vue'
import { NForm, NFormItem, NCollapse, NCollapseItem, NCheckbox, NSpace, NIcon } from 'naive-ui'
import { EllipseSharp } from '@vicons/ionicons5'
import { storeToRefs } from 'pinia';
const { nodes, edges } = storeToRefs(useFlowStore())
const props = defineProps<{
    selectedNode: Node | undefined | null
}>()
const selectedNodeId = computed(() => props.selectedNode?.id || '')
const connectedFromEdges = computed(() => {
    return edges.value.filter(edge => edge.target === selectedNodeId.value)
})
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