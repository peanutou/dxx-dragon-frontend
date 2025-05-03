<template>
    <div class="pl-6 pt-2 p-4 space-y-" style="height: 100%; overflow-y: auto;">
        <h3 class="text-lg font-bold">全局输入配置</h3>
        <FlowInputEditor :inputs="inputs" />

        <h3 class="text-lg font-bold">变量映射配置</h3>
        <FlowVariableEditor :variables="variables" :inputs="inputs" />
    </div>
</template>

<script setup lang="ts">
import FlowInputEditor from './FlowInputEditor.vue'
import FlowVariableEditor from './FlowVariableEditor.vue'

const props = defineProps<{
    inputs: any[]
    variables: Record<string, string>
}>()

</script>
