<template>
    <div class="operand-picker">
        <n-tooltip trigger="hover">
            <template #trigger>
                <n-icon size="16"
                        class="picker-icon">
                    <HelpCircleOutline />
                </n-icon>
            </template>
            {{ label }}
        </n-tooltip>
        <div class="operand-picker-content">
            <n-popselect v-model:value="selectedType"
                         :options="typeOptions"
                         @update-value="onPopSelect">
                <n-button size="tiny"
                          class="source-select">
                    <template #icon>
                        <component :is="currentIcon" />
                    </template>
                </n-button>
            </n-popselect>
            <div class="operand-picker-input">
                <n-input v-if="selectedType === 'value'"
                         v-model:value="inputValue"
                         placeholder="Enter value"
                         size="tiny"
                         class="value-input" />

                <n-select v-if="selectedType === 'column'"
                          v-model:value="inputValue"
                          size="tiny"
                          :options="props.columnKeys.map(name => ({ label: name, value: name }))"
                          placeholder="Select column"
                          class="value-input" />

                <n-select v-if="selectedType === 'variable'"
                          v-model:value="inputValue"
                          size="tiny"
                          :options="props.variableNames.map(name => ({ label: name, value: name }))"
                          placeholder="Select variable"
                          class="value-input" />

                <div v-else-if="selectedType === 'function'"
                     class="function-config">
                    <n-select v-model:value="functionName"
                              :options="functionOptions"
                              size="tiny"
                              class="value-input" />
                    <OperandPicker v-for="(arg, i) in functionArgs"
                                   :key="arg.id || i"
                                   v-model="functionArgs[i]"
                                   :column-keys="props.columnKeys"
                                   :variable-names="props.variableNames"
                                   :label="`${arg.label}: ${arg.description}` || `Arg ${i + 1}`"
                                   source="value" />
                    <n-button v-if="isExpandableFunction"
                              @click="addArg"
                              size="tiny"
                              class="value-input">+
                        Arg</n-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { NSelect, NInput, NIcon, NTooltip, NButton, NPopselect } from 'naive-ui'
import {
    GitBranchOutline, CubeOutline, FlaskOutline, HelpCircleOutline,
    DocumentTextOutline, ListOutline, InformationCircleOutline
} from '@vicons/ionicons5'
import { Operand, OperandSource, FUNCTION_OPTIONS } from './types';
import { createOperand } from './composables/useExpressionBuilder'

const props = defineProps<{
    modelValue: Operand
    columnKeys: string[]
    variableNames: string[]
    source: OperandSource
    label: string
}>()
const emit = defineEmits<{
    (e: 'update:modelValue', value: Operand): void
}>()

const functionOptions = FUNCTION_OPTIONS.map(fn => ({
    label: fn.label,
    value: fn.value
}))
const functionComputed = computed({
    get: () => {
        if (props.modelValue.source === 'function') {
            return props.modelValue
        }
        return createOperand('function', 'find')
    },
    set: (val: Operand) => {
        if (selectedType.value === 'function') {
            emit('update:modelValue', val)
        }
    }
})
const functionArgs = computed({
    get: () => functionComputed.value.args ?? [],
    set: (newArgs: Operand[]) => {
        functionComputed.value = {
            ...functionComputed.value,
            args: newArgs
        }
    }
})
const functionName = computed({
    get: () => functionComputed.value.name || 'find',
    set: (val: string) => {
        if (functionComputed.value.name === val) return
        functionComputed.value = {
            ...createOperand('function', val)
        }
    }
})

const isExpandableFunction = computed(() => {
    const def = FUNCTION_OPTIONS.find(f => f.value === functionName.value)
    return def?.expandable ?? false
})

function addArg() {
    functionArgs.value = [...functionArgs.value, createOperand('value')]
}
// Operand Types
const typeOptions = computed(() => {
    const options = [{ label: 'Value', value: 'value' }]
    if (props.columnKeys?.length) options.push({ label: 'Column', value: 'column' })
    if (props.variableNames?.length) options.push({ label: 'Variable', value: 'variable' })
    options.push({ label: 'Function', value: 'function' })
    return options
})
const typeIconMap = {
    value: DocumentTextOutline,
    variable: CubeOutline,
    function: FlaskOutline,
    column: ListOutline,
    default: GitBranchOutline,
}
const currentIcon = computed(() => typeIconMap[selectedType.value] || typeIconMap.default)

const sourceValueMap: Record<string, (val: any) => string> = {
    value: (val) => val?.value || '',
    variable: (val) => val?.name || '',
    column: (val) => val?.name || '',
    function: (val) => val?.value || 'find',
    default: () => ''
}
const inputValue = computed({
    get: () => sourceValueMap[props.modelValue?.source || 'default'](props.modelValue),
    set: (val: string) => {
        const current = props.modelValue
        if (selectedType.value === 'value') {
            emit('update:modelValue', { ...current, source: 'value', value: val })
        } else if (selectedType.value === 'variable') {
            emit('update:modelValue', { ...current, source: 'variable', name: val })
        } else if (selectedType.value === 'column') {
            emit('update:modelValue', { ...current, source: 'column', name: val })
        } else if (selectedType.value === 'function') {
            emit('update:modelValue', { ...current, source: 'function', name: functionName.value, args: functionArgs.value })
        }
    }
})

const selectedType = ref<OperandSource>(props.modelValue?.source || 'value')
function onPopSelect(val: string | undefined) {
    if (!val) return
    selectedType.value = val as OperandSource
    const newOperand = {
        ...createOperand(selectedType.value),
        label: props.modelValue.label,
        description: props.modelValue.description,
    }
    emit('update:modelValue', newOperand)
}
</script>

<style scoped>
.operand-picker {
    display: flex;
    flex-direction: row;
    align-items: top;
    --line-height: 30px;
    --line-margin-bottom: 5px;
}

.operand-picker-content {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex: 1;
}

.operand-picker-input {
    flex: 1;
}

.picker-icon {
    height: var(--line-height);
    width: var(--line-height);
    cursor: pointer;
    display: flex;
    padding: 5px;
    align-items: center;
    margin-bottom: var(--line-margin-bottom);
}

.source-select {
    width: 30px;
    height: var(--line-height);
    margin-bottom: var(--line-margin-bottom);
}

.value-input {
    text-align: left;
    align-items: center;
    height: var(--line-height);
    margin-bottom: var(--line-margin-bottom);
}

:deep(.n-base-selection-label) {
    height: var(--line-height);
    /* margin-bottom: var(--line-margin-bottom); */
}
</style>
