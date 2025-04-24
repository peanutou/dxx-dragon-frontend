<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
        <h1 class="text-5xl font-bold text-red-500 mb-4">403</h1>
        <p class="text-lg text-gray-600 mb-4">无权限访问当前页面</p>
        <n-button type="primary" @click="goHome">返回首页</n-button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => {
    router.push('/')
}
</script>