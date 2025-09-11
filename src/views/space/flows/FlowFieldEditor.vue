<template>
    <n-dynamic-input v-model:value="props.object[props.fieldName]"
                     :min="0"
                     :on-create="createEmptyInput"
                     :item-class="'space-y-2'"
                     show-sort-button>
        <template #default="{ value: input, index }">
            <n-form class="w-full border-b border-gray-600"
                    label-placement="left">
                <n-grid cols="2">
                    <!-- Name -->
                    <n-form-item-gi label="名称"
                                    label-width="80px"
                                    class="flex-1"
                                    :feedback="!isValidName(input.name) ? '字母或下划线开头，仅包含字母、数字和下划线' : ''"
                                    :validation-status="!isValidName(input.name) ? 'warning' : 'success'">
                        <n-input v-model:value="input.name"
                                 placeholder="如：text" />
                    </n-form-item-gi>
                    <!-- Type -->
                    <n-form-item-gi label="类型"
                                    label-width="80px"
                                    class="flex-1">
                        <n-select v-model:value="input.type"
                                  :options="options"
                                  @update:value="handleTypeChange(input)" />
                    </n-form-item-gi>
                    <!-- Label -->
                    <n-form-item-gi v-if="fieldType === 'inputs'"
                                    label="标签"
                                    label-width="80px"
                                    :feedback="!isLabelValid(input.label) ? '中文不超过 100 个字，英文不超过 100 个词' : ''"
                                    :validation-status="!isLabelValid(input.label) ? 'warning' : 'success'">
                        <n-input v-model:value="input.label"
                                 placeholder="如：用户输入" />
                    </n-form-item-gi>
                    <!-- Required -->
                    <n-form-item-gi v-if="fieldType === 'inputs'"
                                    label="必填"
                                    label-width="80px">
                        <n-switch v-model:value="input.required" />
                    </n-form-item-gi>

                    <!------------------------->

                    <!-- Select: for [Input] -->
                    <n-form-item-gi v-if="input.type === 'select'"
                                    label="下拉选项"
                                    label-width="80px"
                                    :span="2">
                        <n-dynamic-input v-model:value="input.options"
                                         :min="0"
                                         :on-create="() => ''"
                                         show-sort-button>
                            <template #default="{ value: option, index: optIndex }">
                                <div class="flex items-center space-x-2 w-full">
                                    <n-input v-model:value="input.options[optIndex]"
                                             placeholder="请输入选项内容"
                                             class="flex-1" />
                                </div>
                            </template>
                        </n-dynamic-input>
                    </n-form-item-gi>

                    <!-- String: for [Input, Variable] -->
                    <n-form-item-gi v-if="input.type === 'string'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2">
                        <n-input v-if="fieldType === 'inputs'"
                                 v-model:value="input.default"
                                 :placeholder="placeholder(input.type)"
                                 class="w-full" />
                        <context-input v-if="fieldType === 'variables'"
                                       v-model:modelValue="input.expression"
                                       :placeholder="placeholder(input.type)"
                                       class="w-full" />
                    </n-form-item-gi>

                    <!-- Number: for [Input, Variable] -->
                    <n-form-item-gi v-if="input.type === 'number'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2"
                                    :feedback="!isValidNumber(input.expression) ? '请输入有效的数字' : ''"
                                    :validation-status="!isValidNumber(input.expression) ? 'warning' : 'success'">
                        <n-input-number v-if="fieldType === 'inputs'"
                                        v-model:value="input.default"
                                        :placeholder="placeholder(input.type)"
                                        class="w-full" />
                        <context-input v-if="fieldType === 'variables'"
                                       v-model:modelValue="input.expression"
                                       :placeholder="placeholder(input.type)"
                                       class="w-full" />
                    </n-form-item-gi>

                    <!-- Select: for [Input] -->
                    <n-form-item-gi v-if="input.type === 'select'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2">
                        <n-select v-model:value="input.default"
                                  :placeholder="placeholder(input.type)"
                                  :options="[{ label: '', value: null }, ...input.options.map((option: string) => ({ label: option, value: option }))]"
                                  class="w-full" />
                    </n-form-item-gi>

                    <!-- Boolean: for [Input, Variable] -->
                    <n-form-item-gi v-if="input.type === 'boolean'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2"
                                    :feedback="!isValidBoolean(input.expression) ? '请输入 true 或 false' : ''"
                                    :validation-status="!isValidBoolean(input.expression) ? 'warning' : 'success'">
                        <n-switch v-if="fieldType === 'inputs'"
                                  v-model:value="input.default"
                                  :placeholder="placeholder(input.type)">
                            <template #checked>
                                true
                            </template>
                            <template #unchecked>
                                false
                            </template>
                        </n-switch>
                        <context-input v-if="fieldType === 'variables'"
                                       v-model:modelValue="input.expression"
                                       :placeholder="placeholder(input.type)"></context-input>
                    </n-form-item-gi>

                    <!-- File: for [Input] -->
                    <n-form-item-gi v-if="input.type === 'file'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2">
                        <n-input v-if="fieldType === 'inputs'"
                                 v-model:value="input.default"
                                 :placeholder="placeholder(input.type)"
                                 class="w-full" />
                    </n-form-item-gi>

                    <!-- Object: for [Input, Variable] -->
                    <n-form-item-gi v-if="input.type === 'object'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2"
                                    :feedback="!isValidObject(fieldType === 'variables' ? input.expression : input.default) ? `请输入有效的对象格式，如：${JSON.stringify({ key: 'value' })}` : ''"
                                    :validation-status="!isValidObject(fieldType === 'variables' ? input.expression : input.default) ? 'warning' : 'success'">
                        <n-input v-if="fieldType === 'inputs'"
                                 :default-value="JSON.stringify(input.default, null, 4)"
                                 :placeholder="placeholder(input.type)"
                                 v-on:update-value="input.default = isValidArray($event) ? JSON.parse($event) : null"
                                 class="w-full" />
                        <context-input v-if="fieldType === 'variables'"
                                       v-model:modelValue="input.expression"
                                       :placeholder="placeholder(input.type)"
                                       type="textarea"></context-input>
                    </n-form-item-gi>

                    <!-- Array: for [Input, Variable] -->
                    <n-form-item-gi v-if="input.type === 'array'"
                                    label="默认值"
                                    label-width="80px"
                                    class="flex-1"
                                    :span="2"
                                    :feedback="!isValidArray(fieldType === 'variables' ? input.expression : input.default) ? '请输入有效的数组格式，如：[1, 2, 3]' : ''"
                                    :validation-status="!isValidArray(fieldType === 'variables' ? input.expression : input.default) ? 'warning' : 'success'">
                        <n-input v-if="fieldType === 'inputs'"
                                 :default-value="JSON.stringify(input.default, null, 4)"
                                 :placeholder="placeholder(input.type)"
                                 v-on:update-value="input.default = isValidArray($event) ? JSON.parse($event) : null"
                                 class="w-full" />
                        <context-input v-if="fieldType === 'variables'"
                                       v-model:modelValue="input.expression"
                                       :placeholder="placeholder(input.type)"
                                       type="textarea"></context-input>
                    </n-form-item-gi>
                </n-grid>
            </n-form>
        </template>
    </n-dynamic-input>
