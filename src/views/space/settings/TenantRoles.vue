<template>
    <n-modal v-model:show="showRoleModal" :title="isEditing ? '编辑角色' : '创建角色'" preset="dialog" style="width: 100%;">
        <n-form :model="roleForm" ref="roleFormRef" label-width="80" :rules="createRules">
            <n-form-item label="名称" path="name">
                <n-input v-model:value="roleForm.name" placeholder="请输入角色名" :disabled="isEditing" />
            </n-form-item>
            <n-form-item label="描述" path="description">
                <n-input v-model:value="roleForm.description" placeholder="请输入描述" />
            </n-form-item>
        </n-form>
        <!-- 权限配置部分保持不变 -->
        <div class="flex gap-4">
            <n-card title="可选权限" class="w-1/2 min-h-[300px]">
                <div v-for="(perms, resource) in availablePermissions" :key="resource" class="mb-2 flex items-start">
                    <div class="font-bold mr-4 w-28 flex-shrink-0">{{ resource }}</div>
                    <n-space wrap size="small">
                        <n-button v-for="p in perms" :key="p" size="tiny" @click="addPermission(p)"
                            :disabled="selectedPermissions.includes(p)">
                            {{ p }}
                        </n-button>
                    </n-space>
                </div>
            </n-card>
            <n-card title="已选择权限" class="w-1/2 min-h-[300px]">
                <div v-for="(perms, resource) in groupedSelectedPermissions" :key="resource"
                    class="mb-2 flex items-start">
                    <div class="font-bold mr-4 w-28 flex-shrink-0">{{ resource }}</div>
                    <n-space wrap size="small">
                        <n-tag v-for="p in perms" :key="p" type="info" size="small" closable
                            @close="removePermission(p)">
                            {{ p }}
                        </n-tag>
                    </n-space>
                </div>
            </n-card>
        </div>
        <template #action>
            <n-button @click="showRoleModal = false">取消</n-button>
            <n-button type="primary" @click="submitRole">{{ isEditing ? '保存' : '创建' }}</n-button>
        </template>
    </n-modal>

    <n-card title="角色列表">
        <div class="mb-4 space-y-2">
            <div class="flex justify-between items-center">
                <n-space>
                    <n-button type="primary" @click="openCreateRole">创建角色</n-button>
                    <n-button type="warning" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
                        删除选中角色
                    </n-button>
                </n-space>
                <div class="flex items-center justify-end gap-2">
                    <n-checkbox v-model:checked="showSystemRoles" size="small">
                        显示系统角色
                    </n-checkbox>
                    <n-button text @click="handleInitializeRoles">
                        <template #icon>
                            <n-icon :component="RefreshCircleOutline" />
                        </template>
                        初始化角色与权限
                    </n-button>
                </div>
            </div>
        </div>
        <n-data-table :columns="columns" :data="roles" :loading="loading" :pagination="pagination"
            :on-update:sorter="handleSortChange" :row-key="row => row.role_id" remote
            v-model:checked-row-keys="selectedRowKeys"/>
    </n-card>
</template>

<script setup lang="ts">
import { ref, watch, h, resolveComponent, computed } from 'vue'
import { NCard, NDataTable } from 'naive-ui'
import { RefreshCircleOutline } from '@vicons/ionicons5'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { useUserStore } from '@/store/user'

const loading = ref(false)
const roles = ref([])
const showSystemRoles = ref(false)
const selectedRowKeys = ref<string[]>([])

const pagination = ref({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50, 100],
    onChange: (page: number) => {
        pagination.value.page = page
        fetchRoles()
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.value.pageSize = pageSize
        pagination.value.page = 1
        fetchRoles()
    }
})

const sortBy = ref<string | null>(null)
const sortOrder = ref<'ascend' | 'descend' | null>(null)

const handleSortChange = (sorter: any) => {
    sortBy.value = sorter?.columnKey || null
    sortOrder.value = sorter?.order || null
    fetchRoles()
}

const fetchRoles = async () => {
    loading.value = true
    try {
        const res = await axios.get(TenantSpaceAPI.roles.list, {
            params: {
                page: pagination.value.page,
                size: pagination.value.pageSize,
                sort_by: sortBy.value || undefined,
                order: sortOrder.value === 'descend' ? 'desc' : 'asc'
            }
        })
        const result = res.data.data
        roles.value = showSystemRoles.value
            ? result.roles
            : result.roles.filter((r: any) => !r.is_system)
        pagination.value.itemCount = result.total
    } catch (err) {
        console.error('获取角色失败:', err)
    } finally {
        loading.value = false
    }
}

watch(
    () => useUserStore().currentTenantId,
    (tenantId) => {
        if (tenantId) {
            fetchRoles()
        }
    },
    { immediate: true }
)

