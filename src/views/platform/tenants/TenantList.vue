<template>
    <n-modal v-model:show="showEditModal" title="编辑租户" preset="dialog">
        <n-form :model="editForm" ref="editFormRef" label-width="80">
            <n-form-item label="名称" path="name">
                <n-input v-model:value="editForm.name" placeholder="请输入名称" />
            </n-form-item>
            <n-form-item label="域名前缀" path="slug">
                <n-input v-model:value="editForm.slug" disabled />
            </n-form-item>
            <n-form-item label="方案" path="plan">
                <n-input v-model:value="editForm.plan" disabled />
            </n-form-item>
            <n-form-item label="启用状态" path="is_active">
                <n-switch v-model:value="editForm.is_active" />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button @click="showEditModal = false">取消</n-button>
            <n-button type="primary" @click="submitEdit">保存</n-button>
        </template>
    </n-modal>
    <n-modal v-model:show="showCreateModal" title="创建租户" preset="dialog">
        <n-form :model="createForm" :rules="createRules" ref="formRef" label-width="80">
            <n-form-item label="名称" path="name">
                <n-input v-model:value="createForm.name" placeholder="请输入名称" />
            </n-form-item>
            <n-form-item label="域名前缀" path="slug">
                <n-input v-model:value="createForm.slug" placeholder="域名前置，（例如 {xyz}.example.com）" />
            </n-form-item>
            <n-form-item label="方案" path="plan">
                <n-input v-model:value="createForm.plan" placeholder="如 basic / pro" disabled />
            </n-form-item>
            <n-form-item label="启用状态" path="is_active">
                <n-switch v-model:value="createForm.is_active" />
            </n-form-item>
        </n-form>
        <template #action>
            <n-button @click="showCreateModal = false">取消</n-button>
            <n-button type="primary" @click="submitCreate">创建</n-button>
        </template>
    </n-modal>
    <n-card title="租户列表">
        <div class="mb-4 flex justify-between items-center">
            <n-space>
                <n-button type="primary" @click="showCreateModal = true">创建租户</n-button>
                <n-button type="error" @click="handleDeleteTenants"
                    :disabled="checkedRowKeys.length === 0">删除选中</n-button>
            </n-space>
        </div>
        <n-data-table :columns="columns" :data="tenants" :loading="loading" :pagination="pagination" remote
            :row-key="(row: Tenant) => row.tenant_id" checkable :checked-row-keys="checkedRowKeys"
            @update:checked-row-keys="handleSelectionChange" @update:sorter="handleSorterChange" />
    </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDataTable, NButton, NSpace, NModal, NForm, NFormItem, NInput, NSwitch } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import axios from '@/utils/axios'
import { PlatformTenantAPI } from '@/apis/endpoints'

interface Tenant {
    tenant_id: string
    name: string
    slug: string
    plan: string
    is_active: boolean
    created_at: string
}

const router = useRouter()
const tenants = ref<Tenant[]>([])
const loading = ref(false)
const checkedRowKeys = ref<(string | number)[]>([])
const sortColumn = ref<string | null>(null)
const sortOrder = ref<'ascend' | 'descend' | null>(null)

const pagination = ref({
    pageSize: 10,
    page: 1,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onUpdatePageSize: (size: number) => {
        pagination.value.pageSize = size
        pagination.value.page = 1
        fetchTenants()
    },
    onChange: (currentPage: number) => {
        pagination.value.page = currentPage
        fetchTenants()
    }
})

const columns: DataTableColumns<Tenant> = [
    {
        type: 'selection',
        multiple: true
    },
    {
        title: '名称',
        key: 'name',
        sorter: true,
        render: (row) => h(
            'a',
            {
                style: { color: '#409EFF', cursor: 'pointer' },
                onClick: () => openEditModal(row)
            },
            row.name
        )
    },
    {
        title: '操作',
        key: 'actions',
        render: () => h('span', '无操作')
    },
    { title: '域名前缀', key: 'slug', sorter: true },
    { title: '方案', key: 'plan', sorter: true },
    {
        title: '状态',
        key: 'is_active',
        render: (row) => row.is_active ? '启用' : '禁用',
        sorter: true
    },
    {
        title: '创建时间',
        key: 'created_at',
        render: (row) => new Date(row.created_at).toLocaleString(),
        sorter: true
    },
]

const fetchTenants = async () => {
    loading.value = true
    try {
        const res = await axios.get(PlatformTenantAPI.list, {
            params: {
                page: pagination.value.page,
                size: pagination.value.pageSize,
                sort_by: sortColumn.value,
                order: sortOrder.value === 'ascend' ? 'asc' : sortOrder.value === 'descend' ? 'desc' : undefined
            }
        })
        tenants.value = res.data.data?.tenants || []
        pagination.value.itemCount = res.data.data?.total || 0
    } catch (err) {
        console.error('获取租户失败:', err)
    } finally {
        loading.value = false
    }
}

const handleSelectionChange = (keys: (string | number)[]) => {
    checkedRowKeys.value = keys
}

const handleSorterChange = (sorter: any) => {
    if (sorter === null) {
        sortColumn.value = null
        sortOrder.value = null
    } else {
        sortColumn.value = sorter.columnKey
        sortOrder.value = sorter.order
    }
    fetchTenants()
}

const showCreateModal = ref(false)
const showEditModal = ref(false)
const formRef = ref()
const editFormRef = ref()
const createForm = ref({
    name: '',
    slug: '',
    plan: 'Standard',
    is_active: true
})
const editForm = ref<Partial<Tenant>>({})

const createRules = {
    name: [{ required: true, message: '请输入租户名称', trigger: 'blur' }],
    slug: [
        { required: true, message: '请输入 Slug', trigger: 'blur' },
        { min: 3, message: 'Slug 不得少于 3 个字符', trigger: 'blur' },
        { pattern: /^[a-z0-9\-]{3,32}$/, message: 'Slug 仅支持小写字母、数字和短横线，长度为 3-32', trigger: 'blur' }
    ],
    plan: [{ required: true, message: '请输入套餐', trigger: 'blur' }]
}

const submitCreate = async () => {
    try {
        await formRef.value?.validate()
        await axios.post(PlatformTenantAPI.create, createForm.value)
        showCreateModal.value = false
        fetchTenants()
    } catch (err) {
        console.error('创建失败:', err)
    }
}

const submitEdit = async () => {
    if (!editForm.value || !editForm.value.tenant_id) return
    try {
        await axios.put(PlatformTenantAPI.update(editForm.value.tenant_id), editForm.value)
        showEditModal.value = false
        fetchTenants()
    } catch (err) {
        console.error('更新失败:', err)
    }
}

const openEditModal = (tenant: Tenant) => {
    editForm.value = { ...tenant }
    showEditModal.value = true
}

const handleDeleteTenants = async () => {
    if (!checkedRowKeys.value.length) return
    loading.value = true
    try {
        for (const id of checkedRowKeys.value) {
            await axios.delete(PlatformTenantAPI.delete(String(id)))
        }
        checkedRowKeys.value = []
        fetchTenants()
    } catch (err) {
        console.error('删除租户失败:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchTenants()
})
</script>