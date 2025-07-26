<template>
    <n-form :model="node" label-placement="top">
        <n-form-item label="名称">
            <n-input v-model:value="node.name" placeholder="请输入节点名称" :allow-input="val => !/\s/.test(val)" />
        </n-form-item>
        <n-form-item label="目标表">
            <div class="flex gap-2 w-full">
                <n-select class="flex-1" v-model:value="node.target_table" :options="tableOptions"
                    placeholder="选择目标表" />
            </div>
        </n-form-item>

        <!-- input_table -->
        <n-form-item label="输入表">
            <div class="flex gap-2 w-full">
                <n-select class="flex-1" v-model:value="node.input_table" :options="tableOptions" placeholder="选择输入表" />
            </div>
        </n-form-item>

        <!-- use_classifier -->
        <n-form-item label="使用分类器">
            <div class="flex items-center">
                <n-switch v-model:value="node.use_classifier" />
            </div>
        </n-form-item>

        <!-- classifier -->
        <n-form-item v-if="node.use_classifier" label="分类器">
            <template #label>
                <div class="flex items-center">
                    <span>分类器</span>
                    <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                            <n-icon size="16" class="ml-1 text-gray-400" style="vertical-align: middle;">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>对物料进行标准化分类</span>
                    </n-tooltip>
                </div>
            </template>
            <n-space vertical class="w-full">
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">目标字段</n-input-group-label>
                    <n-select v-model:value="node.classifier.target_field" :options="getTableKeys(node.target_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择目标字段" />
                </n-input-group>
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">输入字段</n-input-group-label>
                    <n-select v-model:value="node.classifier.input_field" :options="getTableKeys(node.input_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择输入字段" />
                </n-input-group>
            </n-space>
        </n-form-item>

        <!-- Priority -->
        <n-form-item v-if="node.use_classifier" label="优先级">
            <template #label>
                <div class="flex items-center">
                    <span>优先级</span>
                    <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                            <n-icon size="16" class="ml-1 text-gray-400" style="vertical-align: middle;">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>对比时的优先级字段</span>
                    </n-tooltip>
                </div>
            </template>
            <n-space vertical class="w-full">
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">目标字段</n-input-group-label>
                    <n-select v-model:value="node.priority.target_field" :options="getTableKeys(node.target_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择优先级字段" />
                </n-input-group>
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">输入字段</n-input-group-label>
                    <n-select v-model:value="node.priority.input_field" :options="getTableKeys(node.input_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择输入字段" />
                </n-input-group>
            </n-space>
        </n-form-item>

        <!-- Primary Mapping -->
        <n-form-item label="数值匹配字段">
            <template #label>
                <div class="flex items-center">
                    <span>数值匹配字段</span>
                    <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                            <n-icon size="16" class="ml-1 text-gray-400" style="vertical-align: middle;">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>算法会尝试将【目标字段】和【输入字段】转换为浮点数，并自动去除【目标字段】≤ 0 或 empty 的数据，并自动去除【输入字段】≤ 0 或 empty
                            的数据。如果无法转换，则将数据剔除。</span>
                    </n-tooltip>
                </div>
            </template>
            <n-space vertical class="w-full">
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">目标字段</n-input-group-label>
                    <n-select v-model:value="node.primary_mapping.target_field" :options="getTableKeys(node.target_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择目标字段" />
                </n-input-group>
                <n-input-group class="flex items-center w-full">
                    <n-input-group-label style="width: 100px;">输入字段</n-input-group-label>
                    <n-select v-model:value="node.primary_mapping.input_field" :options="getTableKeys(node.input_table, false).map(key => ({
                        label: key,
                        value: key,
                    }))" placeholder="选择输入字段" />
                </n-input-group>
            </n-space>
        </n-form-item>

        <!-- Mappings -->
        <n-form-item label="联动数值">
            <template #label>
                <div class="flex items-center">
                    <span>联动数值</span>
                    <n-tooltip trigger="hover" placement="top">
                        <template #trigger>
                            <n-icon size="16" class="ml-1 text-gray-400" style="vertical-align: middle;">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>算法会尝试将所有联动数值的【输入字段】转换为浮点数。如果无法转换，则将数据剔除。</span>
                    </n-tooltip>
                </div>
            </template>
            <n-dynamic-input v-model:value="node.linked_fields" item-style="margin-bottom: 8px;" show-sort-button>
                <template #default="{ value, index }">
                    <n-space vertical class="w-full">
                        <n-input-group class="flex items-center w-full">
                            <n-input-group-label style="width: 100px;">输入字段</n-input-group-label>
                            <n-select v-model:value="node.linked_fields[index]" :options="getTableKeys(node.input_table, false).map(key => ({
                                label: key,
                                value: key,
                            }))" placeholder="选择输入字段" />
                        </n-input-group>
                    </n-space>
                </template>
            </n-dynamic-input>
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
                            <!-- Status -->
                            <n-gi>
                                <n-checkbox :checked="rule.status === 'enabled'" class="mr-2"
                                    :on-update:checked="(value) => { rule.status = value ? 'enabled' : 'disabled' }"></n-checkbox>
                            </n-gi>
                            <!-- Mode -->
                            <n-gi>
                                <n-input-group class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Mode
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.mode" :options="[
                                        { label: 'Individual', value: ComparisonMode.INDIVIDUAL },
                                        { label: 'Group', value: ComparisonMode.GROUP },
                                    ]" placeholder="选择运行模式" style="width: 220px;" size="tiny" />
                                </n-input-group>
                            </n-gi>
                            <!-- Usage -->
                            <n-gi>
                                <n-input-group class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Usage
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.usage" :options="[
                                        { label: 'Include', value: ResultMode.INCLUDE },
                                        { label: 'Exclude', value: ResultMode.EXCLUDE },
                                    ]" placeholder="选择运行模式" size="tiny" />
                                </n-input-group>
                            </n-gi>
                            <!-- Description -->
                            <n-gi class="input-expression">
                                <n-input-group>
                                    <n-input-group-label size="tiny" class="input-label">Desc</n-input-group-label>
                                    <n-input v-model:value="rule.description" placeholder="请输入规则描述" size="tiny"
                                        type="text" />
                                </n-input-group>
                            </n-gi>
                            <!-- Expression -->
                            <n-gi class="input-expression">
                                <div v-if="rule.mode === 'individual'" class="flex gap-2">
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
                            <!-- Method -->
                            <n-gi class="input-expression">
                                <n-input-group v-if="rule.mode === 'individual'" class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Method
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.method" :options="[
                                        { label: 'Subtract Input', value: 'subtract_input' },
                                        { label: 'Remove Input', value: 'remove_input' },
                                        { label: 'Remove All', value: 'remove_all' },
                                        { label: 'No Action', value: '' }
                                    ]" placeholder="选择映射方式" size="tiny" />
                                </n-input-group>
                                <n-input-group v-else class="flex items-center">
                                    <n-input-group-label size="tiny" class="input-label">
                                        Method
                                    </n-input-group-label>
                                    <n-select v-model:value="rule.method" :options="[
                                        { label: 'Remove All', value: 'remove_all' },
                                        { label: 'No Action', value: '' }
                                    ]" placeholder="选择映射方式" size="tiny" />
                                </n-input-group>
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
import { NForm, NSpace, NFormItem, NSelect, NInput, NDynamicInput, NInputGroup, NInputGroupLabel, NDynamicTags, NCheckbox, NSwitch, NButton, NGrid, NGi, NText, NTooltip, NIcon } from 'naive-ui'
import { computed, ref } from 'vue'
import { useFlowStore } from '@/store/flow'
import SchemaInput from '@/components/shared/SchemaInput.vue'
import ExpressionBuilder from '@/components/expression-builder/ExpressionBuilder.vue'
import { InformationCircle } from '@vicons/ionicons5'

