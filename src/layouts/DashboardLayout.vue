<template>
    <n-layout class="h-screen flex flex-col overflow-hidden">
        <Navbar>
            <component v-for="(node, i) in navbarStore.actions" :key="i" :is="node()" />
        </Navbar>
        <n-layout class="flex flex-1 overflow-hidden h-full" :has-sider="true">
            <n-layout-sider v-if="!isFullScreen" bordered width="256" content-style="padding: 12px;"
                class="flex flex-col justify-between">
                <n-menu :options="menuOptions" :value="activeMenuKey" @update:value="handleMenuClick" />
            </n-layout-sider>
            <n-layout-content class="flex-1 h-full overflow-y-auto p-0">
                <router-view />
            </n-layout-content>
        </n-layout>
    </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useUserStore } from '@/store/user'
import { useNavbarStore } from '@/store/navbar' // Import the new navbar store
import { useRouter, useRoute } from 'vue-router'
import { NMenu, NLayoutSider, NLayoutContent, NLayout } from 'naive-ui'
import Navbar from '@/components/layout/Navbar.vue'
import { ROUTE } from '@/constants/routes'
import { HomeOutline, PeopleOutline, AppsOutline, GitBranchOutline, SettingsOutline } from '@vicons/ionicons5'

function renderIcon(icon: any) {
    return () => h(icon)
}

const user = useUserStore().user
const navbarStore = useNavbarStore() // Initialize the navbar store
const router = useRouter()
const route = useRoute()

const menuOptions = [
    {
        label: '仪表盘',
        key: ROUTE.SPACE.DASHBOARD,
        icon: renderIcon(HomeOutline)
    },
    {
        label: '平台管理',
        key: 'platform',
        icon: renderIcon(SettingsOutline),
        children: [
            { label: '租户管理', key: ROUTE.PLATFORM.TENANTS, icon: renderIcon(PeopleOutline) }
        ]
    },
    {
        label: '租户空间',
        key: 'space',
        icon: renderIcon(AppsOutline),
        children: [
            { label: '租户管理', key: ROUTE.SPACE.PROFILE, icon: renderIcon(PeopleOutline) },
            { label: '流程管理', key: ROUTE.SPACE.FLOWS.LIST, icon: renderIcon(GitBranchOutline) }
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