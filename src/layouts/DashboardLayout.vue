<!-- src/layouts/DashboardLayout.vue -->
<template>
    <div class="h-screen flex flex-col overflow-hidden">
        <!-- 顶部导航栏 -->
        <Navbar />

        <!-- 页面主体：Sidebar + Main -->
        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar -->
            <aside class="w-64 bg-white border-r shadow-sm flex flex-col justify-between">
                <div>
                    <n-menu :options="menuOptions" :value="activeMenuKey" @update:value="handleMenuClick" />
                </div>
                <!-- 用户信息展示 -->
                <div class="p-4 border-t text-sm text-gray-500">
                    <div class="font-medium">{{ user?.email }}</div>
                    <div class="text-xs text-gray-400">{{ user?.roles?.join(', ') }}</div>
                </div>
            </aside>

            <!-- 主内容区 -->
            <main class="flex-1 overflow-y-auto bg-gray-50 p-0">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter, useRoute } from 'vue-router'
import { NMenu } from 'naive-ui'
import Navbar from '@/components/Navbar.vue'

const user = useUserStore().user
const router = useRouter()
const route = useRoute()

const menuOptions = [
    { label: '仪表盘', key: '/dashboard' },
    { label: '租户管理', key: '/tenants' },
    { label: '用户管理', key: '/users' },
    { label: '角色管理', key: '/roles' },
]

const activeMenuKey = computed(() => route.path)

const handleMenuClick = (key: string) => {
    if (key !== route.path) router.push(key)
}
</script>

<style scoped>
/* 可自定义滚动条样式等 */
</style>