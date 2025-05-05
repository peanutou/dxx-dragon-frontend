<template>
    <div class="expression-builder">
        <ExpressionNode
            :parent="null"
            v-model="expressionTree" 
            :target-keys="targetKeys" 
            :input-keys="inputKeys"
            :variable-names="variableNames"
            @update:expression="handleExpressionUpdate"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ExpressionNode from './ExpressionNode.vue'
import type { Expression } from './types'

// Define props for v-model and data sources
const props = defineProps<{
    modelValue: Expression
    targetKeys: string[]
    inputKeys: string[]
    variableNames: string[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: Expression): void
    (e: 'update:expression', payload: {
        action: 'add-basic' | 'add-composite' | 'remove',
        path: number[],
        source: Expression,
        parent: Expression | null
    }): void
}>()

// Two-way binding for the expression tree
const expressionTree = computed<Expression>({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
})

function handleExpressionUpdate(payload: {
    action: 'add-basic' | 'add-composite' | 'remove',
    source: Expression
    parent: Expression | null
}) {
    const { action, source, parent } = payload
    console.log('Action:', action)
    if (action === 'add-basic') {
        const newExpr: Expression = {
            kind: 'basic',
            left: { source: 'value', value: '' },
            op: 'equal',
            right: { source: 'value', value: '' }
        }
        if (source.kind === 'composite') {
            source.children.push(newExpr)
        }
    } else if (action === 'add-composite') {
        const newExpr: Expression = {
            kind: 'composite',
            operator: 'and',
            children: []
        }
        if (source.kind === 'composite') {
            source.children.push(newExpr)
        }
    } else if (action === 'remove') {
        if (parent?.kind === 'composite') {
            const index = parent.children.indexOf(source)
            if (index !== -1) {
                parent.children.splice(index, 1)
            }
        }
    }

    emit('update:modelValue', expressionTree.value)
}
</script>

<style scoped>
.expression-builder {
    /* Add any desired styling */
    display: flex;
}
</style>
