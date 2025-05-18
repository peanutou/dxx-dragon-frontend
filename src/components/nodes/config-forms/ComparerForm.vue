<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" />
        </n-form-item>
        <n-form-item label="Target Table">
            <div class="flex gap-2 w-full">
                <n-select class="flex-1" v-model:value="node.target_table" :options="tableOptions"
                    placeholder="选择目标表" />
            </div>
        </n-form-item>

        <n-form-item label="Input Table">
            <div class="flex gap-2 w-full">
                <n-select class="flex-1" v-model:value="node.input_table" :options="tableOptions" placeholder="选择输入表" />
            </div>
        </n-form-item>

        <!-- Rules Editor -->
        <n-form-item label="Group Rules">
            <n-dynamic-input v-model:value="node.rules" item-style="margin-bottom: 8px;" :on-create="() => ({
                mode: ComparisonMode.INDIVIDUAL,
                expression: '',
            })" show-sort-button>
                <template #default="{ value: rule, index }">
                    <n-space vertical :size="12">
                        <n-select v-model:value="rule.mode" :options="[
                            { label: 'Individual', value: 'individual' },
                            { label: 'Individual Group', value: 'individual_group' },
                            { label: 'Group', value: 'group' },
                        ]" placeholder="选择运行模式" />
                        <div v-if="rule.mode === 'individual' || rule.mode === 'individual_group'" class="flex gap-2">
                            <n-input v-model:value="rule.expression" placeholder="Expression" />
                            <n-button text type="primary" @click="() => { onEdit(index, 'expression') }">编辑</n-button>
                        </div>
                        <div v-else-if="rule.mode === 'group'" class="flex flex-col gap-2">
                            <div class="flex gap-2">
                                <n-input v-model:value="rule.target_expression" placeholder="Target Expression" />
                                <n-button text type="primary"
                                    @click="() => { onEdit(index, 'target_expression') }">编辑</n-button>
                            </div>
                            <div class="flex gap-2">
                                <n-input v-model:value="rule.input_expression" placeholder="Input Expression" />
                                <n-button text type="primary"
                                    @click="() => { onEdit(index, 'input_expression') }">编辑</n-button>
                            </div>
                        </div>
                    </n-space>
                </template>
            </n-dynamic-input>
        </n-form-item>
    </n-form>

    <!-- ExpressionBuilder modal -->
    <n-modal v-model:show="showExprBuilder" title="Expression Builder" preset="dialog" style="width: 80%;">
        <ExpressionBuilder v-model="currentExpr" :column-keys="(() => {
            if (currentExprKey === 'expression') {
                return getAllTableKeys()
            } else if (currentExprKey === 'target_expression') {
                return getTableKeys(node.target_table)
            } else if (currentExprKey === 'input_expression') {
                return getTableKeys(node.input_table)
            }
            return []
        })()" :variable-names="Object.keys(flowStore.variables)" />
        <template #action>
            <n-button type="primary" @click="onModalClose">保存表达式</n-button>
        </template>
    </n-modal>
</template>

<script setup lang="ts">
import { NForm, NFormItem, NSelect, NInput, NDynamicInput, NSpace, NButton } from 'naive-ui'
import { computed, ref } from 'vue'
import { useFlowStore } from '@/store/flow'
import SchemaInput from '@/components/shared/SchemaInput.vue'
import ExpressionBuilder from '@/components/expression-builder/ExpressionBuilder.vue'

// Comparison mode mirror of backend enum
enum ComparisonMode {
    GROUP = 'group',
    INDIVIDUAL = 'individual'
}

// Comparer node configuration interface
interface ComparerNodeConfig /* extends BaseNodeConfig */ {
    type: string
    name: string
    target_table: string
    input_table: string
    frontend: {
        id: string
    }
    rules: {
        mode: ComparisonMode
        expression: string
        target_expression: string
        input_expression: string
    }[]
}

const { node } = defineProps<{ node: ComparerNodeConfig }>()

const showExprBuilder = ref(false)
const currentExprIndex = ref<number>()
const currentExpr = ref<string>('')
const currentExprKey = ref<'expression' | 'target_expression' | 'input_expression'>('expression')

function onEdit(index: number, key: 'expression' | 'target_expression' | 'input_expression' = 'expression') {
    currentExprIndex.value = index
    currentExprKey.value = key
    currentExpr.value = node.rules[index][key] || ''
    showExprBuilder.value = true
}
function onModalClose() {
    if (
        currentExprIndex.value !== null &&
        currentExprIndex.value != undefined &&
        currentExpr.value !== null &&
        currentExprKey.value
    ) {
        node.rules[currentExprIndex.value][currentExprKey.value] = currentExpr.value
    }
    showExprBuilder.value = false
}

const flowStore = useFlowStore()

// Computed options for table selection populated from incoming nodes
const tableOptions = computed(() => {
    const targetId = node.frontend.id
    const incoming = flowStore.edges.filter(e => e.target === targetId)
    return incoming
        .map(e => {
            const src = flowStore.nodes.find(n => n.id === e.source)
            return src?.data.outputs_schema && (src.data.outputs_schema as any).__TABLE__
                ? { label: src.data.name, value: src.data.name }
                : null
        })
        .filter((opt): opt is { label: string; value: string } => opt !== null)
})

function getTableKeys(tableName?: string): string[] {
    if (!tableName) return []
    const node = flowStore.nodes.find(n => n.data.name === tableName)
    const schema = (node?.data?.outputs_schema as any)?.__TABLE__
    const keys: string[] = []
    if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
        for (const key of Object.keys(schema)) {
            keys.push(`${tableName}.${key}`)
        }
    }
    return keys
}

function getAllTableKeys(): string[] {
    const keys: string[] = []
    for (const option of tableOptions.value) {
        const node = flowStore.nodes.find(n => n.data.name === option.value)
        const schema = (node?.data?.outputs_schema as any)?.__TABLE__
        if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
            for (const key of Object.keys(schema)) {
                keys.push(`${option.value}.${key}`)
            }
        }
    }
    return keys
}

</script>

<style scoped>
/* 可选样式 */
</style>
