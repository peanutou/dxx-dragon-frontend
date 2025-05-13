<template>
    <n-form :model="localData" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="localData.name" placeholder="请输入节点名称" />
        </n-form-item>
        <n-form-item label="文件 ID" path="file_id">
            <context-input v-model:modelValue="localData.file_id" type="text" placeholder="请输入文件 ID" />
        </n-form-item>
        <n-form-item label="文件密码" path="password">
            <n-input v-model:value="localData.password" placeholder="请输入文件密码" />
        </n-form-item>
        <n-form-item label="Sheet 名称" path="sheet_name">
            <n-input v-model:value="localData.sheet_name" placeholder="请输入 Sheet 名称" />
        </n-form-item>
        <n-form-item label="列提取规则" path="column_rules">
            <n-dynamic-input v-model:value="localData.column_rules" placeholder="添加列提取规则"
                :on-create="() => ({ source: '', target: '' })">
                <template #default="{ value }">
                    <div class="flex gap-2">
                        <n-input v-model:value="value.source" placeholder="标题位置" />
                        <n-input v-model:value="value.target" placeholder="目标变量名" />
                    </div>
                </template>
            </n-dynamic-input>
        </n-form-item>
        <n-form-item label="单元格提取（位置:变量）" path="cell_rules">
            <n-dynamic-input v-model:value="localData.cell_rules" placeholder="添加单元格提取项"
                :on-create="() => ({ source: '', target: '' })">
                <template #default="{ value }">
                    <div class="flex gap-2">
                        <n-input v-model:value="value.source" placeholder="单元格位置（如 B2）" />
                        <n-input v-model:value="value.target" placeholder="目标变量名" />
                    </div>
                </template>
            </n-dynamic-input>
        </n-form-item>
        <n-space vertical :size="12">
            <schema-input v-model:schema="localData.outputs_schema" link-text="输出 Schema (可选)"
                placeholder="请输入 JSON 示例数据" />
            <n-button type="primary" @click="submit">保存配置</n-button>
        </n-space>
    </n-form>
    <n-modal v-model:show="showModal" title="编辑聚合模板" preset="dialog" style="width: 800px">
        <context-input v-model:model-value="localData.template" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal = false">完成</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NForm, NFormItem, NInput, NDynamicInput, NModal, NButton } from 'naive-ui'
import type { Node } from '@vue-flow/core'
import ContextInput from '@/components/shared/ContextInput.vue'
import SchemaInput from '@/components/shared/SchemaInput.vue'

const props = defineProps<{
    node: Node
}>()

const localData = ref<any>({})
const showModal = ref(false)

watch(
    () => props.node.data,
    (newData) => {
        localData.value = {
            ...newData,
        }
    },
    { immediate: true, deep: true }
)

const emit = defineEmits<{
    (e: 'update:config', data: any): void
}>()


function submit() {
    try {
        emit('update:config', localData.value)
    } catch (e) {
        window.$message?.error?.('请检查模板 JSON 格式是否正确:')
    }
}

</script>