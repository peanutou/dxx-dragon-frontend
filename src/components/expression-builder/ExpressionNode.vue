<template>
    <div class="expr-node">
        <!-- Basic expression -->
        <template v-if="expr.kind === 'basic'">
            <n-grid cols="24" x-gap="12" align="center">
                <n-gi :span="11">
                    <OperandPicker v-model="expr.left" :keys="targetKeys" label="Target Field" source="target" />
                </n-gi>
                <n-gi :span="2">
                    <OperatorPicker v-model="expr.op" />
                </n-gi>
                <n-gi :span="11">
                    <OperandPicker v-model="expr.right" :keys="inputKeys" label="Input Field" source="input" />
                </n-gi>
            </n-grid>
        </template>

        <!-- Composite expression -->
        <template v-else>
            <select v-model="expr.operator">
                <option value="and">AND</option>
                <option value="or">OR</option>
            </select>
            <ExpressionNode
                v-for="(child, index) in expr.children"
                :key="index"
                :parent="expr"
                v-model="expr.children[index]"
                :target-keys="targetKeys"
                :input-keys="inputKeys"
                :variable-names="variableNames"
                @update:expression="$emit('update:expression', $event)"
            />
        </template>

        <!-- Controls -->
        <div class="expr-controls">
            <n-button v-if="modelValue.kind != 'basic'" type="primary" size="tiny" @click="addBasic">+ Basic</n-button>
            <n-button v-if="modelValue.kind != 'basic'" type="primary" size="tiny" @click="addComposite">+ Composite</n-button>
            <n-button v-if="parent" type="warning" size="tiny" @click="removeNode">– Remove</n-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { NSpace, NGrid, NGi, pProps, NButton } from 'naive-ui'
import ExpressionNode from './ExpressionNode.vue'
import OperandPicker from './OperandPicker.vue'
import OperatorPicker from './OperatorPicker.vue'
import type { Expression } from './types'

const props = defineProps<{
    parent: Expression | null
    modelValue: Expression
    targetKeys: string[]
    inputKeys: string[]
    variableNames: string[]
}>()

const emit = defineEmits<{
    (e: 'update:expression', payload: {
        action: 'add-basic' | 'add-composite' | 'remove',
        source: Expression,
        parent: Expression | null
    }): void
    (e: 'update:modelValue', value: Expression): void
}>()

const expr = props.modelValue as Expression

watch(
    () => expr,
    (newVal) => emit('update:modelValue', newVal),
    { deep: true }
)

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
    width: 100%;
    border: 1px solid #ccc;
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
    align-items: center;
    width: 100%;
}
</style>