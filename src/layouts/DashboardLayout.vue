<template>
    <div class="h-screen flex flex-col overflow-hidden">
        <Navbar>
            <component v-for="(node, i) in navbarStore.actions" :key="i" :is="node()" />
        </Navbar>
        <div class="flex flex-1 overflow-hidden">
            <aside v-if="!isFullScreen" class="w-64 bg-white border-r shadow-sm flex flex-col justify-between">
                <div>
                    <n-menu :options="menuOptions" :value="activeMenuKey" @update:value="handleMenuClick" />
                </div>
            </aside>
            <main class="flex-1 h-full overflow-y-auto bg-gray-50 p-0">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useNavbarStore } from '@/store/navbar' // Import the new navbar store
import { useRouter, useRoute } from 'vue-router'
import { NMenu } from 'naive-ui'
import Navbar from '@/components/layout/Navbar.vue'
import { ROUTE } from '@/constants/routes'

const user = useUserStore().user
const navbarStore = useNavbarStore() // Initialize the navbar store
const router = useRouter()
const route = useRoute()

const menuOptions = [
    {
        label: '仪表盘',
        key: ROUTE.SPACE.DASHBOARD
    },
    {
        label: '平台管理',
        key: 'platform',
        children: [
            { label: '租户管理', key: ROUTE.PLATFORM.TENANTS }
        ]
    },
    {
        label: '租户空间',
        key: 'space',
        children: [
            { label: '租户管理', key: ROUTE.SPACE.PROFILE },
            { label: '流程管理', key: ROUTE.SPACE.FLOWS.LIST }
        ]
    }
]

const activeMenuKey = computed(() => route.path)

const isFullScreen = computed(() => route.meta.fullscreen === true)

const handleMenuClick = (key: string) => {
    if (key !== route.path) router.push(key)
}

</script>

<style scoped>
/* 可自定义滚动条样式等 */
</style>