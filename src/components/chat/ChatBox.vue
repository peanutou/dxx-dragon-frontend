<template>
    <div class="chat-box">
        <div class="chat-messages" ref="messageContainer" @scroll="handleScroll">
            <ChatMessageItem v-for="(msg, index) in messages" :key="index" :message="msg" />
            <n-tag v-if="typing" type="info" size="small">🤖 Assistant is typing...</n-tag>
        </div>
        <div class="chat-input">
            <n-input v-model:value="userInput" type="textarea" placeholder="Type your message..."
                :autosize="{ minRows: 1, maxRows: 4 }"
                @keydown.enter.prevent="(e) => { if (!e.isComposing) sendMessage() }" />
            <n-button :type="typing ? 'error' : 'primary'" @click="typing ? stopStreaming() : sendMessage()"
                class="send-button">
                {{ typing ? 'Stop' : 'Send' }}
            </n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, Ref } from 'vue'
import { NInput, NButton } from 'naive-ui'
import dayjs from 'dayjs'
import { TenantSpaceAPI } from '@/apis/endpoints'
import axios from '@/utils/axios'
import { customFetch } from '@/utils/fetch'
import ChatMessageItem from './ChatMessageItem.vue'

interface ChatMessage {
    role: string
    content: string
    displayContent: Ref<string>
    timestamp: string
}

const messages: Ref<ChatMessage[]> = ref([])

const userInput = ref('')
const messageContainer = ref<HTMLDivElement | null>(null)
const typing = ref(false)

const autoScrollEnabled = ref(true)

function handleScroll() {
    const container = messageContainer.value
    if (!container) return
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20
    autoScrollEnabled.value = atBottom
}

let controller: AbortController | null = null
function stopStreaming() {
    if (controller) {
        controller.abort()
        controller = null
        typing.value = false
    }
}

function scrollToBottom() {
    if (!autoScrollEnabled.value) return
    nextTick(() => {
        messageContainer.value?.scrollTo({
            top: messageContainer.value.scrollHeight,
            behavior: 'smooth'
        })
    })
}

async function sendMessage() {
    const streaming = true
    if (streaming) {
        await sendMessageStream()
    } else {
        const content = userInput.value.trim()
        if (!content) return

        const userMsg = {
            role: 'user',
            content,
            displayContent: ref(''),
            timestamp: dayjs().format('HH:mm')
        }
        messages.value.push(userMsg)
        userInput.value = ''
        typing.value = true

        try {
            const res = await axios.post(TenantSpaceAPI.chat.send, {
                engine: 'azure-openai',
                messages: messages.value.map(({ role, content }) => ({ role, content }))
            })

            const reply = res.data?.data?.reply || 'Error: No reply received.'
            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: reply,
                timestamp: dayjs().format('HH:mm'),
                displayContent: ref('')
            }
            messages.value.push(assistantMsg)

            for (let i = 0; i < reply.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 15))
                assistantMsg.displayContent += reply[i]
            }
        } catch (err) {
            messages.value.push({
                role: 'assistant',
                content: '⚠️ Failed to get response from server.',
                timestamp: dayjs().format('HH:mm'),
                displayContent: ref(''),
            })
        } finally {
            typing.value = false
            nextTick(() => {
                messageContainer.value?.scrollTo({
                    top: messageContainer.value.scrollHeight,
                    behavior: 'smooth'
                })
            })
        }
    }
}

async function sendMessageStream() {
    autoScrollEnabled.value = true
    const content = userInput.value.trim()
    if (!content) return

    const userMsg = {
        role: 'user',
        content,
        displayContent: ref(''),
        timestamp: dayjs().format('HH:mm')
    }
    messages.value.push(userMsg)
    scrollToBottom()
    userInput.value = ''
    typing.value = true

    const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: '',
        displayContent: ref(''),
        timestamp: dayjs().format('HH:mm')
    }
    messages.value.push(assistantMsg)

    try {
        controller = new AbortController()
        const response = await customFetch(TenantSpaceAPI.chat.stream, {
            method: 'POST',
            body: JSON.stringify({
                engine: 'azure-openai',
                messages: messages.value.map(({ role, content }) => ({ role, content }))
            }),
            signal: controller.signal
        })

        if (!response.body) throw new Error('No response body for stream')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
                ; (assistantMsg.displayContent as Ref<string>).value += chunk
            scrollToBottom()
            console.log('Chunk received:', chunk)
            await new Promise(resolve => setTimeout(resolve, 10))
        }
    } catch (err) {
        console.error('Error during streaming:', err)
        if ((err as any).name === 'AbortError') {
            assistantMsg.displayContent.value = '⛔️ Stream aborted by user.'
        } else {
            assistantMsg.displayContent.value = '⚠️ Failed to stream response.'
        }
    } finally {
        typing.value = false
        scrollToBottom()
    }
}
</script>

<style scoped>
.chat-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100vh;
    border: 1px solid var(--n-border-color);
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--n-color);
    color: var(--n-text-color);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background-color: var(--n-color);
    color: var(--n-text-color);
    min-height: 0;
}

.chat-message {
    display: flex;
    margin-bottom: 12px;
}

.chat-bubble {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    max-width: 80%;
}

.user-message {
    justify-content: flex-end;
}

.user-message .chat-bubble {
    flex-direction: row-reverse;
    text-align: right;
}

.assistant-message {
    justify-content: flex-start;
}

.chat-avatar {
    font-size: 20px;
}

.chat-content {
    padding: 10px 14px;
    border-radius: 12px;
    background-color: var(--n-button-color2);
    color: var(--n-text-color);
    word-break: break-word;
    white-space: pre-wrap;
}

.chat-timestamp {
    font-size: 12px;
    opacity: 0.6;
    margin-top: 4px;
    text-align: right;
}

.chat-input {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid var(--n-border-color);
    background-color: var(--n-color);
    position: sticky;
    bottom: 0;
}

.stop-button {
    margin-left: auto;
}
</style>