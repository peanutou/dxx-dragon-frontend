<template>
    <div class="expression-builder">
        <ExpressionNode :parent="null" v-model="expressionTree" :column-keys="columnKeys"
            :variable-names="variableNames" @update:expression="handleExpressionUpdate" />
    </div>
</template>

<script setup lang="ts">
import { expressionToString, createDefaultExpression, parseExpression } from './composables/useExpressionBuilder'
import ExpressionNode from './ExpressionNode.vue'
import type { Expression } from './types'
import { ref, watch } from 'vue';

const props = defineProps<{
    modelValue: string
    columnKeys: string[]
    variableNames: string[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const expressionTree = ref<Expression>(
    props.modelValue
        ? parseExpression(props.modelValue)
        : createDefaultExpression('composite')
)

function handleExpressionUpdate(payload: {
    action: 'add-basic' | 'add-composite' | 'remove',
    source: Expression
    parent: Expression | null
}) {
    const { action, source, parent } = payload
    if (action === 'add-basic') {
        if (source.kind === 'composite') {
            source.children.push(createDefaultExpression('basic'))
        }
    } else if (action === 'add-composite') {
        if (source.kind === 'composite') {
            source.children.push(createDefaultExpression('composite'))
        }
    } else if (action === 'remove') {
        if (parent?.kind === 'composite') {
            const index = parent.children.indexOf(source)
            if (index !== -1) {
                parent.children.splice(index, 1)
            }
        }
    }
}

watch(
    () => expressionTree.value,
    (newVal) => {
        emit('update:modelValue', expressionToString(newVal))
        console.log('Expression String:', expressionToString(expressionTree.value))
    },
    { deep: true }
)
</script>

<style scoped>
.expression-builder {
    /* Add any desired styling */
    display: flex;
}
</style>
