<template>
    <n-input ref="inputRef" v-model:value="modelValue" v-bind="$attrs" @keydown="handleKeydown" @keyup="handleKeyup"
        placeholder="变量的推荐写法：{{ inputs.a | tojson }}，tojson 可以让表达式渲染结果与 JSON 兼容，否则可能会出错。" />
    <div v-if="suggestionState.show" class="suggestion-popup" :style="popupStyle">
        <div v-for="(s, i) in suggestionState.suggestions" :key="s" class="suggestion-item" :style="getItemStyle(i)"
            @mousedown.prevent="selectSuggestion(s)">
            {{ s }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { NInput, useThemeVars } from 'naive-ui'
import { ref, reactive, watch, computed, type CSSProperties } from 'vue'
import { useFlowStore } from '@/store/flow'

const modelValue = defineModel<string>()
const inputRef = ref<InstanceType<typeof NInput> | null>(null)

const suggestionState = reactive({
    show: false,
    suggestions: [] as string[],
    cursor: 0,
    activeIndex: 0
})

const flowStore = useFlowStore()
watch(
    () => flowStore.getFlowState(),
    (flow) => {
        // console.log('🎯 Flow changed:', flow)
        const inputs = flow.inputs?.map(i => `inputs.${i.name}`) ?? []
        const variables = flow.variables?.map(n => `${n.name}`) ?? []
        const nodes = flow.nodes?.map(n => `${n.data.name}`) ?? []
        suggestionState.suggestions = [...inputs, ...variables, ...nodes]
    },
    { immediate: true, deep: true }
)

const themeVars = useThemeVars()

const popupStyle = computed(() => ({
    position: 'absolute',
    border: '1px solid #ccc',
    padding: '4px',
    zIndex: 10,
    backgroundColor: themeVars.value.bodyColor,
    color: themeVars.value.textColor1,
} as CSSProperties))

const getItemStyle = (index: number) => ({
    padding: '2px 4px',
    cursor: 'pointer',
    background: suggestionState.activeIndex === index
        ? themeVars.value.primaryColor
        : themeVars.value.bodyColor,
    color: themeVars.value.textColor1,
})

function getInputElement() {
    const inputType = inputRef.value?.type
    if (!inputType) {
        console.warn('❌ Input type not found')
        return null
    }
    if (inputType === 'textarea') {
        return inputRef.value?.$el.querySelector('textarea') as HTMLTextAreaElement | null
    } else if (inputType === 'text') {
        return inputRef.value?.$el.querySelector('input') as HTMLInputElement | null
    }
    console.warn('❌ Unsupported input type:', inputType)
    return null
}

function selectSuggestion(suggestion: string) {
    const input = getInputElement()
    if (!input) return
    const cursor = input.selectionStart ?? 0
    const text = modelValue.value || ''
    const insertion = ` ${suggestion} | tojson ` + '}}'
    modelValue.value = text.slice(0, cursor).trim() + insertion + text.slice(cursor)
    suggestionState.show = false
}

function handleKeyup(e: KeyboardEvent) {
    if (e.key === '{') {
        const input = getInputElement()
        if (!input) return
        const cursor = input.selectionStart ?? 0
        const text = (modelValue.value || '').slice(0, cursor)
        // console.log(cursor, modelValue.value, text)
        if (text.endsWith('{{')) {
            // console.log('🎯 Trigger suggestions at:', cursor)
            suggestionState.show = true
            suggestionState.cursor = cursor
        }
    } else if (e.key === 'Escape') {
        suggestionState.show = false
    } else if (e.key === 'ArrowDown') {
        if (suggestionState.show) {
            suggestionState.activeIndex = (suggestionState.activeIndex + 1) % suggestionState.suggestions.length
            e.preventDefault()
            e.stopPropagation()
        }
    } else if (e.key === 'ArrowUp') {
        if (suggestionState.show) {
            suggestionState.activeIndex = (suggestionState.activeIndex - 1 + suggestionState.suggestions.length) % suggestionState.suggestions.length
            e.preventDefault()
            e.stopPropagation()
        }
    } else if (e.key === 'Enter' && suggestionState.show) {
        selectSuggestion(suggestionState.suggestions[suggestionState.activeIndex])
        e.preventDefault()
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (suggestionState.show && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault()
        e.stopPropagation()
    }
}
</script>