</template>

<script setup lang="ts">
import { NInput, NInputNumber, NSelect, NSwitch, NDynamicInput, NGrid, NFormItemGi, NForm } from 'naive-ui'
import ContextInput from '@/components/shared/ContextInput.vue';
import { FieldConfig } from '@/store/flow'
import { isValidName, isLabelValid, isValidObject, isValidArray, isValidBoolean, isValidNumber } from '@/utils/valid';
const props = defineProps<{
    object: Record<string, any>,
    fieldName: string,
    fieldType: 'inputs' | 'variables',
}>()
const flowInputOptions = [
    { label: 'string', value: 'string' },
    { label: 'number', value: 'number' },
    { label: 'boolean', value: 'boolean' },
    { label: 'select', value: 'select' },
    { label: 'file', value: 'file' },
    { label: 'object', value: 'object' },
    { label: 'array', value: 'array' }
]
const flowVariablesOptions = [
    { label: 'string', value: 'string' },
    { label: 'number', value: 'number' },
    { label: 'boolean', value: 'boolean' },
    { label: 'object', value: 'object' },
    { label: 'array', value: 'array' }
]
const options = (() => {
    if (props.fieldType === 'inputs') {
        return flowInputOptions
    } else if (props.fieldType === 'variables') {
        return flowVariablesOptions
    } else {
        return []
    }
})()
const placeholder = ((type: string) => {
    switch (type) {
        case 'string':
            return '如：Hello World，空则 = ""'
        case 'number':
            return '如：1.123，空则 = 0'
        case 'boolean':
            return '如：true/false，空则 = false'
        case 'select':
            return '如：选项1, 选项2，空则 = ""'
        case 'file':
            return '如：file_1234567890，空则 = ""'
        case 'object':
            return '如：{"key": "value"}，空则 = {}'
        case 'array':
            return '如：[1, 2, 3]，空则 = []'
        default:
            return ''
    }
})
function handleTypeChange(input: FieldConfig) {
    console.log('Handling type change for input:', input);
    if (input.type === 'object' && !input.properties) {
        input.properties = []
        input.items = null
    }
    else if (input.type === 'array' && !input.items) {
        console.log('Creating empty items for array type');
        input.items = createEmptyInput()
        input.items.name = '__array_item__'
        input.properties = null
    }
    else if (input.type === 'boolean') {
        input.default = false
        input.expression = ''
        input.properties = null
        input.items = null
    }
    else {
        input.properties = null
        input.items = null
    }
}
function createEmptyInput(): FieldConfig {
    return {
        name: '',
        label: '',
        type: 'string',
        required: false,
        default: null,
        expression: '',
        options: [],
        properties: null,
        items: null
    }
}

</script>
