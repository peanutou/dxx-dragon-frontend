<template>
    <div class="space-y-4">
        <n-card title="租户信息">
            <n-descriptions label-placement="left" :column="2" bordered size="small" style="margin: 0 auto;">
                <n-descriptions-item label="名称">{{ tenant.name }}</n-descriptions-item>
                <n-descriptions-item label="Slug">{{ tenant.slug }}</n-descriptions-item>
                <n-descriptions-item label="套餐">{{ tenant.plan }}</n-descriptions-item>
                <n-descriptions-item label="启用状态">
                    <n-tag :type="tenant.is_active ? 'success' : 'error'">
                        {{ tenant.is_active ? '启用' : '停用' }}
                    </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="Tenant Id">{{ tenant.tenant_id }}</n-descriptions-item>
                <n-descriptions-item label="创建时间">
                    {{ new Date(tenant.created_at).toLocaleString() }}
                </n-descriptions-item>
            </n-descriptions>
        </n-card>
        <RoleList :tenant="tenant"/>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/utils/axios'
import RoleList from './roles/RoleList.vue'

const route = useRoute()
const tenant = ref({
    tenant_id: '',
    name: '',
    slug: '',
    plan: '',
    is_active: false,
    created_at: ''
})

onMounted(async () => {
    const tenant_id = route.params.tenant_id
    const res = await axios.get(`/tenants/${tenant_id}`)
    tenant.value = res.data.data
})

</script>