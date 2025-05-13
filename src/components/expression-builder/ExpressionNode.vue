<template>
    <div class="expr-node">
        <!-- Basic expression -->
        <template v-if="expr.kind === 'basic'">
            <n-grid cols="24" x-gap="12" y-gap="12" class="basic-expr">
                <n-gi :span="10">
                    <OperandPicker v-model="expr.left" :column-keys="columnKeys" :variable-names="variableNames"
                        label="Expression" source="value" />
                </n-gi>
                <n-gi :span="4">
                    <OperatorPicker v-model="expr.op" />
                </n-gi>
                <n-gi :span="10">
                    <OperandPicker v-model="expr.right" :variable-names="variableNames" :column-keys="columnKeys"
                        label="Expression" source="value" />
                </n-gi>
            </n-grid>
        </template>

        <!-- Composite expression -->
        <template v-else>
            <select v-model="expr.operator">
                <option value="and">AND</option>
                <option value="or">OR</option>
            </select>
            <ExpressionNode v-for="(child, index) in expr.children" :key="child.id" :parent="expr"
                v-model="expr.children[index]" :column-keys="columnKeys" :variable-names="variableNames"
                @update:expression="$emit('update:expression', $event)" />
        </template>

        <!-- Controls -->
        <div class="expr-controls">
            <n-button v-if="modelValue.kind != 'basic'" type="primary" size="tiny" @click="addBasic">+ Basic</n-button>
            <n-button v-if="modelValue.kind != 'basic'" type="primary" size="tiny" @click="addComposite">+
                Composite</n-button>
            <n-button v-if="parent" type="warning" size="tiny" @click="removeNode">– Remove</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NGrid, NGi, NButton } from 'naive-ui'
import ExpressionNode from './ExpressionNode.vue'
import OperandPicker from './OperandPicker.vue'
import OperatorPicker from './OperatorPicker.vue'
import type { Expression } from './types'

const props = defineProps<{
    parent: Expression | null
    modelValue: Expression
    columnKeys: string[]
    variableNames: string[]
}>()
const expr = props.modelValue as Expression
const emit = defineEmits<{
    (e: 'update:expression', payload: {
        action: 'add-basic' | 'add-composite' | 'remove',
        source: Expression,
        parent: Expression | null
    }): void
    (e: 'update:modelValue', value: Expression): void
}>()


function addBasic() {
    emit('update:expression', {
        action: 'add-basic',
        source: expr,
        parent: props.parent
    })
}

function addComposite() {
    emit('update:expression', {
        action: 'add-composite',
        source: expr,
        parent: props.parent
    })
}

function removeNode() {
    emit('update:expression', {
        action: 'remove',
        source: expr,
        parent: props.parent
    })
}
</script>

<style scoped>
.expr-node {
    flex-grow: 1;
    border: 1px solid #ccc;
    box-sizing: border-box;
    padding: 8px;
    margin: 4px;
}

.expr-controls {
    display: flex;
    margin-top: 8px;
    gap: 8px;
}

.basic-expr {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}
</style>