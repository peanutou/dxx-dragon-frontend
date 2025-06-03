<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称" :required="true">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)" />
        </n-form-item>

        <n-form-item label="循环变量" :required="true">
            <data-input v-model:modelValue="node.loop_variable" placeholder="请输入循环变量" />
        </n-form-item>

        <n-form-item label="当前变量" :required="true">
            <n-select v-model:value="node.current_variable"
                :options="variables.map(v => ({ label: v.name, value: v.name }))" placeholder="请选择当前变量" clearable />
        </n-form-item>

        <n-form-item label="开始节点" :required="true">
            <n-select v-model:value="node.start_node"
                :options="childrenNodes.map(n => ({ label: n.data.name, value: n.id }))" placeholder="请选择开始节点"
                clearable />
        </n-form-item>

        <n-form-item label="数据节点" :required="true">
            <n-select v-model:value="node.data_node"
                :options="childrenNodes.map(n => ({ label: n.data.name, value: n.id }))" placeholder="请选择数据节点"
                clearable />
        </n-form-item>

        <n-form-item label="是否并行执行">
            <n-select :value="String(node.parallel)" @update:value="val => node.parallel = val === 'true'" :options="[
                { label: '是', value: 'true' },
                { label: '否', value: 'false' },
            ]" placeholder="请选择是否并行执行" />
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect } from 'naive-ui'
import DataInput from '@/components/shared/DataInput.vue';
import { useFlowStore } from '@/store/flow';
import { computed } from 'vue';
const { nodes, selectedNode, variables } = useFlowStore()
// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()

const childrenNodes = computed(() => {
    return nodes.filter(n => n.parentNode === selectedNode?.id);
});

</script>

<style scoped></style>