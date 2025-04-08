<template>
  <div>
    <n-card title="用户列表">
      <n-data-table
        :columns="columns"
        :data="users"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NTag } from 'naive-ui'
import axios from '@/utils/axios'

const users = ref([])
const loading = ref(false)

const columns = [
  { title: '邮箱', key: 'email' },
  { title: '状态', key: 'is_active', render: (row: { is_active: boolean }) => row.is_active ? '启用' : '禁用' },
  { title: '创建时间', key: 'created_at' },
  {
    title: '角色',
    key: 'roles',
    render: (row: any) => row.roles?.length
      ? row.roles.map((role: string) =>
          h(NTag, { type: 'info', style: 'margin-right: 4px' }, { default: () => role })
        )
      : '-'
  },
  {
    title: '存储路径',
    key: 'storage_root',
    render: (row: any) =>
      h(
        'a',
        { href: row.storage_root, target: '_blank', style: 'color: #409EFF' },
        'PATH'
      )
  }
]

onMounted(async () => {
  loading.value = true
  try {
    const res = await axios.get('/users')
    users.value = res.data.data?.users || []
  } catch (err) {
    console.error('获取用户失败:', err)
  } finally {
    loading.value = false
  }
})
</script>
