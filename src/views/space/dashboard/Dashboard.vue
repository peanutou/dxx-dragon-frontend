<template>
    <div>
        <n-card title="欢迎进入管理后台">
            <n-input-group>
                <n-input-group-label class="input-label">当前用户</n-input-group-label>
                <n-input :value="userStore.user?.email" readonly />
            </n-input-group>
            <n-input-group>
                <n-input-group-label class="input-label">当前用户 ID</n-input-group-label>
                <n-input :value="userStore.user?.user_id" readonly />
            </n-input-group>
            <n-input-group>
                <n-input-group-label class="input-label">当前租户 ID</n-input-group-label>
                <n-input :value="userStore.user?.tenant_id" readonly />
            </n-input-group>
            <n-input-group>
                <n-input-group-label class="input-label">用户客户端密钥</n-input-group-label>
                <n-input :value="clientKey" readonly type="password" />
                <n-button type="primary" class="ml-2" @click="copyToClipboard(clientKey)">
                    复制
                </n-button>
            </n-input-group>
            <n-divider />
            <n-button type="primary" @click="logout">退出登录</n-button>
        </n-card>
    </div>
</template>


<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import axios from '@/utils/axios'
import { TenantSpaceAPI } from '@/apis/endpoints'
import { NCard, NButton, NInputGroup, NInputGroupLabel, NInput, NDivider } from 'naive-ui'

const router = useRouter()
const userStore = useUserStore()


const clientKey = ref('加载中...')

watchEffect(async () => {
    if (!userStore.user?.user_id) return
    try {
        const res = await axios.get(
            TenantSpaceAPI.users.clientKey(userStore.user.user_id)
        )
        clientKey.value = res.data.data
    } catch (err) {
        console.error('获取用户客户端密钥失败:', err)
        clientKey.value = '获取失败'
    }
})

const logout = () => {
    userStore.logout()
    window.$message.success('已退出登录')
    router.push('/login')
}

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard:', text);
    }).catch(err => {
        console.error('Error copying text to clipboard:', err);
    });
};

</script>

<style scoped>
.input-label {
    font-weight: bold;
    width: 120px;
}
</style>