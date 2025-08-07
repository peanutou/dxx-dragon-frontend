<template>
    <div v-if="selectedNode"
         class="pt-4 flex flex-col h-full">
        <!-- Scrollable content area -->
        <n-tabs type="line"
                animated
                class="h-full"
                :pane-class="'h-full flex flex-col overflow-auto'"
                :pane-wrapper-class="'h-full'">
            <n-tab-pane name="Node Config"
                        tab="节点参数">
                <div class="flex-1 overflow-auto">
                    <node-form-renderer :type="selectedNode.type ?? ''"
                                        :data="bindData" />
                </div>
                <!-- Sticky save button at bottom -->
                <n-row :gutter="[24, 0]"
                       class="border-t border-gray-600 pt-3 items-center">
                    <n-col :span="8">
                        <schema-input v-model:schema="bindData.outputs"
                                      link-text="输出 Schema (可选)"
                                      placeholder="请输入 JSON 示例数据"
                                      :key="selectedNode.id" />
                    </n-col>
                    <n-col :span="16">
                        <div class="flex justify-end">
                        </div>
                    </n-col>
                </n-row>
            </n-tab-pane>
            <n-tab-pane name="Node Settings"
                        tab="连接配置">
                <div class="flex-1 overflow-auto">
                    <NodeSettings :selectedNode="selectedNode" />
                </div>
            </n-tab-pane>
        </n-tabs>
    </div>
    <div v-else
         class="text-gray-400 text-sm">请选择一个节点进行配置</div>
</template>

<script setup lang="ts">
import NodeFormRenderer from './NodeFormRenderer.vue'
import SchemaInput from '../shared/SchemaInput.vue';
import NodeSettings from './NodeSettings.vue';
import { computed, reactive, toRaw, ref } from 'vue'
import { NRow, NCol, NButton, NCard, NTabs, NTabPane } from 'naive-ui'
import type { Node } from '@vue-flow/core'

/*
 * Props for the NodeConfigPanel component
 */
const props = defineProps<{
    selectedNode: Node | undefined | null
}>()

const bindData: Record<string, any> = computed(() => {
    return props.selectedNode?.data || {}
})

</script>
