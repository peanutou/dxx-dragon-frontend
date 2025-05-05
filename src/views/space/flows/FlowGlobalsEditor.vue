<template>
    <div class="pl-6 pt-2 p-4 space-y-" style="height: 100%; overflow-y: auto;">
        <h3 class="text-lg font-bold">全局输入配置</h3>
        <FlowInputEditor :inputs="flowInputs" />

        <h3 class="text-lg font-bold">变量映射配置</h3>
        <FlowVariableEditor :variables="flowVariables" :inputs="flowInputs" />
    </div>
</template>

<script setup lang="ts">
import FlowInputEditor from './FlowInputEditor.vue'
import FlowVariableEditor from './FlowVariableEditor.vue'
import { useFlowStore } from '@/store/flow'
import { storeToRefs } from 'pinia'

const flowStore = useFlowStore()
const { flowInputs, flowVariables } = storeToRefs(flowStore)

</script>