// Comparison mode mirror of backend enum
enum ComparisonMode {
    GROUP = 'group',
    INDIVIDUAL = 'individual',
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
    primary_mapping: {
        target_field: string
        input_field: string
    }
    mapping_method: 'subtract' | 'remove' | 'remove_all' | ''
    linked_fields: string[]
    use_classifier: boolean
    classifier: {
        target_field: string
        input_field: string
    }
    priority: {
        target_field: string
        input_field: string
    }
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

function getTableKeys(tableName?: string, includeTableName: boolean = true): string[] {
    if (!tableName) return []
    const node = flowStore.nodes.find(n => n.data.name === tableName)
    const schema = (node?.data?.outputs as any)?.__TABLE__
    const keys: string[] = []
    if (schema && typeof schema === 'object' && !Array.isArray(schema)) {
        for (const key of Object.keys(schema)) {
            if (includeTableName)
                keys.push(`${tableName}.${key}`)
            else
                keys.push(key)
        }
    }
    return keys
}

function getAllTableKeys(): string[] {
    const keys: string[] = []
    const targetTableName = node.target_table
    const inputTableName = node.input_table
    const targetKeys = getTableKeys(targetTableName, false)
    const inputKeys = getTableKeys(inputTableName, false)
    if (targetTableName) {
        for (const key of targetKeys) {
            keys.push(`${targetTableName}.${key}`)
        }
    }
    if (inputTableName) {
        for (const key of inputKeys) {
            keys.push(`${inputTableName}.${key}`)
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
    width: 70px;
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
