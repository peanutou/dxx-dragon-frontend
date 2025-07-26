<template>
    <n-split :max="0.8" :min="0.2" :default-size="0.3" class="h-full" style="height: 100%;">
        <template #1>
            <n-card title="流程运行列表" class="p-4"
                style="height: 100%; max-height: 100%; display: flex; flex-direction: column;">
                <n-data-table :columns="columns" :data="flowRuns" :row-key="rowKey" :loading="loading"
                    max-height="calc(100vh - 300px)" virtual-scroll />
                <template #action>
                    <n-button class="mt-4" @click="loadMore" :loading="loading">加载更多</n-button>
                </template>
            </n-card>
        </template>
        <template #2>
            <result-preview v-if="currentFlowRunResult" :result="currentFlowRunResult" :result-path="'root'" />
        </template>
    </n-split>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { NDataTable, NButton, DataTableColumns, DataTableColumn, NCard, NTag, NSplit } from 'naive-ui';
import request from '@/utils/axios'
import { useRoute } from 'vue-router';
import { useFlowStore } from '@/store/flow';
import { TenantSpaceAPI } from '@/apis/endpoints';
import ResultPreview from '@/components/nodes/test-run/ResultPreview.vue';
const flowId = useRoute().params.id;
const flowStore = useFlowStore();
interface FlowRunEntity {
    config_path: string;
    flow_id: string;
    flow_run_id: string;
    flow_version: string;
    publish_at: string;
    publish_by: string;
    result_path: string;
    run_by: string;
    run_mode: string;
    duration: number;
    start_time: string;
    end_time: string;
    status: 'success' | 'failed';
    tenant_id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
}
const flowRuns = ref<FlowRunEntity[]>([]);
const currentFlowRunResult = ref<string | null>(null);
const rowKey = (row: FlowRunEntity) => row.flow_run_id;
const selectedRowKeys = ref<string[]>([]);
const loading = ref(false);
const loadMore = () => {
    if (loading.value) return;
    loading.value = true;
    fetchFlowRuns(flowId as string, Math.ceil(flowRuns.value.length / 10) + 1).finally(() => {
        loading.value = false;
    });
};
const columns: DataTableColumns<FlowRunEntity> = [
    {
        title: '运行 ID',
        key: 'flow_run_id',
        ellipsis: {
            tooltip: true
        },
        render: (row) => {
            return h(
                NButton,
                {
                    size: 'tiny',
                    type: 'primary',
                    text: true,
                    onClick: () => {
                        fetchRunResult(flowId as string, row.flow_run_id).then(result => {
                            currentFlowRunResult.value = JSON.stringify(result, null, 4);
                            selectedRowKeys.value = [row.flow_run_id];
                        }).catch(err => {
                            console.error('Error fetching run result:', err);
                        });
                    }
                },
                {
                    default: () => {
                        return h('div', {
                            class: 'flex flex-col items-start space-x-2',
                        }, [
                            h('div', { class: 'max-w-100 overflow-hidden text-ellipsis whitespace-nowrap' }, row.flow_run_id),
                            h('div', {
                                class: 'gap-1 flex items-center',
                            }, [
                                h(NTag, { class: 'text-gray-500' }, row.flow_version),
                                h(NTag, { class: 'text-gray-500', type: row.run_mode === 'flow-prod' ? 'info' : 'warning' }, row.run_mode)
                            ])
                        ]);
                    }
                }
            );
        }
    },
    {
        title: '开始时间',
        key: 'start_time',
        width: '100px',
        render: (row) => {
            const date = new Date(row.start_time)
            return h('div', [
                h('div', date.toLocaleDateString()),
                h('div', {
                    style: {
                        fontSize: '12px',
                        color: '#888'
                    }
                }, date.toLocaleTimeString())
            ])
        }
    },
    {
        title: '运行时长',
        key: 'duration',
        width: '100px',
        render: (row) => {
            const seconds = row.duration || 0;
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const pad = (n: number) => Math.ceil(n).toString().padStart(2, '0');
            return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
        }
    },
    {
        title: '状态',
        key: 'status',
        width: '80px',
        render: (row) => {
            if (row.status === 'success') {
                return h(NTag, { type: 'success' }, { default: () => '成功' });
            }
            if (row.status === 'failed') {
                return h(NTag, { type: 'error' }, { default: () => '失败' });
            }
            // 默认状态处理
            return h(NTag, { type: 'warning' }, { default: () => '未知' });
        }
    }
];

onMounted(() => {
    if (flowId) {
        loadMore();
    }
});

const fetchFlowRuns = async (flowId: string, page: number) => {
    const response = await request.get(TenantSpaceAPI.flows.runs(flowId, page, 10, 'created_at', 'desc', true));
    if (response.data && response.data.data.flow_runs) {
        flowRuns.value = [...flowRuns.value, ...response.data.data.flow_runs];
    } else {
        flowRuns.value = [];
    }
};

const fetchRunResult = async (flowId: string, runId: string) => {
    const response = await request.get(TenantSpaceAPI.flows.runResult(flowId, runId));
    return response.data.data;
};

</script>

<style scoped></style>