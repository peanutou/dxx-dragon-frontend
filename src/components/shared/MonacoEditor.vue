<template>
    <div ref="containerRef"
         style="width: 100%; height: 100%;"
         :style="{ minHeight: height ? height : '400px' }"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'

// 父组件可以传入 code 和 language
const props = defineProps<{
    modelValue?: string,
    defaultValue?: string,
    language?: string,
    height?: string | number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
    getWorker(_: string, label: string) {
        switch (label) {
            case 'json': return new JsonWorker()
            case 'css':
            case 'scss':
            case 'less': return new CssWorker()
            case 'html':
            case 'handlebars':
            case 'razor': return new HtmlWorker()
            case 'typescript':
            case 'javascript': return new TsWorker()
            default: return new EditorWorker()
        }
    }
}

onMounted(() => {
    if (containerRef.value) {
        if (editor) {
            editor.dispose() // 确保之前的编辑器被销毁
        }
        // 创建 Monaco 编辑器实例
        const initValue = props.defaultValue || props.modelValue || '';
        editor = monaco.editor.create(containerRef.value, {
            value: initValue,
            language: props.language || 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,  // 自动适应容器大小
        })

        // 同步编辑器变化到父组件
        editor.onDidChangeModelContent(() => {
            emit('update:modelValue', editor!.getValue())
        })
    }
})

// 响应外部 value 的变化
watch(() => props.modelValue, (newVal) => {
    if (editor && newVal !== undefined && newVal !== editor.getValue()) {
        editor.setValue(newVal)
    }
})

// 销毁编辑器
onBeforeUnmount(() => {
    if (editor) {
        editor.dispose()
    }
})
</script>

<style scoped>
/* 可根据需要自定义高度和样式 */
</style>