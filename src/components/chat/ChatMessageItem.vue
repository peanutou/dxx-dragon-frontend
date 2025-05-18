<template>
    <div :class="['flex items-start gap-2 py-1', message.role === 'user' ? 'flex-row-reverse' : 'flex-row']">
        <n-avatar :style="{ backgroundColor: message.role === 'user' ? '#3eaf7c' : '#18a058' }" size="small"
            class="flex-shrink-0">
            {{ message.role === 'user' ? 'U' : 'A' }}
        </n-avatar>
        <div class="flex flex-col gap-1">
            <div :class="[
                'p-4 mb-3 rounded-lg max-w-[800px] break-words',
                message.role === 'user'
                    ? 'bg-blue-500 text-white self-end'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white self-start'
            ]">
                <VueMarkdown :source="typeof props.message.displayContent === 'object'
                    ? props.message.displayContent.value
                    : props.message.displayContent || props.message.content" class="flex flex-col gap-2"/>
            </div>
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
import VueMarkdown from 'vue3-markdown-it'
import { NAvatar, NTag } from 'naive-ui'

const props = defineProps<{
    message: {
        role: string
        content: string
        displayContent?: string | Ref<string>
        timestamp: string
    }
}>()


</script>