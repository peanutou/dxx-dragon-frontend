<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>
        <n-form-item label="触发模式">
            <n-input v-model:value="node.trigger" placeholder="触发模式" disabled />
        </n-form-item>
        <n-form-item label="方法">
            <n-input v-model:value="node.method" placeholder="方法" disabled />
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NInput, NSelect, NButton, NDynamicInput, NModal, NTag } from 'naive-ui'
import { ref, computed, watch } from 'vue'
const { node } = defineProps<{ node: Record<string, any> }>()

</script>

<style scoped>
.scroll-modal {
    max-height: 80vh;
    overflow-y: auto;
}
</style>