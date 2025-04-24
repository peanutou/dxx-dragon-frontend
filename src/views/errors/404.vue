<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
        <h1 class="text-5xl font-bold text-gray-500 mb-4">404</h1>
        <p class="text-lg text-gray-600 mb-4">页面未找到，您访问的内容不存在</p>
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
