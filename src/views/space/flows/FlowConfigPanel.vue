<template>
    <n-form :model="flowEntity"
            label-width="80"
            class="space-y-0 pt-4 h-full overflow-y-auto">
        <n-form-item label="名称">
            <n-input :value="flowEntity.name"
                     placeholder="流程名称"
                     disabled />
        </n-form-item>
        <n-form-item label="描述">
            <n-input :value="flowEntity.description"
                     type="textarea"
                     placeholder="请输入流程描述"
                     disabled />
        </n-form-item>
        <n-form-item label="Flow ID">
            <n-input-group>
                <n-input :value="flowEntity.flow_id"
                         placeholder="流程 ID"
                         disabled />
                <n-button type="primary"
                          class="ml-2"
                          @click="copyToClipboard(flowEntity.flow_id)">
                    复制
                </n-button>
            </n-input-group>
        </n-form-item>

        <!-- Headers -->
        <n-divider title-placement="center"
                   style="margin-top: 0px; font-size: 12px;">当前版本</n-divider>

        <n-form-item label="Client Key">
            <template #label>
                <n-space horizontal
                         align="center">
                    <div>Client Key</div>
                    <n-button type="primary"
                              class="ml-4"
                              @click="refreshClientKey"
                              text>重新生成</n-button>
                </n-space>
            </template>
            <n-input-group>
                <n-input :value="flowEntity.client_key"
                         placeholder="Client Key"
                         disabled
                         type="password" />
                <n-button type="primary"
                          class="ml-2"
                          @click="copyToClipboard(flowEntity.client_key)">
                    复制
                </n-button>
            </n-input-group>
        </n-form-item>
        <!-- Rule: if flowEntity.status !== started, display error message -->
        <n-form-item label="Endpoint">
            <n-input-group>
                <n-input-group-label>POST</n-input-group-label>
                <n-input :value="flowEndpoint"
                         placeholder="Endpoint"
                         disabled />
                <n-button type="primary"
                          class="ml-2"
                          @click="copyToClipboard(flowEndpoint)"
                          :disabled="flowEntity.status !== 'started'">
                    复制
                </n-button>
            </n-input-group>
        </n-form-item>
        <n-form-item label="Client OpenAPI Schema">
            <template #label>
                <n-space horizontal
                         align="center">
                    <div>OpenAPI Schema</div>
                    <n-button type="primary"
                              class="ml-4"
                              @click="getFlowOpenApi"
                              text>重新生成</n-button>
                </n-space>
            </template>
            <n-space vertical
                     class="w-full">
                <n-input-group>
                    <n-input-group-label>JSON</n-input-group-label>
                    <n-input :value="flowOpenApi.json"
                             placeholder="OpenAPI Schema"
                             disabled />
                    <n-button type="primary"
                              class="ml-2"
                              @click="copyToClipboard(flowOpenApi.json)">
                        复制
                    </n-button>
                </n-input-group>
                <n-input-group>
                    <n-input-group-label>YAML</n-input-group-label>
                    <n-input :value="flowOpenApi.yaml"
                             placeholder="OpenAPI Schema"
                             disabled />
                    <n-button type="primary"
                              class="ml-2"
                              @click="copyToClipboard(flowOpenApi.yaml)">
                        复制
                    </n-button>
                </n-input-group>
            </n-space>
        </n-form-item>
        <n-form-item label="Client Function Call Schema">
            <template #label>
                <n-space horizontal
                         align="center">
                    <div>Function Call Schema</div>
                    <n-button type="primary"
                              class="ml-4"
                              @click="getFlowFunctionCall"
                              text>重新生成</n-button>
                </n-space>
            </template>
            <n-space vertical
                     class="w-full">
                <n-input-group>
                    <n-input-group-label>JSON</n-input-group-label>
                    <n-input :value="flowFunctionCall.json"
                             placeholder="请输入 Function Call Schema"
                             disabled />
                    <n-button type="primary"
                              class="ml-2"
                              @click="copyToClipboard(flowFunctionCall.json)">
                        复制
                    </n-button>
                </n-input-group>
            </n-space>
        </n-form-item>
    </n-form>
</template>

<script setup lang="ts">
import { useFlowStore } from '@/store/flow';
import { onMounted, ref } from 'vue';
import { NInput, NForm, NFormItem, NDivider, NInputGroup, NInputGroupLabel, NSpace, NButton } from 'naive-ui';
import axios from '@/utils/axios';
import { TenantSpaceAPI } from '@/apis/endpoints';

const flowStore = useFlowStore();
const { flowEntity, nodes, inputs, outputs, variables } = flowStore;
const flowEndpoint = ref('');
const flowOpenApi = ref({
    json: '',
    yaml: ''
});
const flowFunctionCall = ref({
    json: ''
});

onMounted(() => {
    if (flowEntity && flowEntity.status === 'started') {

        axios.get(TenantSpaceAPI.flows.endpoint(flowEntity.flow_id))
            .then(response => {
                flowEndpoint.value = response.data.data;
            })
            .catch(error => {
                // console.error('Error fetching flow entity:', error);
            });
    }
});

const refreshClientKey = async () => {
    await axios.post(TenantSpaceAPI.flows.refreshClientKey(flowEntity.flow_id))
        .then(response => {
            flowEntity.client_key = response.data.data;
        })
        .catch(error => {
            console.error('Error refreshing client key:', error);
        });
};

const getFlowOpenApi = async () => {
    await axios.get(TenantSpaceAPI.flows.openapi(flowEntity.flow_id, 'json'))
        .then(response => {
            flowOpenApi.value.json = response.data.data;
        })
        .catch(error => {
            console.error('Error fetching flow OpenAPI:', error);
            window.$message.error(error.response.data.data.error_message);
        });
    await axios.get(TenantSpaceAPI.flows.openapi(flowEntity.flow_id, 'yaml'))
        .then(response => {
            flowOpenApi.value.yaml = response.data.data;
        })
        .catch(error => {
            console.error('Error fetching flow OpenAPI:', error);
            window.$message.error(error.response.data.data.error_message);
        });
};

const getFlowFunctionCall = async () => {
    await axios.get(TenantSpaceAPI.flows.functionCall(flowEntity.flow_id))
        .then(response => {
            flowFunctionCall.value.json = response.data.data;
        })
        .catch(error => {
            console.error('Error fetching flow function call schema:', error);
            window.$message.error(error.response.data.data.error_message);
        });
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard:', text);
    }).catch(err => {
        console.error('Error copying text to clipboard:', err);
    });
};
</script>