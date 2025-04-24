<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
        <h1 class="text-5xl font-bold text-yellow-500 mb-4">401</h1>
        <p class="text-lg text-gray-600 mb-4">未登录或登录已过期，请重新登录</p>
        <n-button type="primary" @click="goLogin">前往登录</n-button>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goLogin = () => {
    router.push('/login')
}
</script>
