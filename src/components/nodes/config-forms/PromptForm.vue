<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>

        <n-form-item label="模型">
            <n-select v-model:value="node.model" :options="[{ label: 'gpt-4o', value: 'gpt-4o' }]"
                placeholder="请选择模型" />
        </n-form-item>

        <n-form-item label="Temperature">
            <n-input-number v-model:value="node.temperature" :min="0" :max="2" :step="0.1" />
        </n-form-item>

        <n-form-item label="是否输出 JSON">
            <n-switch v-model:value="node.output_json" />
        </n-form-item>

        <n-form-item>
            <template #label>
                <div class="flex items-center justify-between w-full space-x-2">
                    <span>系统提示</span>
                    <n-button size="tiny" @click="showModal.systemPrompt = true" quaternary type="primary">大窗编辑</n-button>
                </div>
            </template>
            <context-input v-model:modelValue="node.system_prompt" type="textarea" placeholder="请输入系统提示" />
        </n-form-item>

        <n-form-item>
            <template #label>
                <div class="flex items-center justify-between w-full space-x-2">
                    <span>Prompt 模板</span>
                    <n-button size="tiny" @click="showModal.template = true" quaternary type="primary">大窗编辑</n-button>
                </div>
            </template>
            <context-input v-model:modelValue="node.template" type="textarea" placeholder="请输入 Prompt 模板" />
        </n-form-item>
    </n-form>
    <n-modal v-model:show="showModal.template" title="编辑 Prompt 模板" preset="dialog" style="width: 80%;">
        <context-input v-model:modelValue="node.template" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal.template = false">完成</n-button>
        </template>
    </n-modal>
    <n-modal v-model:show="showModal.systemPrompt" title="编辑系统提示" preset="dialog" style="width: 80%;">
        <context-input v-model:modelValue="node.system_prompt" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal.systemPrompt = false">完成</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NFormItem, NInput, NInputNumber, NButton, NSwitch, NSpace, NForm, NModal } from 'naive-ui'
import ContextInput from '@/components/shared/ContextInput.vue'

// Destructure node directly for template binding
const { node } = defineProps<{ node: Record<string, any> }>()
const showModal = ref({
    systemPrompt: false,
    template: false
})
</script>
