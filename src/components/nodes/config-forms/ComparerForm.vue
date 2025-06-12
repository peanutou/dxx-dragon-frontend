<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)" />
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
                    <n-space vertical class="w-full border-b pb-2 border-b-1 border-b-gray-300">
                        <n-grid :cols="3" x-gap="8" y-gap="8" class="input-grid">
                            <n-gi>
                                <n-checkbox :checked="rule.status === 'enabled'" class="mr-2"
                                    @change="(value) => { rule.status = value ? 'enabled' : 'disabled' }"></n-checkbox>
                            </n-gi>
                            <n-gi>
                                <n-input-group class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Mode
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.mode" :options="[
                                        { label: 'Individual', value: ComparisonMode.INDIVIDUAL },
                                        { label: 'Group', value: ComparisonMode.GROUP },
                                        { label: 'Individual Group', value: ComparisonMode.INDIVIDUAL_GROUP },
                                    ]" placeholder="选择运行模式" style="width: 220px;" size="tiny" />
                                </n-input-group>
                            </n-gi>
                            <n-gi>
                                <n-input-group class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Usage
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.usage" :options="[
                                        { label: 'Include', value: ResultMode.INCLUDE },
                                        { label: 'Exclude', value: ResultMode.EXCLUDE },
                                        { label: 'Subtract', value: ResultMode.SUBTRACT },
                                    ]" placeholder="选择运行模式" size="tiny" />
                                </n-input-group>
                            </n-gi>
                            <n-gi class="input-expression">
                                <n-input-group>
                                    <n-input-group-label size="tiny" class="input-label">Desc</n-input-group-label>
                                    <n-input v-model:value="rule.description" placeholder="请输入规则描述" size="tiny"
                                        type="text" />
                                </n-input-group>
                            </n-gi>
                            <n-gi class="input-expression">
                                <div v-if="rule.mode === 'individual' || rule.mode === 'individual_group'"
                                    class="flex gap-2">
                                    <n-input-group class="flex items-center">
                                        <n-input-group-label size="tiny" class="input-label">
                                            Expr
                                        </n-input-group-label>
                                        <n-input v-model:value="rule.expression" placeholder="Expression" size="tiny" />
                                        <n-button type="primary" @click="() => { onEdit(index, 'expression') }"
                                            size="tiny">编辑</n-button>
                                    </n-input-group>
                                </div>
                                <div v-else-if="rule.mode === 'group'" class="flex flex-col gap-2">
                                    <div class="flex gap-2">
                                        <n-input-group class="flex items-center">
                                            <n-input-group-label size="tiny" class="input-label">
                                                Expr
                                            </n-input-group-label>
                                            <n-input v-model:value="rule.target_expression"
                                                placeholder="Target Expression" size="tiny" />
                                            <n-button type="primary"
                                                @click="() => { onEdit(index, 'target_expression') }"
                                                size="tiny">编辑</n-button>
                                        </n-input-group>
                                    </div>
                                    <div class="flex gap-2">
                                        <n-input-group class="flex items-center">
                                            <n-input-group-label size="tiny" class="input-label">
                                                Expr
                                            </n-input-group-label>
                                            <n-input v-model:value="rule.input_expression"
                                                placeholder="Input Expression" size="tiny" />
                                            <n-button type="primary"
                                                @click="() => { onEdit(index, 'input_expression') }"
                                                size="tiny">编辑</n-button>
                                        </n-input-group>
                                    </div>
                                </div>
                            </n-gi>
                        </n-grid>
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
import { NForm, NFormItem, NSelect, NInput, NDynamicInput, NInputGroup, NInputGroupLabel, NDynamicTags, NCheckbox, NSwitch, NButton, NGrid, NGi } from 'naive-ui'
import { computed, ref } from 'vue'
import { useFlowStore } from '@/store/flow'
import SchemaInput from '@/components/shared/SchemaInput.vue'
import ExpressionBuilder from '@/components/expression-builder/ExpressionBuilder.vue'

// Comparison mode mirror of backend enum
enum ComparisonMode {
    GROUP = 'group',
    INDIVIDUAL = 'individual',
    INDIVIDUAL_GROUP = 'individual_group',
}

enum ResultMode {
    INCLUDE = 'include',
    EXCLUDE = 'exclude',
    SUBTRACT = 'subtract',
}

// Comparer node configuration interface
interface ComparerNodeConfig /* extends BaseNodeConfig */ {
    id: string
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
    const targetId = node.id
    const nodes = flowStore.nodes
    return nodes
        .filter(n =>
            n.data.outputs &&
            typeof n.data.outputs === 'object' &&
            !Array.isArray(n.data.outputs) &&
            '__TABLE__' in n.data.outputs &&
            n.id !== targetId
        )
        .map(n => ({
            label: n.data.name,
            value: n.data.name,
        }))
})

function getTableKeys(tableName?: string): string[] {
    if (!tableName) return []
    const node = flowStore.nodes.find(n => n.data.name === tableName)
    const schema = (node?.data?.outputs as any)?.__TABLE__
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
        const schema = (node?.data?.outputs as any)?.__TABLE__
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
.input-label {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 60px;
    font-weight: bold;
}

.input-expression {
    grid-column: span 3 !important;
    padding-left: 26px;
}

.input-grid {
    display: grid;
    flex-wrap: wrap;
    width: 100%;
    grid-template-columns: 18px 220px 1fr !important;
}
</style>
