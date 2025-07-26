<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)" />
        </n-form-item>

        <n-form-item label="参数">
            <n-dynamic-input v-model:value="node.params" placeholder="请输入参数"
                :on-create="() => ({ name: '', value: '' })">
                <template #default="{ index, value }">
                    <n-space vertical class="w-full">
                        <n-input-group>
                            <n-input-group-label class="input-label">参数名</n-input-group-label>
                            <n-input v-model:value="value.name" placeholder="参数名称" />
                        </n-input-group>
                        <n-input-group>
                            <n-input-group-label class="input-label">参数值</n-input-group-label>
                            <data-input v-model:modelValue="value.value" placeholder="参数值" />
                        </n-input-group>
                    </n-space>
                </template>
            </n-dynamic-input>
        </n-form-item>

        <!-- Timeout设置 -->
        <n-form-item label="超时时间">
            <n-input-number v-model:value="node.timeout" :min="0.1" :max="60" :step="0.1"
                placeholder="执行超时时间（秒），系统默认为 5.0 秒" :default-value="5.0" class="w-full" />
        </n-form-item>

        <n-form-item label="Python 代码">
            <template #label>
                <div class="flex items-center justify-between w-full space-x-2">
                    <span>聚合输出模板</span>
                    <n-button size="tiny" @click="showModal = true" quaternary type="primary">
                        大窗编辑
                    </n-button>
                </div>
            </template>

            <monaco-editor v-model:modelValue="node.code" language="python" />
        </n-form-item>

    </n-form>
    <n-modal v-model:show="showModal" title="Python 代码" preset="dialog"
        style="width: 90vw; height: 90vh; display: flex; flex-direction: column;"
        :content-style="{ flex: 1, display: 'flex' }">
        <monaco-editor v-model:modelValue="node.code" language="python" style="height: 100%;" />
        <template #action>
            <n-button type="primary" @click="showModal = false">完成</n-button>
        </template>
    </n-modal>

</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    NForm, NSpace, NFormItem, NSelect, NModal,
    NInput, NDynamicInput, NInputGroup, NInputGroupLabel, NInputNumber,
    NDynamicTags, NCheckbox, NSwitch, NButton, NGrid, NGi, NText, NTooltip, NIcon
} from 'naive-ui'
import MonacoEditor from '@/components/shared/MonacoEditor.vue';
import DataInput from '@/components/shared/DataInput.vue';
interface PythonNodeConfig {
    id: string;
    name: string;
    code: string;
    timeout: number; 
    params: {
        name: string;
        value: any;
    }[];
    index?: number; // Add index property to fix the error
}
const { node } = defineProps<{ node: PythonNodeConfig }>()
const showModal = ref(false);

</script>

<style scoped>
/* 可选样式 */
.input-label {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 70px;
    font-weight: bold;
}
</style>