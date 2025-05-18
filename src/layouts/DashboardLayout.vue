<template>
    <div class="layout-container">
        <n-layout-header bordered class="layout-header">
            <Navbar>
                <component v-for="(node, i) in navbarStore.actions" :key="i" :is="node()" />
            </Navbar>
        </n-layout-header>
        <div class="layout-body">
            <n-layout :has-sider="true">
                <n-layout-sider v-if="!isFullScreen" bordered width="256" content-style="padding: 12px;"
                    class="flex flex-col justify-between">
                    <n-menu :options="menuOptions" :value="activeMenuKey" @update:value="handleMenuClick" />
                </n-layout-sider>
                <n-layout-content class="flex-1 h-full p-0" style="overflow: hidden;" >
                    <router-view />
                </n-layout-content>
            </n-layout>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useUserStore } from '@/store/user'
import { useNavbarStore } from '@/store/navbar' // Import the new navbar store
import { useRouter, useRoute } from 'vue-router'
import { NMenu, NLayoutSider, NLayoutContent, NLayout, NLayoutHeader, NLayoutFooter } from 'naive-ui'
import Navbar from '@/components/layout/Navbar.vue'
import { ROUTE } from '@/constants/routes'
import { HomeOutline, PeopleOutline, AppsOutline, GitBranchOutline, SettingsOutline, ChatbubbleEllipsesOutline } from '@vicons/ionicons5'

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
            { label: '流程管理', key: ROUTE.SPACE.FLOWS.LIST, icon: renderIcon(GitBranchOutline) },
            { label: '文件助手', key: ROUTE.SPACE.FILES.LIST, icon: renderIcon(AppsOutline) },
            { label: '对话助手', key: ROUTE.SPACE.CHAT, icon: renderIcon(ChatbubbleEllipsesOutline) }
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
.layout-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
.n-layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 56px;
    width: 100%;
    border-bottom: 1px solid #eaeaea;
}
.layout-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}
/* 可自定义滚动条样式等 */
</style>