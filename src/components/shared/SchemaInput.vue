<template>
    <div>
        <n-button text type="primary" @click="showModal = true">
            {{ linkText }}
        </n-button>
        <n-modal v-model:show="showModal" title="生成 Schema" preset="card" style="width: 640px;">
            <n-space vertical style="max-height: 60vh; overflow: hidden;">
                <div style="max-height: 200px; overflow: auto; font-size: 12px;">
                    <n-input v-model:value="sampleJson" type="textarea" placeholder="请输入 JSON 示例数据"
                        :autosize="{ minRows: 6 }" style="font-size: 12px;" />
                </div>
                <n-button @click="generateSchema" type="primary">生成 Schema</n-button>
                <div style="max-height: 300px; overflow: auto;">
                    <VueJsonPretty :data="schema" :deep="2" :showLine="false" showLength showIcon theme="dark"
                        @nodeClick="onNodeClick" />
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

defineProps<{ linkText?: string }>()
const modelSchema = defineModel<Record<string, any> | string>('schema')
const schema = ref<Record<string, any> | string>()
const emit = defineEmits(['update:schema'])
const showModal = ref(false)
const sampleJson = ref('')
const message = useMessage()

watch(modelSchema, (val) => {
    schema.value = val || {}
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

function getValueByPath(obj: any, path: string): any {
    const pathRegex = /(?:\.?([a-zA-Z_$][\w$]*))|\[(['"]?)(.*?)\2\]/g;
    let match: RegExpExecArray | null;
    let current = obj;
    while ((match = pathRegex.exec(path)) !== null) {
        const [, prop, , key] = match;
        const nextKey = prop ?? key;
        if (nextKey === 'root') continue; // Skip root
        if (current == null) return undefined;
        current = current[nextKey];
    }

    return current;
}

function onNodeClick(node: any) {
    if (node) {
        const nodePath = node.path || "root"
        console.log(`Clicked node path: ${nodePath}`);
        const value = getValueByPath(schema.value, nodePath);
        if (value === undefined) {
            window.$message.error(`无法找到路径 "${nodePath}" 对应的值`)
            return;
        }
        // copy value to clipboard
        navigator.clipboard.writeText(JSON.stringify(value, null, 2))
            .then(() => {
                window.$message.success(`已复制路径 "${nodePath}" 对应的值到剪贴板`)
            })
            .catch(() => {
                window.$message.error(`复制路径 "${nodePath}" 对应的值到剪贴板失败`)
            });
    }
}
</script>

<style scoped>
:deep(.vjs-tree-node) {
    font-size: 12px;
}

:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
    font-size: 12px;
}

:deep(.vue-json-pretty .vjs-tree-node.is-selected) {
    background-color: #ffe58f !important;
    /* 自定义背景色 */
    color: #000000 !important;
    /* 自定义文字颜色 */
}

:deep(.vjs-tree-node .vjs-key) {
    white-space: nowrap;
}
</style>
