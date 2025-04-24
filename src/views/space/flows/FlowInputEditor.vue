<template>
    <div class="p-4 space-y-4">
        <div v-for="(input, index) in localInputs" :key="index" class="p-4 border rounded space-y-0">

            <n-form-item label="名称" label-placement="left" label-width="80px" class="flex-1"
                :feedback="!isValidName(input.name) ? '变量名必须以字母或下划线开头，仅可包含字母、数字和下划线' : ''"
                :validation-status="!isValidName(input.name) ? 'warning' : 'success'">
                <n-input v-model:value="input.name" placeholder="如：text" />
            </n-form-item>
            <n-form-item label="类型" label-placement="left" label-width="80px" class="flex-1">
                <n-select v-model:value="input.type" :options="[
                    { label: 'string', value: 'string' },
                    { label: 'number', value: 'number' },
                    { label: 'boolean', value: 'boolean' }
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
            <n-button type="error" size="small" @click="removeInput(index)">删除</n-button>
        </div>

        <n-button @click="addInput" size="small" type="primary">新增输入</n-button>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NFormItem, NInput, NSelect, NSwitch, NButton } from 'naive-ui'

const props = defineProps<{
    inputs: Array<any>
}>()

const emit = defineEmits<{
    (e: 'update', value: any[]): void
}>()

const localInputs = ref(props.inputs ? JSON.parse(JSON.stringify(props.inputs)) : [])

watch(localInputs, (val) => emit('update', val), { deep: true })

function addInput() {
    localInputs.value.push({
        name: '',
        label: '',
        type: 'string',
        required: false
    })
}

function removeInput(index: number) {
    localInputs.value.splice(index, 1)
}

function isValidName(name: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
}

function isLabelValid(label: string): boolean {
    const isChinese = /[\u4e00-\u9fa5]/.test(label)
    if (isChinese) {
        return label.length <= 20
    } else {
        const words = label.trim().split(/\s+/)
        return words.length <= 20
    }
}
</script>
