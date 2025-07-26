<template>
    <n-card title="流程列表">
        <div class="mb-4 flex justify-between items-center">
            <n-space>
                <n-button type="error" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
                    删除选中流程
                </n-button>
            </n-space>
        </div>
        <n-data-table :columns="columns" :data="files" :loading="loading" :pagination="pagination" remote
            :row-key="(row: FileEntity) => row.file_id" v-model:checked-row-keys="selectedRowKeys"
            @update:sorter="handleSorterChange" />
    </n-card>
</template>

<script setup lang="ts">
import { ref, computed, h, onMounted } from 'vue'
import { NDataTable, NButton } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'

interface FileEntity {
    tenant_id: string
    file_id: string
    user_id: string
    file_name: string
    file_size: number
    file_type?: string
    path: string
    created_at?: string
    created_by?: string
    updated_at?: string
    updated_by?: string
}

const files = ref<FileEntity[]>([])

const selectedRowKeys = ref<string[]>([])
const columns: DataTableColumns<FileEntity> = [
    {
        type: 'selection',
        multiple: true
    },
    {
        title: '文件名称',
        key: 'file_name',
        sorter: true,
        width: 300,
    },
    {
        title: 'ID',
        key: 'file_id',
        render: (row) => {
            return h('div', { class: 'flex items-center space-x-2' }, [
                h(
                    NButton,
                    {
                        size: 'tiny',
                        type: 'primary',
                        secondary: true,
                        disabled: !row.file_id,
                        onClick: () => {
                            if (row.file_id) {
                                navigator.clipboard.writeText(row.file_id)
                            }
                        }
                    },
                    { default: () => '复制' }
                )
            ])
        }
    },
    {
        title: '操作',
        key: 'actions',
        render: (row) =>
            h(
                'div',
                [
                    h(
                        'a',
                        {
                            href: 'javascript:void(0)',
                            onClick: () => handleFileDownload(row),
                            style: { color: '#2080f0', cursor: 'pointer', marginRight: '12px' }
                        },
                        '下载'
                    ),
                ]
            )
    },
    {
        title: '文件大小',
        key: 'file_size',
        sorter: true,
        render: (row) => {
            const size = row.file_size
            if (size >= 1024 * 1024 * 1024) {
                return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
            } else if (size >= 1024 * 1024) {
                return (size / (1024 * 1024)).toFixed(2) + ' MB'
            } else {
                return (size / 1024).toFixed(2) + ' KB'
            }
        }
    },
    {
        title: '类型',
        key: 'file_type'
    },
    {
        title: '上传时间',
        key: 'created_at',
        sorter: true,
        render: (row) => {
            const date = new Date(row.created_at || '')
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

const sortColumn = ref<string | null>(null)
const sortOrder = ref<'ascend' | 'descend' | null>(null)
const loading = ref(false)
const pagination = ref({
    pageSize: 10,
    page: 1,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.value.page = page
        fetchFiles()
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.value.pageSize = pageSize
        pagination.value.page = 1
        fetchFiles()
    }

})

const handleFileDownload = async (file: FileEntity) => {
    try {
        const response = await axios.get(TenantSpaceAPI.files.downloadStream(file.file_id), {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const downloadUrl = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = downloadUrl;
        const disposition = response.headers['content-disposition'];
        const match = disposition?.match(/filename="?(.+?)"?$/);
        a.download = match?.[1] || file.file_name;

        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('下载失败:', error);
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
    fetchFiles()
}

const handleBatchDelete = async () => {
    try {
        await Promise.all(
            selectedRowKeys.value.map(id =>
                axios.delete(TenantSpaceAPI.files.delete(id))
            )
        )
        selectedRowKeys.value = []
        fetchFiles()
    } catch (err) {
        console.error('删除流程失败:', err)
    }
}

const fetchFiles = async () => {
    loading.value = true
    try {
        const res = await axios.get(TenantSpaceAPI.files.list, {
            params: {
                page: pagination.value.page,
                size: pagination.value.pageSize,
                sort_by: sortColumn.value,
                order: sortOrder.value === 'ascend' ? 'asc' : sortOrder.value === 'descend' ? 'desc' : undefined
            }
        })
        files.value = res.data.data?.files || []
        pagination.value.itemCount = res.data.data?.total || 0
    } catch (err) {
        console.error('获取流程失败:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchFiles()
})

</script>

<style scoped></style>