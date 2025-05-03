<template>
  <n-form label-placement="top" class="space-y-0">
    <n-form-item label="名称">
      <n-input v-model:value="localData.name" placeholder="请输入节点名称" />
    </n-form-item>

    <n-form-item label="正则表达式">
      <n-input v-model:value="localData.pattern" placeholder="请输入正则表达式" />
    </n-form-item>

    <n-form-item label="源变量名">
      <n-input v-model:value="localData.source_variable" placeholder="请输入源变量名称" />
    </n-form-item>

    <n-form-item label="返回类型">
      <n-select
        v-model:value="localData.return_type"
        :options="[
          { label: 'match', value: 'match' },
          { label: 'findall', value: 'findall' },
          { label: 'bool', value: 'bool' }
        ]"
        placeholder="请选择返回类型"
      />
    </n-form-item>

    <n-button type="primary" @click="submit">保存配置</n-button>
  </n-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NButton } from 'naive-ui'
import type { Node } from '@vue-flow/core'

const props = defineProps<{
  node: Node
}>()
const localData = ref<any>({})
watch(
    () => props.node.data,
    (newData) => {
        localData.value = { ...newData }
    },
    { immediate: true }
)

const emit = defineEmits<{
  (e: 'update', data: any): void
}>()

watch(() => props.node.data, (newData) => {
  localData.value = { ...newData }
})

function submit() {
  emit('update', localData.value)
}
</script>
