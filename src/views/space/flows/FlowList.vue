<template>
    <!-- 快速创建流程模态框 -->
    <n-modal v-model:show="showCreateModal" title="创建流程" preset="dialog">
        <n-form :model="createForm" ref="formRef" label-width="80">
            <n-form-item label="名称" path="name" :rule="nameRules">
                <n-input v-model:value="createForm.name" placeholder="请输入流程名称" />
            </n-form-item>
            <n-form-item label="描述" path="description">
                <n-input v-model:value="createForm.description" type="textarea" placeholder="流程描述（可选）" />
            </n-form-item>
            <n-form-item label="版本" path="version">
                <n-input v-model:value="createForm.version" placeholder="由后台初始化" disabled />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button @click="showCreateModal = false">取消</n-button>
            <n-button type="primary" @click="submitCreate">创建</n-button>
        </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" title="编辑流程" preset="dialog">
        <n-form :model="editForm" label-width="80">
            <n-form-item label="名称" path="name" :rule="nameRules">
                <n-input v-model:value="editForm.name" />
            </n-form-item>
            <n-form-item label="描述">
                <n-input v-model:value="editForm.description" type="textarea" />
            </n-form-item>
            <n-form-item label="状态">
                <n-select v-model:value="editForm.status" :options="statusOptions" placeholder="请选择状态" />
            </n-form-item>
            <n-form-item label="版本">
                <n-input v-model:value="editForm.version" disabled />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button type="primary" @click="submitEdit">保存</n-button>
        </template>
    </n-modal>
    <n-modal v-model:show="showRunnerModal" preset="card" title="流程测试" style="width: 100vw; height: 100vh;"
        :content-style="{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }">
        <FlowRunner :flow-id="currentFlowId" :test-mode="false" />
    </n-modal>
    <n-card title="流程列表">
        <div class="mb-4 flex justify-between items-center">
            <n-space>
                <n-button type="primary" @click="showCreateModal = true">创建流程</n-button>
                <n-button type="error" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
                    删除选中流程
                </n-button>
            </n-space>
        </div>
        <n-data-table :columns="columns" :data="flows" :loading="loading" :pagination="pagination" remote
            :row-key="(row: Flow) => row.flow_id" v-model:checked-row-keys="selectedRowKeys"
            @update:sorter="handleSorterChange" />
    </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDataTable, NButton, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NTooltip, NTag } from 'naive-ui'
import FlowRunner from '@/views/space/flows/FlowRunner.vue'
import type { DataTableColumns } from 'naive-ui'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'

interface Flow {
    flow_id: string
    name: string
    description: string
    version: string
    created_at: string
    status: string
    client_key: string
    current: {
        version: string
        publish_at: string
    }
}

const router = useRouter()
const flows = ref<Flow[]>([])
const loading = ref(false)
const sortColumn = ref<string | null>(null)
const sortOrder = ref<'ascend' | 'descend' | null>(null)
const showRunnerModal = ref(false)
const currentFlowId = ref<string>('')

const pagination = ref({
    pageSize: 10,
    page: 1,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onUpdatePageSize: (size: number) => {
        pagination.value.pageSize = size
        pagination.value.page = 1
        fetchFlows()
    },
    onChange: (currentPage: number) => {
        pagination.value.page = currentPage
        fetchFlows()
    }
})

const statusOptions = [
    { label: '已启动', value: 'started' },
    { label: '已停止', value: 'stopped' },
]

