<script setup>
import {
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NNotificationProvider,
    NLoadingBarProvider,
    NBackTop
} from 'naive-ui'
</script>

<template>
    <n-config-provider>
        <n-message-provider>
            <n-dialog-provider>
                <n-notification-provider>
                    <n-loading-bar-provider>
                        <router-view />
                        <n-back-top :bottom="20" :right="20" />
                    </n-loading-bar-provider>
                </n-notification-provider>
            </n-dialog-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<style scoped>
/* 可选全局样式 */
</style>