<template>
    <div class="flex items-center justify-center h-screen bg-gray-50">
        <div class="w-1/3 max-w-xl">
            <n-card title="注册账号">
                <n-form :model="form" :rules="rules" ref="formRef">
                    <n-form-item label="邮箱" path="email">
                        <n-input v-model:value="form.email" placeholder="请输入邮箱" />
                    </n-form-item>
                    <n-form-item label="密码" path="password">
                        <n-input v-model:value="form.password" type="password" placeholder="请输入密码" />
                    </n-form-item>
                    <n-form-item label="确认密码" path="confirmPassword">
                        <n-input v-model:value="form.confirmPassword" type="password" placeholder="请再次输入密码" />
                    </n-form-item>
                </n-form>
                <n-form-item>
                    <n-space vertical size="large" class="w-full">
                        <n-button type="primary" block class="mt-4" @click="handleRegister" :loading="loading">注册</n-button>
                        <n-button text block class="mt-2" @click="toLogin">已有账户？去登录</n-button>
                    </n-space>
                </n-form-item>
            </n-card>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FormInst, FormRules } from 'naive-ui'
import axios from '@/utils/axios'
import { AuthAPI } from '@/apis/endpoints'

const router = useRouter()
const formRef = ref<FormInst | null>(null)
const form = ref({
    email: '',
    password: '',
    confirmPassword: ''
})
const loading = ref(false)

const rules: FormRules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: ['blur', 'input'] }
    ],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator(_, value) {
                return value === form.value.password
            },
            message: '两次输入的密码不一致',
            trigger: 'blur'
        }
    ]
}

function handleRegister() {
    formRef.value?.validate(async (errors) => {
        if (!errors) {
            loading.value = true
            try {
                const res = await axios.post(AuthAPI.register, {
                    email: form.value.email,
                    password: form.value.password,
                    confirm_password: form.value.confirmPassword
                })
                window.$message.succeed('注册成功')
                router.push('/login')
            } catch (err: any) {
                const detail = err.response?.data?.message || '注册失败，请重试'
                window.$message.error(detail)
            } finally {
                loading.value = false
            }
        }
    })
}

function toLogin() {
    router.push('/login')
}
</script>
