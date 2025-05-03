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

const props = defineProps<{
    variables: Record<string, string>
    inputs: { name: string }[]
}>()

const localPairs = ref<[string, string][]>(Object.entries(props.variables))

watch(localPairs, (newPairs) => {
    const updated: Record<string, string> = {}
    newPairs.forEach(([k, v]) => {
        if (k) updated[k] = v
    })
    Object.keys(props.variables).forEach(k => delete props.variables[k])
    Object.assign(props.variables, updated)
    console.log('Updated variables:', props.variables)
}, { deep: true })

const suggestions = computed(() =>
    (props.inputs || []).map(input => `{{ inputs.${input.name} }}`)
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
