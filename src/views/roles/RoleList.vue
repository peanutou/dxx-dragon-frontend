<!-- src/views/roles/RoleList.vue -->
<template>
    <div>
        <n-card title="角色列表">
            <n-data-table :columns="columns" :data="roles" :loading="loading" :pagination="{ pageSize: 10 }" />
        </n-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NDataTable } from 'naive-ui'
import axios from '@/utils/axios'

const roles = ref([])
const loading = ref(false)

const columns = [
    { title: '角色名', key: 'name' },
    { title: '描述', key: 'description' },
    { title: '创建时间', key: 'created_at' }
]

onMounted(async () => {
    loading.value = true
    try {
        const res = await axios.get('/roles')
        roles.value = res.data.data?.roles || []
    } catch (err) {
        console.error('获取角色失败:', err)
    } finally {
        loading.value = false
    }
})
</script>