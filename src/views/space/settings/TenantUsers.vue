<template>
    <div>
        <n-modal v-model:show="showCreateModal" preset="dialog" title="创建用户">
            <n-form :model="createForm">
                <n-form-item label="用户名" path="username">
                    <n-input v-model:value="createForm.username" placeholder="请输入用户名" />
                </n-form-item>
                <n-form-item label="邮箱" path="email">
                    <n-input v-model:value="createForm.email" placeholder="请输入邮箱" />
                </n-form-item>
                <n-form-item label="初始密码" path="password">
                    <n-input v-model:value="createForm.password" type="password" placeholder="请输入初始密码" />
                </n-form-item>
                <n-form-item label="确认初始密码" path="confirm_password">
                    <n-input v-model:value="createForm.confirm_password" type="password" placeholder="请再次输入初始密码" />
                </n-form-item>
                <n-form-item label="角色" path="roles">
                    <n-select v-model:value="createForm.roles" :options="roleOptions" placeholder="请选择角色" multiple
                        clearable :render-label="renderRoleLabel" />
                </n-form-item>
                <n-form-item label="状态" path="is_active">
                    <n-switch v-model:value="createForm.is_active" :checked-value="true" :unchecked-value="false">
                        <template #checked>启用</template>
                        <template #unchecked>停用</template>
                    </n-switch>
                </n-form-item>
            </n-form>
            <template #action>
                <n-button @click="closeCreateModal">取消</n-button>
                <n-button type="primary" @click="handleCreateUser">确定</n-button>
            </template>
        </n-modal>
        <n-card title="用户列表" :loading="loading">
            <div class="mb-4 space-y-2">
                <div class="flex justify-between items-center">
                    <n-space>
                        <n-button type="primary" @click="openCreateModal">添加用户</n-button>
                        <n-button type="error" @click="handleDeleteUsers" :disabled="selectedRowKeys.length === 0">
                            删除用户
                        </n-button>
                    </n-space>
                </div>
            </div>
            <n-data-table remote :columns="columns" :data="users" :loading="loading" :row-key="(row) => row.user_id"
                v-model:checked-row-keys="selectedRowKeys" :pagination="pagination" />
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h, watch } from 'vue'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NCard, NDataTable, NModal, NForm, NFormItem, NInput, NSelect, NTooltip } from 'naive-ui'

const loading = ref(false)
const users = ref([])

const pagination = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    pageCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.page = page
        fetchUsers()
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize
        pagination.page = 1
        fetchUsers()
    }
})

const roleOptions = ref([])

const showCreateModal = ref(false)
const createForm = ref({
    username: '',
    email: '',
    roles: [],
    is_active: true,
    password: '',
    confirm_password: ''
})

const selectedRowKeys = ref<string[]>([])
const selectedRows = ref<any[]>([])

function openCreateModal() {
    createForm.value = {
        username: '',
        email: '',
        roles: [],
        is_active: true,
        password: '',
        confirm_password: ''
    }
    showCreateModal.value = true
}

function closeCreateModal() {
    showCreateModal.value = false
}

async function handleCreateUser() {
    try {
        await axios.post(TenantSpaceAPI.users.create, {
            name: createForm.value.username,
            email: createForm.value.email,
            roles: createForm.value.roles,
            is_active: createForm.value.is_active,
            password: createForm.value.password,
            confirm_password: createForm.value.confirm_password
        })
        window.$message.success('用户创建成功')
        closeCreateModal();
        // 重新加载用户列表
        await fetchUsers()
    } catch (error) {
        console.error('创建用户失败:', error)
        window.$message.error('用户创建失败，请稍后重试')
    }
}

function renderRoleLabel(option: { label: string; description: string; value: string }) {
    return h(
        NTooltip,
        { trigger: 'hover' },
        {
            trigger: () => h('span', {}, option.label),
            default: () => option.description || ''
        }
    )
}

const columns = [
    {
        type: 'selection' as const,
        width: 50,
    },
    { title: '用户名', key: 'name' },
    {
        title: '操作',
        key: 'actions',
        render: (row: { username: string; email: string; role: string }) =>
            h('n-button',
                { size: 'small', onClick: () => editUser(row) }, '编辑'
            )
    },
    { title: '邮箱', key: 'email' },
    {
        title: '状态',
        key: 'is_active',
        render: (row: { is_active: boolean }) =>
            h(
                'span',
                { style: { color: row.is_active ? 'green' : 'orange' } },
                row.is_active ? '启用' : '停用'
            )
    },
    {
        title: '角色',
        key: 'roles',
        render: (row: { roles: string[] }) =>
            h('div', {}, row.roles?.join(', ') || '-')
    },
]

async function loadRoles() {
    try {
        const res = await axios.get(TenantSpaceAPI.roles.list)
        roleOptions.value = res.data.data.roles.map((role: any) => ({
            label: role.name,
            description: role.description,
            value: role.name
        }))
    } catch (error) {
        console.error('加载角色列表失败:', error)
    }
}

async function fetchUsers() {
    loading.value = true
    try {
        const res = await axios.get(TenantSpaceAPI.users.list, {
            params: {
                page_number: pagination.page,
                page_size: pagination.pageSize,
                sort_by: 'updated_at',
                order: 'desc'
            }
        })
        users.value = res.data.data.users
        pagination.itemCount = res.data.data.total || 0
        pagination.pageCount = Math.ceil(pagination.itemCount / pagination.pageSize)
    } catch (error) {
        console.error('加载用户数据失败:', error)
    } finally {
        loading.value = false
    }
}

async function handleDeleteUsers() {
    if (selectedRowKeys.value.length === 0) {
        window.$message.warning('请先选择要删除的用户');
        return;
    }

    try {
        // 遍历选中的用户 ID，逐个发送删除请求
        for (const userId of selectedRowKeys.value) {
            await axios.delete(TenantSpaceAPI.users.delete(userId));
        }
        window.$message.success('选中的用户已成功删除');
        selectedRowKeys.value = []; // 清空选中的行
        await fetchUsers(); // 重新加载用户列表
    } catch (error) {
        console.error('删除用户失败:', error);
        window.$message.error('删除用户失败，请稍后重试');
    }
}

onMounted(async () => {
    await fetchUsers()
    await loadRoles()
})

function editUser(row: { username: string; email: string; role: string }) {
    // 编辑用户逻辑
    console.log('Editing user:', row.username)
}
</script>

<style scoped>
/* 可以根据设计系统自定义样式 */
</style>
