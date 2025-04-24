<template>
    <div class="space-y-4">
        <n-card>
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { useUserStore } from '@/store/user'

const tenant = ref({
    tenant_id: '',
    name: '',
    slug: '',
    plan: '',
    is_active: false,
    created_at: ''
})

onMounted(async () => {
    const userStore = useUserStore()
    const tenant_id = userStore.currentTenantId
    if (tenant_id) {
        const res = await axios.get(TenantSpaceAPI.tenants.get(String(tenant_id)))
        tenant.value = res.data.data
    }
})
</script>