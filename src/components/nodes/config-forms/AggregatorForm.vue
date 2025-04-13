<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="localData.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="聚合策略">
            <n-select v-model:value="strategy" :options="[
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

        <n-space vertical :size="12">
            <schema-input v-model:schema="outputsSchema" link-text="输出 Schema (可选)" placeholder="请输入 JSON 示例数据" />

            <n-button type="primary" @click="submit">保存配置</n-button>
        </n-space>

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
import { NForm, NFormItem, NInput, NButton, NSelect, NModal } from 'naive-ui'
import type { Node } from '@vue-flow/core'
import ContextInput from '@/components/shared/ContextInput.vue'
import SchemaInput from '@/components/shared/SchemaInput.vue'

const props = defineProps<{
    node: Node
}>()

const emit = defineEmits<{
    (e: 'update', data: any): void
}>()

const localData = ref({ ...props.node.data })
const strategy = ref(localData.value.strategy || 'none')
const templateJson = ref(JSON.stringify(localData.value.template || {}, null, 2))
const showModal = ref(false)
const outputsSchema = ref(localData.value.outputs_schema || {})

watch(() => props.node.data, (newData) => {
    localData.value = { ...newData }
    strategy.value = newData.strategy || 'none'
    templateJson.value = JSON.stringify(newData.template || {}, null, 2)
    outputsSchema.value = newData.outputs_schema || {}
})

function submit() {
    try {
        localData.value.strategy = strategy.value
        localData.value.template = JSON.parse(templateJson.value || '{}')
        localData.value.outputs_schema = outputsSchema.value
        emit('update', localData.value)
    } catch (e) {
        window.$message?.error?.('请检查模板 JSON 格式是否正确:')
    }
}
</script>