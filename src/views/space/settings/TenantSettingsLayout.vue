<template>
    <n-layout class="h-full" >
        <n-layout-header class="h-[132px]">
            <n-card>
                <n-page-header title="租户配置">
                    <n-tabs type="line" :value="activeTab" @update:value="onTabChange">
                        <n-tab name="profile">租户信息</n-tab>
                        <n-tab name="roles">角色管理</n-tab>
                        <n-tab name="users">用户管理</n-tab>
                    </n-tabs>
                </n-page-header>
            </n-card>
        </n-layout-header>
        <n-layout-content style="max-height: calc(100% - 132px); overflow-y: auto;" >
            <router-view />
        </n-layout-content>
    </n-layout>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { NLayout, NLayoutHeader, NLayoutContent, NCard } from 'naive-ui'
import { ROUTE } from '@/constants/routes'

const router = useRouter()
const route = useRoute()

const activeTab = computed(() => {
    return route.path.includes('users') ? 'users'
        : route.path.includes('roles') ? 'roles'
            : 'profile'
})

const onTabChange = (tab: string) => {
    const tabRoutes: Record<string, string> = {
        profile: ROUTE.SPACE.PROFILE,
        users: ROUTE.SPACE.USERS,
        roles: ROUTE.SPACE.ROLES
    }
    router.push(tabRoutes[tab])
}
</script>
