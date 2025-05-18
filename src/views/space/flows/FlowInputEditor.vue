<template>
    <div class="p-4 space-y-4">
        <n-dynamic-input v-model:value="flowInputs" :min="0" :on-create="createEmptyInput" show-sort-button>
            <template #default="{ value: input, index }">
                <div class="p-4 border rounded space-y-0 w-full">
                    <n-form-item label="名称" label-placement="left" label-width="80px" class="flex-1"
                        :feedback="!isValidName(input.name) ? '变量名必须以字母或下划线开头，仅可包含字母、数字和下划线' : ''"
                        :validation-status="!isValidName(input.name) ? 'warning' : 'success'">
                        <n-input v-model:value="input.name" placeholder="如：text" />
                    </n-form-item>
                    <n-form-item label="类型" label-placement="left" label-width="80px" class="flex-1">
                        <n-select v-model:value="input.type" :options="[
                            { label: 'string', value: 'string' },
                            { label: 'number', value: 'number' },
                            { label: 'boolean', value: 'boolean' },
                            { label: 'select', value: 'select' },
                            { label: 'file', value: 'file' }
                        ]" />
                    </n-form-item>
                    <n-form-item label="标签" label-placement="left" label-width="80px"
                        :feedback="!isLabelValid(input.label) ? '中文不超过 20 个字，英文不超过 20 个词' : ''"
                        :validation-status="!isLabelValid(input.label) ? 'warning' : 'success'">
                        <n-input v-model:value="input.label" placeholder="如：用户输入" />
                    </n-form-item>
                    <n-form-item label="必填" label-placement="left" label-width="80px">
                        <n-switch v-model:value="input.required" />
                    </n-form-item>
                    <n-form-item v-if="input.type === 'select'" label="下拉选项" label-placement="left" label-width="80px">
                        <n-dynamic-input v-model:value="input.options" :min="0" :on-create="() => ''" show-sort-button>
                            <template #default="{ value: option, index: optIndex }">
                                <div class="flex items-center space-x-2 w-full">
                                    <n-input v-model:value="input.options[optIndex]" placeholder="请输入选项内容"
                                        class="flex-1" />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </n-form-item>
                </div>
            </template>
        </n-dynamic-input>
    </div>
</template>

<script setup lang="ts">
import { NFormItem, NInput, NSelect, NSwitch, NButton, NDynamicInput } from 'naive-ui'
import { useFlowStore } from '@/store/flow'
import { storeToRefs } from 'pinia'

const flowStore = useFlowStore()
const { inputs: flowInputs } = storeToRefs(flowStore)

function createEmptyInput() {
    return {
        name: '',
        label: '',
        type: 'string',
        required: false,
        options: []
    }
}

import type { InputFieldConfig } from '@/store/flow'

function addOption(input: InputFieldConfig) {
    input.options = input.options || []
    input.options.push('')
}

function removeOption(input: InputFieldConfig, index: number) {
    if (input.options) {
        input.options.splice(index, 1)
    }
}

function isValidName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

function isLabelValid(label?: string): boolean {
    if (!label) return true
    const isChinese = /[\u4e00-\u9fa5]/.test(label)
    if (isChinese) {
        return label.length <= 20
    } else {
        const words = label.trim().split(/\s+/)
        return words.length <= 20
    }
}
</script>
