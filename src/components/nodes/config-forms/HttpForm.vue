<template>
    <n-form label-placement="top" class="space-y-0">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)"/>
        </n-form-item>

        <n-form-item label="请求方法">
            <n-select v-model:value="node.method" :options="[
                { label: 'GET', value: 'GET' },
                { label: 'POST', value: 'POST' }
            ]" placeholder="请选择 HTTP 方法" />
        </n-form-item>

        <n-form-item label="请求地址">
            <n-input v-model:value="node.url" placeholder="如：https://api.example.com" />
        </n-form-item>

        <!-- Headers -->
        <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">Headers</n-divider>

        <n-form-item label="授权类型">
            <n-select v-model:value="node.authorization" :options="[
                { label: '-', value: '' },
                { label: 'Bearer Token', value: 'Bearer' },
                { label: 'Basic Auth', value: 'Basic' }
            ]" placeholder="请选择授权类型" />
        </n-form-item>

        <n-form-item v-if="node.authorization === 'Bearer'" label="Bearer Token">
            <n-input-group>
                <n-input v-model:value="node.token" placeholder="请输入 Bearer Token" :type="tokenDisplayType" />
                <n-button type="primary" class="ml-2"
                    @click="tokenDisplayType = tokenDisplayType === 'text' ? 'password' : 'text'">
                    {{ tokenDisplayType === 'text' ? '隐藏' : '显示' }}
                </n-button>
            </n-input-group>
        </n-form-item>

        <n-form-item v-if="node.authorization === 'Basic'" label="Basic Auth">
            <n-space vertical class="w-full">
                <n-input-group>
                    <n-input-group-label class="w-[75px]">用户名</n-input-group-label>
                    <n-input v-model:value="node.username" placeholder="用户名" />
                </n-input-group>
                <n-input-group>
                    <n-input-group-label class="w-[75px]">密码</n-input-group-label>
                    <n-input v-model:value="node.password" placeholder="密码" :type="passwordDisplayType" />
                    <n-button type="primary" class="ml-2"
                        @click="passwordDisplayType = passwordDisplayType === 'text' ? 'password' : 'text'">
                        {{ passwordDisplayType === 'text' ? '隐藏' : '显示' }}
                    </n-button>
                </n-input-group>
            </n-space>
        </n-form-item>

        <n-form-item label="Headers">
            <n-dynamic-input v-model:value="node.headers" :on-create="() => ({ key: '', value: '' })">
                <template #default="{ value }">
                    <div style="display: flex; gap: 8px; flex-direction: column; width: 100%;">
                        <n-input-group>
                            <n-input-group-label class="w-[70px]">Key</n-input-group-label>
                            <n-input v-model:value="value.key" placeholder="Header Key" />
                        </n-input-group>
                        <n-input-group>
                            <n-input-group-label class="w-[70px]">Value</n-input-group-label>
                            <n-input v-model:value="value.value" placeholder="Header Value" />
                        </n-input-group>
                    </div>
                </template>
            </n-dynamic-input>
        </n-form-item>

        <!-- Body -->
        <n-divider title-placement="center" style="margin-top: 0px; font-size: 12px;">Body</n-divider>

        <!-- Body Type: json or raw, default is json -->
        <n-form-item label="Body Type">
            <n-select v-model:value="node.bodyType" :options="[
                { label: 'JSON', value: 'json' },
                { label: 'Raw', value: 'raw' }
            ]" placeholder="请选择 Body 类型" />
        </n-form-item>

        <n-form-item v-if="node.method === 'POST'" label="Body">
            <template #label>
                <n-space horizontal align="center">
                    <div>Body</div>
                    <n-button type="primary" class="ml-4" @click="getBodyFields" text>获取字段</n-button>
                </n-space>
            </template>
            <n-dynamic-input v-if="node.bodyType === 'json'" v-model:value="node.body"
                :on-create="() => ({ key: '', value: '' })">
                <template #default="{ value }">
                    <div style="display: flex; gap: 8px; flex-direction: column; width: 100%;">
                        <n-input-group>
                            <n-input-group-label class="w-[70px]">Key</n-input-group-label>
                            <n-input v-model:value="value.key" placeholder="Body Key" />
                        </n-input-group>
                        <n-input-group>
                            <n-input-group-label class="w-[70px]">Value</n-input-group-label>
                            <!-- <n-input v-model:value="value.value" placeholder="Body Value" /> -->
                            <context-input v-model:modelValue="value.value" placeholder="Body Value" type="textarea"/>
                        </n-input-group>
                    </div>
                </template>
            </n-dynamic-input>
            <n-input v-else-if="node.bodyType === 'raw'" v-model:value="node.bodyRaw" type="textarea"
                placeholder="请输入请求体内容" />
        </n-form-item>


    </n-form>
</template>

<script setup lang="ts">
import { ref, watch, Ref } from 'vue'
import { NForm, NFormItem, NDivider, NInput, NSelect, NInputGroup, NInputGroupLabel, NButton, NDynamicInput } from 'naive-ui'
import axios from '@/utils/axios';
import ContextInput from '@/components/shared/ContextInput.vue';

// Destructure the node prop for direct binding
const { node } = defineProps<{ node: Record<string, any> }>()
// JSON text for headers (array) and body, synchronized via watch
const tokenDisplayType: Ref<'text' | 'password'> = ref('password')
const passwordDisplayType: Ref<'text' | 'password'> = ref('password')
const flowFunctionCall = ref<{ json: { 
    name: string,
    description: string,
    parameters: { 
        type: string,
        properties: Record<string, any>
    },
    required?: string[],
    additionalProperties?: boolean
} }>({
    json: {
        name: '',
        description: '',
        parameters: {
            type: 'object',
            properties: {}
        }
    }
});

async function getBodyFields() {
    if (!node.url) {
        window.$message.error('请先填写请求地址')
        return
    }
    await axios.get(`${node.url}/function-call`, {
        headers: {
            Authorization: `Bearer ${node.token}`
        }
    }).then(response => {
        try {
            response.data.data = JSON.parse(response.data.data);
        } catch (e) {
            console.error('Error parsing function call schema:', e);
            window.$message.error('获取函数调用字段失败，请检查返回数据格式');
            return;
        }
        flowFunctionCall.value.json = response.data.data;
        const bodyFields = Object.entries(flowFunctionCall.value.json.parameters.properties).map(([key, value]) => ({
            key,
            value: `:${value.type} - ${value.description || ''}`
        }));
        bodyFields.forEach(field => {
            if (!node.body.some((item: any) => item.key === field.key)) {
                node.body.push(field);
            }
        });
    }).catch(error => {
        console.error('Error fetching flow function call schema:', error);
        window.$message.error(error.response.data.data.error_message);
    });
}
</script>