const columns: DataTableColumns<Flow> = [
    {
        type: 'selection',
        multiple: true
    },
    {
        title: '流程',
        key: 'name',
        sorter: true,
        render: (row) => {
            return h('div', [
                h('div', {
                    style: {
                        fontWeight: 'bold',
                        color: '#18a058',
                        cursor: 'pointer'
                    },
                    onClick: () => {
                        editForm.value = { ...row }
                        showEditModal.value = true
                    }
                }, row.name),
                h('div', {
                    style: {
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '4px',
                        maxWidth: '240px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }
                }, row.description || '—')
            ])
        }
    },
    {
        title: '操作',
        key: 'action',
        render: (row) =>
            h(
                'div',
                [
                    h(
                        'a',
                        {
                            href: 'javascript:void(0)',
                            onClick: () => router.push({ name: 'FlowEditor', params: { id: row.flow_id } }),
                            style: { color: '#2080f0', cursor: 'pointer', marginRight: '12px' }
                        },
                        '编辑'
                    ),
                    h(
                        'a',
                        {
                            href: 'javascript:void(0)',
                            onClick: () => {
                                currentFlowId.value = row.flow_id
                                showRunnerModal.value = true
                            },
                            style: { color: '#2080f0', cursor: 'pointer' }
                        },
                        '运行'
                    )
                ]
            )
    },
    {
        title: '状态',
        key: 'status',
        render: (row) => {
            const match = statusOptions.find(opt => opt.value === row.status)
            const type = row.status === 'started'
                ? 'success'
                : row.status === 'stoped'
                    ? 'default'
                    : row.status === 'error'
                        ? 'error'
                        : 'warning'
            return h(
                NTag,
                { type, size: 'small' },
                { default: () => (match ? match.label : row.status || '-') }
            )
        }
    },
    {
        title: '编辑版本',
        key: 'version',
        sorter: true
    },
    {
        title: '运行版本',
        key: 'running_version',
        render: (row) => {
            return h('div', [
                h(NTooltip, { trigger: 'hover', placement: 'top' }, {
                    trigger: () => h('span', row.current.version || '—'),
                    default: () => h('div', {
                        style: {
                            display: 'flex',
                            flexDirection: 'column',
                        }
                    }, [
                        h('span', `当前版本：${row.current.version || '—'}`),
                        h('span', `发布日期：${row.current.publish_at || '—'}`),
                    ])
                })
            ])
        }
    },
    {
        title: 'ID',
        key: 'flow_id',
        render: (row) => {
            return h('div', { class: 'flex items-center space-x-2' }, [
                h(
                    NButton,
                    {
                        size: 'tiny',
                        type: 'primary',
                        secondary: true,
                        disabled: !row.flow_id,
                        onClick: () => {
                            if (row.flow_id) {
                                navigator.clipboard.writeText(row.flow_id)
                            }
                        }
                    },
                    { default: () => '复制' }
                )
            ])
        }
    },
    {
        title: 'Client Key',
        key: 'client_key',
        render: (row) => {
            return h('div', { class: 'flex items-center space-x-2' }, [
                h(
                    NButton,
                    {
                        size: 'tiny',
                        type: 'primary',
                        secondary: true,
                        disabled: !row.client_key,
                        onClick: () => {
                            if (row.client_key) {
                                navigator.clipboard.writeText(row.client_key)
                            }
                        }
                    },
                    { default: () => '复制' }
                )
            ])
        }
    },
    {
        title: '创建时间',
        key: 'created_at',
        sorter: true,
        render: (row) => {
            const date = new Date(row.created_at)
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
    }
]

const fetchFlows = async () => {
    loading.value = true
    try {
        const res = await axios.get(TenantSpaceAPI.flows.list, {
            params: {
                page: pagination.value.page,
                size: pagination.value.pageSize,
                sort_by: sortColumn.value,
                order: sortOrder.value === 'ascend' ? 'asc' : sortOrder.value === 'descend' ? 'desc' : undefined
            }
        })
        flows.value = res.data.data?.flows || []
        pagination.value.itemCount = res.data.data?.total || 0
    } catch (err) {
        console.error('获取流程失败:', err)
    } finally {
        loading.value = false
    }
}

const handleSorterChange = (sorter: any) => {
    if (sorter === null) {
        sortColumn.value = null
        sortOrder.value = null
    } else {
        sortColumn.value = sorter.columnKey
        sortOrder.value = sorter.order
    }
    fetchFlows()
}

const showCreateModal = ref(false)
const showEditModal = ref(false)
const formRef = ref()
const createForm = ref({
    name: '',
    description: '',
    version: ''
})
const editForm = ref<Flow>({
    flow_id: '',
    name: '',
    description: '',
    version: '',
    created_at: '',
    status: '',
    client_key: '',
    current: {
        version: '',
        publish_at: ''
    }
})

const selectedRowKeys = ref<string[]>([])

const nameRules = [
    {
        required: true,
        validator: (rule: any, value: string) => {
            if (value.length < 3) return new Error('名称不能少于 3 个字符')
            if (/\s/.test(value)) return new Error('名称不能包含空格')
            if (!/^[\u4e00-\u9fa5a-zA-Z_-][\u4e00-\u9fa5a-zA-Z0-9_-]*$/.test(value)) return new Error('名称只能包含中英文字符、数字、下划线和短横线，且不能以数字开头')
            return true
        },
        trigger: ['input', 'blur']
    }
]

const handleBatchDelete = async () => {
    try {
        await Promise.all(
            selectedRowKeys.value.map(id =>
                axios.delete(TenantSpaceAPI.flows.delete(id))
            )
        )
        selectedRowKeys.value = []
        fetchFlows()
    } catch (err) {
        console.error('删除流程失败:', err)
    }
}

const submitCreate = async () => {
    try {
        await axios.post(TenantSpaceAPI.flows.create, {
            name: createForm.value.name,
            description: createForm.value.description,
            version: createForm.value.version
        })
        createForm.value = { name: '', description: '', version: '1.0' }
        showCreateModal.value = false
        fetchFlows()
    } catch (err) {
        console.error('创建流程失败:', err)
    }
}

const submitEdit = async () => {
    try {
        await axios.put(TenantSpaceAPI.flows.update(editForm.value.flow_id), {
            name: editForm.value.name,
            status: editForm.value.status,
            description: editForm.value.description,
            version: editForm.value.version
        })
        showEditModal.value = false
        fetchFlows()
    } catch (err) {
        console.error('更新流程失败:', err)
    }
}

onMounted(() => {
    fetchFlows()
})
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1rem;
}
</style>