const columns = [
    {
        type: 'selection' as const,
        width: 50,
        disabled(row: any) {
            return row.is_system
        }
    },
    {
        title: '角色',
        key: 'name',
        sorter: true,
        render(row: any) {
            return h('div', [
                h('div', {
                    style: {
                        fontWeight: 'bold',
                        cursor: row.is_system ? 'default' : 'pointer',
                        color: row.is_system ? '#aaa' : '#409EFF'
                    },
                    onClick: () => {
                        if (!row.is_system) openEditRole(row)
                    }
                }, row.name),
                h('div', {
                    style: {
                        fontSize: '12px',
                        color: '#888',
                        marginTop: '4px'
                    }
                }, row.description || '—'),
                h('div', {
                    style: {
                        fontSize: '12px',
                        color: '#bbb',
                        marginTop: '4px'
                    }
                }, `创建于 ${new Date(row.created_at).toISOString().slice(0, 10)}`),
                h('div', {
                    style: {
                        fontSize: '12px',
                        color: '#bbb',
                        marginTop: '4px'
                    }
                }, row.is_system ? '系统角色' : '')
            ])
        }
    },
    {
        title: '权限',
        key: 'permissions',
        render(row: any) {
            let permissions: string[] = []
            try {
                permissions = typeof row.permissions === 'string'
                    ? JSON.parse(row.permissions)
                    : row.permissions
            } catch {
                permissions = []
            }

            const grouped: Record<string, string[]> = {}
            permissions.forEach(p => {
                const [resource, action] = p.split(':')
                if (!grouped[resource]) grouped[resource] = []
                grouped[resource].push(p)
            })

            return Object.entries(grouped).map(([resource, perms]) =>
                h('div', {
                    style: 'display: flex; align-items: center; margin-bottom: 8px;'
                }, [
                    h('div', {
                        style: 'width: 100px; font-weight: bold; margin-right: 8px; flex-shrink: 0;'
                    }, resource),
                    h('div', {}, perms.map((p: string) =>
                        h('span', { style: 'margin-right: 4px; display: inline-block;' }, [
                            h(resolveComponent('n-tag'), { type: 'info', size: 'small' }, { default: () => p })
                        ])
                    ))
                ])
            )
        }
    }
]

const showRoleModal = ref(false)
const isEditing = ref(false)
const roleFormRef = ref()
const roleForm = ref({
    role_id: '',
    name: '',
    description: ''
})
const createRules = {
    name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 3, message: '角色名称不得少于 3 个字', trigger: 'blur' }
    ],
    description: []
}

const availablePermissions = ref<Record<string, string[]>>({})

const fetchAvailablePermissions = async () => {
    const userStore = useUserStore()
    const tenant_id = userStore.currentTenantId
    const res = await axios.get(TenantSpaceAPI.tenants.permissions(tenant_id))
    const grouped: Record<string, string[]> = {}
    for (const item of res.data.data) {
        const [resource] = item.key.split(':')
        if (!grouped[resource]) grouped[resource] = []
        grouped[resource].push(item.key)
    }
    availablePermissions.value = grouped
}

const selectedPermissions = ref<string[]>([])

const groupedSelectedPermissions = computed(() => {
    const grouped: Record<string, string[]> = {}
    for (const p of selectedPermissions.value) {
        const [resource] = p.split(':')
        if (!grouped[resource]) grouped[resource] = []
        grouped[resource].push(p)
    }
    return grouped
})

const addPermission = (p: string) => {
    if (!selectedPermissions.value.includes(p)) {
        selectedPermissions.value.push(p)
    }
}
const removePermission = (p: string) => {
    selectedPermissions.value = selectedPermissions.value.filter(x => x !== p)
}

const submitRole = async () => {
    try {
        const payload = {
            description: roleForm.value.description,
            permissions: selectedPermissions.value
        }
        if (isEditing.value) {
            await axios.put(TenantSpaceAPI.roles.update(roleForm.value.role_id), payload)
        } else {
            await axios.post(TenantSpaceAPI.roles.create, { ...payload, name: roleForm.value.name })
        }
        showRoleModal.value = false
        fetchRoles()
    } catch (err) {
        console.error(`${isEditing.value ? '编辑' : '创建'}角色失败:`, err)
    }
}

const openCreateRole = () => {
    isEditing.value = false
    showRoleModal.value = true
    roleForm.value = { name: '', description: '', role_id: '' }
    selectedPermissions.value = []
    fetchAvailablePermissions()
}

const openEditRole = (row: any) => {
    if (row.is_system) return
    isEditing.value = true
    showRoleModal.value = true
    roleForm.value = { name: row.name, description: row.description, role_id: row.role_id }
    try {
        const parsed = typeof row.permissions === 'string' ? JSON.parse(row.permissions) : row.permissions
        selectedPermissions.value = Array.isArray(parsed) ? parsed : []
    } catch {
        selectedPermissions.value = []
    }
    fetchAvailablePermissions()
}

const handleInitializeRoles = async () => {
    try {
        await axios.post(TenantSpaceAPI.roles.initialize)
        fetchRoles()
    } catch (err) {
        console.error('初始化角色与权限失败:', err)
    }
}

const handleBatchDelete = async () => {
    try {
        await Promise.all(
            selectedRowKeys.value.map(role_id =>
                axios.delete(TenantSpaceAPI.roles.delete(role_id))
            )
        )
        selectedRowKeys.value = []
        fetchRoles()
    } catch (err) {
        console.error('批量删除角色失败:', err)
    }
}

watch(showSystemRoles, () => {
    fetchRoles()
})

watch(showRoleModal, (val) => {
    if (val) {
        fetchAvailablePermissions()
        if (!isEditing.value) {
            selectedPermissions.value = []
        }
    }
})

</script>