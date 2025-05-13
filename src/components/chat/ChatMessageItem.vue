<template>
    <div :class="['flex items-start gap-2 py-1', message.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
        <n-avatar :style="{ backgroundColor: message.role === 'user' ? '#3eaf7c' : '#18a058' }" size="small"
            class="flex-shrink-0">
            {{ message.role === 'user' ? 'U' : 'A' }}
        </n-avatar>
        <div class="flex flex-col gap-1">
            <n-text depth="3">
                {{ typeof message.displayContent === 'object'
                    ? message.displayContent.value
                    : message.displayContent || message.content }}
            </n-text>
            <div :class="['w-full flex', message.role === 'user' ? 'justify-end' : 'justify-start']">
                <n-tag size="small" type="default" :bordered="false"
                    style="min-width: 60px; background-color: transparent; text-align: center;">
                    {{ message.timestamp }}
                </n-tag>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { NText } from 'naive-ui'

defineProps<{
    message: {
        role: string
        content: string
        displayContent?: string | Ref<string>
        timestamp: string
    }
}>()
</script>