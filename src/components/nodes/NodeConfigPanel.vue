<template>
    <div v-if="selectedNode" class="pt-4 flex flex-col h-full">
        <!-- Scrollable content area -->
        <div class="flex-1 overflow-auto">
            <NodeFormRenderer :type="selectedNode.type ?? ''" v-model:data="localData" />
        </div>
        <!-- Sticky save button at bottom -->
        <n-row :gutter="[24, 0]" class="border-t border-gray-600 pt-3">
            <n-col :span="8">
                <SchemaInput v-model:schema="localData.outputs" link-text="输出 Schema (可选)"
                    placeholder="请输入 JSON 示例数据" :key="selectedNode.id" />
            </n-col>
            <n-col :span="16">
                <div class="flex justify-end">
                    <n-button type="primary" @click="submit">保存配置</n-button>
                </div>
            </n-col>
        </n-row>
    </div>
    <div v-else class="text-gray-400 text-sm">请选择一个节点进行配置</div>
</template>

<script setup lang="ts">
import NodeFormRenderer from './NodeFormRenderer.vue'
import SchemaInput from '../shared/SchemaInput.vue';
import { watch, reactive, toRaw, ref } from 'vue'
import { NRow, NCol, NButton, NCard } from 'naive-ui'
import type { Node } from '@vue-flow/core'

/*
 * Props for the NodeConfigPanel component
 */
const props = defineProps<{
    selectedNode: Node | undefined | null
}>()

const localData: Record<string, any> = reactive({})
const emit = defineEmits<{
    (e: 'update:config', data: Record<string, any>): void
}>()

watch(
    () => props.selectedNode?.data,
    async (newData) => {
        if (newData) {
            if (JSON.stringify(newData) === JSON.stringify(localData)) {
                // No changes, do nothing
                return
            }
            Object.assign(localData, newData)
        }
    },
    { immediate: true, deep: true }
)

function submit() {
    try {
        emit('update:config', toRaw(localData))
    } catch (e) {
        window.$message?.error?.('请检查模板 JSON 格式是否正确:')
    }
}
</script>
