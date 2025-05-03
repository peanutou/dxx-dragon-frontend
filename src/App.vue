<script setup>
import {
    NConfigProvider,
    NMessageProvider,
    NDialogProvider,
    NNotificationProvider,
    NLoadingBarProvider,
    NBackTop,
    darkTheme,
    lightTheme,
    drawerDark,
} from 'naive-ui'
</script>

<template>
    <n-config-provider :theme="darkTheme">
        <n-message-provider placement="top-right" :max="3">
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
html,
body,
#app {
    height: 100%;
    margin: 0;
}
</style>