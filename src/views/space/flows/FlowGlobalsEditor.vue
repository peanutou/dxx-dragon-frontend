<template>
    <div class="pl-6 pt-2 p-4 space-y-" style="height: 100%; overflow-y: auto;">
        <h3 class="text-lg mb-4 font-bold bg-gray-800 p-2">Inputs 设置</h3>
        <FlowFieldEditor class="mb-2" :object="flowStore" fieldName="inputs" fieldType="inputs" />
        <h3 class="text-lg mb-4 font-bold bg-gray-800 p-2">Variables 设置</h3>
        <FlowFieldEditor class="mb-2" :object="flowStore" fieldName="variables" fieldType="variables" />
        <h3 class="text-lg mb-4 font-bold bg-gray-800 p-2">Outputs 结构</h3>
        <FlowOutputEditor class="mb-2" />
    </div>
</template>

<script setup lang="ts">
import FlowFieldEditor from './FlowFieldEditor.vue'
import FlowOutputEditor from './FlowOutputEditor.vue'
import { storeToRefs } from 'pinia'
import { useFlowStore } from '@/store/flow'
const flowStore = useFlowStore()
const { inputs: flowInputs, variables: flowVariables } = storeToRefs(flowStore)
</script>
