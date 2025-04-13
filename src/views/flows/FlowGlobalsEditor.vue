<template>
  <div class="pl-6 pt-2 p-4 space-y-" style="height: 100%; overflow-y: auto;">
    <h3 class="text-lg font-bold">全局输入配置</h3>
    <FlowInputEditor :inputs="inputs" @update="updateInputs" />

    <h3 class="text-lg font-bold">变量映射配置</h3>
    <FlowVariableEditor :variables="variables" :inputs="inputs" @update="updateVariables" />
  </div>
</template>

<script setup lang="ts">
import FlowInputEditor from './FlowInputEditor.vue'
import FlowVariableEditor from './FlowVariableEditor.vue'

const props = defineProps<{
  inputs: any[]
  variables: Record<string, string>
}>()

const emit = defineEmits(['update:inputs', 'update:variables'])

const updateInputs = (val: any[]) => emit('update:inputs', val)
const updateVariables = (val: Record<string, string>) => emit('update:variables', val)
</script>
