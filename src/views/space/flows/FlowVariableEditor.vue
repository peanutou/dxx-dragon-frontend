<template>
    <div class="p-4 space-y-4">
        <div v-for="(pair, index) in localPairs" :key="index" class="p-4 border rounded space-y-0">
            <n-form-item label="变量名" label-placement="left" label-width="80px" class="flex-1">
                <n-input v-model:value="pair[0]" />
            </n-form-item>
            <n-form-item label="值" label-placement="left" label-width="80px" class="flex-1">
                <n-auto-complete v-model:value="pair[1]" :options="filteredSuggestions(pair[1])"
                    placeholder="如：{{ inputs.text }}" clearable />
            </n-form-item>
            <n-button type="error" size="small" @click="removeVariable(index)">删除</n-button>
        </div>
        <div class="flex gap-2 items-center">
            <n-button @click="addVariable" size="small" type="primary">新增变量</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NFormItem, NInput, NButton, NAutoComplete } from 'naive-ui'
import { useFlowStore } from '@/store/flow'
import { storeToRefs } from 'pinia'

const flowStore = useFlowStore()
const { variables, inputs } = storeToRefs(flowStore)
const flowVariables = variables
const flowInputs = inputs

const localPairs = ref<[string, string][]>(Object.entries(flowVariables.value))

watch(localPairs, (newPairs) => {
    const updated: Record<string, string> = {}
    newPairs.forEach(([k, v]) => {
        if (k) updated[k] = v
    })
    Object.keys(flowVariables.value).forEach(k => delete flowVariables.value[k])
    Object.assign(flowVariables.value, updated)
    console.log('Updated variables:', flowVariables.value)
}, { deep: true })

const suggestions = computed(() =>
    (flowInputs.value || []).map(input => `{{ inputs.${input.name} }}`)
)

function filteredSuggestions(value: string) {
    if (value?.includes('{')) {
        return suggestions.value
    }
    return []
}

function addVariable() {
    localPairs.value.push(['', ''])
}

function removeVariable(index: number) {
    localPairs.value.splice(index, 1)
}
</script>
