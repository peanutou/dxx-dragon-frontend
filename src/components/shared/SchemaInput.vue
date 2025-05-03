<template>
    <div>
        <n-button text type="primary" @click="showModal = true">
            {{ linkText }}
        </n-button>
        <n-modal v-model:show="showModal" title="生成 Schema" preset="card" style="width: 640px;">
            <n-space vertical style="max-height: 60vh; overflow: hidden;">
                <n-input v-model:value="sampleJson" type="textarea" placeholder="请输入 JSON 示例数据"
                    :autosize="{ minRows: 6 }" style="font-size: 12px;"/>
                <n-button @click="generateSchema" type="primary">生成 Schema</n-button>
                <div style="max-height: 300px; overflow: auto;">
                  <VueJsonPretty :data="schema" :deep="2" :showLine="false" showLength showIcon theme="dark"/>
                </div>
            </n-space>
            <template #footer>
                <n-space justify="end">
                    <n-button @click="showModal = false">取消</n-button>
                    <n-button type="primary" @click="confirmSchema">确定</n-button>
                </n-space>
            </template>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import schematize from '@/utils/schematize' // Generate schema from JSON
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const props = defineProps<{
    linkText?: string
}>()

const emit = defineEmits(['update:schema'])

const showModal = ref(false)
const sampleJson = ref('')
const schema = defineModel<Record<string, any>>('schema')
const message = useMessage()

watch(schema, (newSchema) => {
    sampleJson.value = ''
    schema.value = newSchema
}, { immediate: true })

function generateSchema() {
    try {
        const data = JSON.parse(sampleJson.value)
        const schemaData = schematize(data)
        schema.value = schemaData
    } catch (err) {
        message.error('请输入有效的 JSON 格式数据')
    }
}

function confirmSchema() {
    try {
        emit('update:schema', schema.value)
        showModal.value = false
    } catch {
        message.error('生成的 Schema 格式无效')
    }
}
</script>
