<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="localData.name" placeholder="请输入节点名称" />
        </n-form-item>

        <n-form-item label="模型">
            <n-select v-model:value="localData.model" :options="[{ label: 'gpt-4o', value: 'gpt-4o' }]"
                placeholder="请选择模型" />
        </n-form-item>

        <n-form-item label="Temperature">
            <n-input-number v-model:value="localData.temperature" :min="0" :max="2" :step="0.1" />
        </n-form-item>

        <n-form-item label="是否输出 JSON">
            <n-switch v-model:value="localData.output_json" />
        </n-form-item>

        <n-form-item>
            <template #label>
                <div class="flex items-center justify-between w-full space-x-2">
                    <span>Prompt 模板</span>
                    <n-button size="tiny" @click="showModal = true" quaternary type="primary">大窗编辑</n-button>
                </div>
            </template>
            <context-input v-model:modelValue="localData.template" type="textarea" placeholder="请输入 Prompt 模板" />
        </n-form-item>

        <n-space vertical :size="12">
            <schema-input v-model:schema="outputsSchema" link-text="输出 Schema (可选)" placeholder="请输入 JSON 示例数据" />
            <n-button type="primary" @click="submit">保存配置</n-button>
        </n-space>

    </n-form>
    <n-modal v-model:show="showModal" title="编辑 Prompt 模板" preset="dialog" style="width: 80%;">
        <context-input v-model:modelValue="localData.template" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal = false">完成</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NInputNumber, NButton, NSwitch, NSpace } from 'naive-ui'
import SchemaInput from '@/components/shared/SchemaInput.vue'
import ContextInput from '@/components/shared/ContextInput.vue'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
    node: Node
}>()

const emit = defineEmits<{
    (e: 'update', data: any): void
}>()

const localData = ref({ model: 'gpt-4o', temperature: 0, output_json: false, ...props.node.data })
const outputsSchema = ref(localData.value.outputs_schema || {})
const showModal = ref(false)

watch(() => props.node.data, (newData) => {
    localData.value = { ...newData }
    outputsSchema.value = newData.outputs_schema || {}
}, { immediate: true })

const submit = () => {
    localData.value.outputs_schema = outputsSchema.value
    emit('update', localData.value)
}
</script>
