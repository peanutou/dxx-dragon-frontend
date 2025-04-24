<template>
    <div class="p-4 space-y-4">
        <div v-for="(value, key, index) in localVariables" :key="key" class="p-4 border rounded space-y-0">
            <n-form-item label="变量名" label-placement="left" label-width="80px" class="flex-1">
                <n-input v-model:value="keyMap[index]" @input="onKeyEdit(index)" />
            </n-form-item>
            <n-form-item label="值" label-placement="left" label-width="80px" class="flex-1">
                <n-auto-complete v-model:value="localVariables[key]" :options="filteredSuggestions(localVariables[key])"
                    placeholder="如：{{ inputs.text }}" clearable />
            </n-form-item>
            <n-button type="error" size="small" @click="removeVariable(key as string)">删除</n-button>
        </div>
        <div class="flex gap-2 items-center">
            <n-button @click="addVariable" size="small" type="primary">新增变量</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { NFormItem, NInput, NButton, NAutoComplete } from 'naive-ui'

const props = defineProps<{
    variables: Record<string, string>
    inputs: { name: string }[]
}>()

const emit = defineEmits<{
    (e: 'update', value: Record<string, string>): void
}>()

const localVariables = ref({ ...props.variables })
const newKey = ref('')
const keyMap = ref(Object.keys(localVariables.value))

const suggestions = computed(() =>
    (props.inputs || []).map(input => `{{ inputs.${input.name} }}`)
)

function filteredSuggestions(value: string) {
    if (value?.includes('{')) {
        return suggestions.value
    }
    return []
}

watch(localVariables, (val) => emit('update', val), { deep: true })

function onKeyEdit(index: number) {
    const oldKey = Object.keys(localVariables.value)[index]
    const newKey = keyMap.value[index]
    if (oldKey !== newKey && newKey) {
        const val = localVariables.value[oldKey]
        delete localVariables.value[oldKey]
        localVariables.value[newKey] = val
    }
}

function addVariable() {
    const key = ''
    keyMap.value.push(key)
    localVariables.value[key] = ''
}

function removeVariable(key: string) {
    delete localVariables.value[key]
}
</script>
