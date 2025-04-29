<template>
    <div class="flex items-center justify-center h-screen bg-gray-50">
        <div class="w-1/3 max-w-xl">
            <n-card class="shadow-xl border-2 rounded-lg border-gray-200" title="登录系统">
                <n-form :model="form" :rules="rules" ref="formRef">
                    <n-form-item path="email" label="邮箱">
                        <n-input v-model:value="form.email" placeholder="请输入邮箱" />
                    </n-form-item>
                    <n-form-item path="password" label="密码">
                        <n-input v-model:value="form.password" type="password" placeholder="请输入密码" />
                    </n-form-item>
                    <n-form-item>
                        <n-space vertical size="large" class="w-full">
                            <n-button type="primary" block @click="handleLogin" :loading="loading">登录</n-button>
                            <n-button text block @click="toRegister">还没有账户？去注册</n-button>
                        </n-space>
                    </n-form-item>
                </n-form>
            </n-card>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'
import { useUserStore } from '@/store/user'
import { ROUTE } from '@/constants/routes'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = ref({
    email: '',
    password: ''
})

const rules = {
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
function toRegister() {
    router.push('/register')
}

const handleLogin = async () => {
    await formRef.value?.validate()
    loading.value = true
    try {
        const res = await axios.post('/auth/login', form.value)
        if (res.status !== 200) {
            throw new Error(res.data.message)
        }
        useUserStore().setUser(res.data.data)
        window.$message.success('登录成功')
        router.push(ROUTE.SPACE.DASHBOARD)
    } catch (err) {
        window.$message.error('登录失败，请检查用户名或密码')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* 你可以自定义美化样式 */
</style>
