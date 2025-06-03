<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)" />
        </n-form-item>
        <n-form-item label="文件 ID" path="file_id">
            <context-input v-model:modelValue="node.file_id" type="text" placeholder="请输入文件 ID" />
        </n-form-item>
        <n-form-item label="文件密码" path="password">
            <n-input v-model:value="node.password" placeholder="请输入文件密码" />
        </n-form-item>
        <n-form-item label="Sheet 名称" path="sheet_name">
            <n-input v-model:value="node.sheet_name" placeholder="请输入 Sheet 名称" />
        </n-form-item>
        <n-form-item label="列提取规则" path="column_rules">
            <n-dynamic-input v-model:value="node.column_rules" placeholder="添加列提取规则"
                :on-create="() => ({ source: '', target: '' })">
                <template #default="{ value }">
                    <div class="flex gap-2">
                        <n-input v-model:value="value.source" placeholder="标题位置" />
                        <n-input v-model:value="value.target" placeholder="目标变量名"
                            :allow-input="val => !/\s/.test(val)" />
                    </div>
                </template>
            </n-dynamic-input>
        </n-form-item>
        <n-form-item label="单元格提取（位置:变量）" path="cell_rules">
            <n-dynamic-input v-model:value="node.cell_rules" placeholder="添加单元格提取项"
                :on-create="() => ({ source: '', target: '' })">
                <template #default="{ value }">
                    <div class="flex gap-2">
                        <n-input v-model:value="value.source" placeholder="单元格位置（如 B2）" />
                        <n-input v-model:value="value.target" placeholder="目标变量名" />
                    </div>
                </template>
            </n-dynamic-input>
        </n-form-item>
    </n-form>
    <n-modal v-model:show="showModal" title="编辑聚合模板" preset="dialog" style="width: 800px">
        <context-input v-model:model-value="node.template" type="textarea" autosize style="min-height: 300px" />
        <template #action>
            <n-button type="primary" @click="showModal = false">完成</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NForm, NFormItem, NInput, NDynamicInput, NModal } from 'naive-ui'
import ContextInput from '@/components/shared/ContextInput.vue'
import SchemaInput from '@/components/shared/SchemaInput.vue'

// Destructure node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()
const showModal = ref(false)
</script>