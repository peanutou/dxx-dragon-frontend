<template>
    <div>
        <n-card title="欢迎进入管理后台">
            <n-button type="primary" @click="logout">退出登录</n-button>
        </n-card>
    </div>
</template>


<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { useMessage } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const logout = () => {
    userStore.logout()
    message.success('已退出登录')
    router.push('/login')
}
</script>