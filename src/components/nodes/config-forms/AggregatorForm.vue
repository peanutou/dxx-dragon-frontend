<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="聚合策略">
            <n-select v-model:value="node.strategy" :options="[
                { label: '无策略 (使用模板)', value: 'none' },
                { label: '合并所有节点输出', value: 'merge' }
            ]" />
        </n-form-item>

        <n-form-item>
            <template #label>
                <div class="flex items-center justify-between w-full space-x-2">
                    <span>聚合输出模板 (JSON)</span>
                    <n-button size="tiny" @click="showModal = true" quaternary type="primary"
                        :disabled="strategy !== 'none'">
                        大窗编辑
                    </n-button>
                </div>
            </template>
            <context-input v-model:model-value="templateJson" type="textarea" :disabled="strategy !== 'none'"
                placeholder='{ "result": "{{ some_output }}" }' />
        </n-form-item>
    </n-form>
    <n-modal v-model:show="showModal" title="编辑聚合模板" preset="dialog" style="width: 800px">
        <context-input v-model:model-value="templateJson" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal = false">完成</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NModal } from 'naive-ui'
import ContextInput from '@/components/shared/ContextInput.vue'
import SchemaInput from '@/components/shared/SchemaInput.vue'

// Destructure node and alias its data
const { node } = defineProps<{ node: Record<string, any> }>()

// Reactive form controls
const strategy = ref(node.strategy || 'none')
const templateJson = ref(JSON.stringify(node.template || {}, null, 2))
const outputsSchema = ref(node.outputs_schema || {})
const showModal = ref(false)

// Sync back to data
watch(strategy, (val) => {
    node.strategy = val
})
watch(templateJson, (val) => {
    try {
        node.template = JSON.parse(val || '{}')
    } catch { }
})
watch(outputsSchema, (val) => {
    node.outputs_schema = val
})
</script>