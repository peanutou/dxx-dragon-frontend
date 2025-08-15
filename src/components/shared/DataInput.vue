<template>
    <n-tree-select v-model:value="modelValue"
                   :options="treeOptions"
                   :show-path="true"
                   :multiple="false"
                   :show-checkbox="false"
                   :show-icon="true"
                   :filterable="true"
                   :on-load="handleLoadMore"
                   placeholder="请选择输入数据" />
</template>

<script setup lang="ts">
import { TreeSelectOption, NTreeSelect } from 'naive-ui'
import { Ref, ref, h, VNode, onMounted } from 'vue';
import { useFlowStore } from '@/store/flow';
import type { FieldConfig } from '@/store/flow';
import { Node } from '@vue-flow/core'

const modelValue = defineModel<string>()
const flowStore = useFlowStore()
function renderSuffix(suffix: string): VNode {
    return h('span', { style: 'margin-right: 10px; color: #aaa; font-size: 12px;' }, suffix);
}

const treeOptions: Ref<TreeSelectOption[]> = ref([
    {
        label: `inputs`,
        key: 'inputs',
        isLeaf: false,
        category: 'i',
        suffix: () => renderSuffix('object'),
    },
    {
        label: `variables`,
        key: 'variables',
        isLeaf: false,
        category: 'v',
        suffix: () => renderSuffix('object'),
    },
    {
        label: `outputs`,
        key: 'outputs',
        isLeaf: false,
        category: 'o',
        suffix: () => renderSuffix('object'),
    },
]);

function typeOf(value: any): string {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function getSchemaType(schema: any): string {
    if (schema === null) return 'null';
    if (typeOf(schema) === 'string') return schema;
    if (typeOf(schema) === 'array') return `array<${schema[0]}>`;
    if (typeOf(schema) === 'object') return 'object';
    return 'string';
}

function buildOptionChildren(option: TreeSelectOption, schema: any): TreeSelectOption[] {
    const children: TreeSelectOption[] = [];
    if (!schema) return children;
    Object.keys(schema).forEach(key => {
        const value = schema[key];
        const schemaType = getSchemaType(value);
        const child = {
            label: key,
            key: `${option.key}.${key}`,
            isLeaf: schemaType !== 'object' || (schemaType === 'object' && Object.keys(value).length === 0),
            category: `${option.category}.c`,
            suffix: () => renderSuffix(schemaType),
        } as TreeSelectOption;
        if (!child.isLeaf) {
            child.children = buildOptionChildren(child, value);
        }
        children.push(child);
    });
    return children;
}

function getChildrenOptions(option: TreeSelectOption): TreeSelectOption[] {
    const children: TreeSelectOption[] = [];
    // inputs
    if (option.category === 'i') {
        flowStore.inputs.forEach((input: FieldConfig) => {
            children.push({
                label: input.name,
                key: `inputs.${input.name}`,
                isLeaf: true,
                category: 'i.c',
                suffix: () => renderSuffix(input.type === 'array' ? `array<any>` : input.type),
            });
        });
    }
    // variables
    else if (option.category === 'v') {
        flowStore.variables.forEach((variable: FieldConfig) => {
            children.push({
                label: variable.name,
                key: `variables.${variable.name}`,
                isLeaf: true,
                category: 'v.c',
                suffix: () => renderSuffix(variable.type === 'array' ? `array<any>` : variable.type),
            });
        });
    }
    // outputs
    else if (option.category === 'o') {
        if (!flowStore.nodes || !Array.isArray(flowStore.nodes)) return [];
        flowStore.nodes.forEach((node: Node) => {
            // if (node.parentNode) return; // Skip child nodes
            const schemaType = getSchemaType(node.data.outputs);
            children.push({
                label: node.data.name,
                key: `outputs.${node.data.name}`,
                isLeaf: schemaType !== 'object' || (schemaType == 'object' && Object.keys(node.data.outputs || {}).length === 0),
                category: 'o.c',
                suffix: () => renderSuffix(schemaType),
            });
        });
    }
    // inputs children
    else if (option.category === 'o.c') {
        const node = flowStore.nodes.find(n => n.data.name === option.label);
        if (node && node.data.outputs) {
            buildOptionChildren(option, node.data.outputs).forEach(child => {
                children.push(child);
            });
        }
    }
    return children;
}

function handleLoadMore(option: TreeSelectOption): Promise<void> {
    return new Promise<void>((resolve) => {
        // Simulate an asynchronous operation to load children
        window.setTimeout(() => {
            option.children = getChildrenOptions(option);
            resolve();
        }, 500); // Simulate network delay
    });
}

onMounted(() => {
    if (!modelValue.value) {
        return;
    }
    const keys = modelValue.value.split('.').slice(0, 3);
    let currentOption: TreeSelectOption | undefined = treeOptions.value.find(opt => opt.key === keys[0]);
    if (!currentOption) {
        console.warn(`Root option not found for key: ${keys[0]}`);
        return;
    }
    // Traverse through the keys to find the nested option
    for (let i = 1; i < keys.length; i++) {
        if (!currentOption) {
            console.warn(`Option not found for key: ${keys[i]} in path: ${modelValue.value}`);
            return;
        }
        currentOption.children = getChildrenOptions(currentOption);
        const nextKey: string = `${currentOption.key}.${keys[i]}`;
        const nextOption: TreeSelectOption | undefined = currentOption && currentOption.children
            ? currentOption.children.find(child => child.key === nextKey)
            : undefined;
        currentOption = nextOption || undefined;
    }
});

</script>

<style scoped></style>