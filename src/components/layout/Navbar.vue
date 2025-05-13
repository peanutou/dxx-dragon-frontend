<template>
    <div class="flex items-center gap-4">
        <n-button v-if="showBackButton" size="small" tertiary @click="router.push(backButtonTarget)">
            {{ backButtonText }}
        </n-button>
    </div>
    <div class="w-4" />
    <!-- 中间区域：动态按钮插槽 -->
    <div class="flex items-center gap-2 flex-1 justify-start">
        <div class="flex items-center navbar-button-group">
            <template v-for="(node, i) in navbarStore.actions" :key="i">
                <component :is="node()" class="navbar-action-button" />
            </template>
        </div>
    </div>
    <!-- 右侧区域：用户头像及提示 -->
    <n-tooltip trigger="hover">
        <template #trigger>
            <img :src="logo" alt="Logo" class="h-8" />
        </template>
        {{ user?.email }}
    </n-tooltip>
</template>

<script setup>
import logo from '@/assets/logo-circle.svg'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useNavbarStore } from '@/store/navbar'
import { NButton, NTooltip } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const user = useUserStore().user
const navbarStore = useNavbarStore()

const showBackButton = computed(() => route.meta?.showBackButton)
const backButtonText = computed(() => route.meta?.backButtonText || '← 返回')
const backButtonTarget = computed(() => route.meta?.backButtonTarget || '/')
const isFullScreen = computed(() => route.name === 'FlowEditor')
</script>

<style scoped>
.navbar-button-group {
    display: flex;
    gap: 6px;
}

.navbar-action-button {
    padding-left: 12px;
    padding-right: 12px;
    border: none;
}
</style>