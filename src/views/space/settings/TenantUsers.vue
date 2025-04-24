<template>
    <div>
        <n-card title="用户列表" :loading="loading">
            <div class="mb-4 space-y-2">
                <div class="flex justify-between items-center">
                    <n-space>

                        <n-button type="primary"
                            @click="editUser({ username: '', email: '', role: '' })">添加用户</n-button>
                    </n-space>
                </div>
            </div>
            <n-data-table :columns="columns" :data="users" :loading="loading" />
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NCard, NDataTable } from 'naive-ui'

const loading = ref(false)
const users = ref([])

const columns = [
    { title: '用户名', key: 'username' },
    { title: '邮箱', key: 'email' },
    { title: '角色', key: 'role' },
    {
        title: '操作',
        key: 'actions',
        render: (row: { username: string; email: string; role: string }) =>
            h('n-button',
                { size: 'small', onClick: () => editUser(row) }, '编辑'
            )
    }
]

onMounted(async () => {
    loading.value = true
    try {
        const res = await axios.get(TenantSpaceAPI.users.list)
        users.value = res.data.data.users  // 假设返回的数据结构包含 `users`
    } catch (error) {
        console.error('加载用户数据失败:', error)
    } finally {
        loading.value = false
    }
})

function editUser(row: { username: string; email: string; role: string }) {
    // 编辑用户逻辑
    console.log('Editing user:', row.username)
}
</script>

<style scoped>
/* 可以根据设计系统自定义样式 */
</style>