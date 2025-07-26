<template>
    <n-data-table :key="tableKey" :columns="columns" :data="tableData" :bordered="true" size="small" />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { NDataTable } from 'naive-ui'

const props = defineProps<{
    data: Record<string, any[]> // table data: column name → array of values
    name?: string
    indexes?: number[] // list of row indexes to render
    extra?: Record<string, any[]> // list of extra data 
}>()

const tableKey = computed(() => {
    const namePart = props.name ?? ''
    const indexPart = (props.indexes ?? []).join(',')
    const key = `${namePart}-${indexPart}`
    return key === '-' ? 'default-key' : key
})
const columns = computed(() => {
    return [
        { title: '#', key: '__index__' },
        ...Object.keys(props.data).map(key => ({
            title: key,
            key: key
        }))
    ]
})

watch(
    () => props.indexes,
    (newData) => {
        // console.log('New data:', newData)
    },
    { deep: true, immediate: true }
)

const tableData = computed(() => {
    const result: Record<string, any>[] = []
    const columnKeys = Object.keys(props.data)
    const indexSource = props.indexes ?? Object.values(props.data)[0]?.map((_, i) => i) ?? []
    for (let i = 0; i < indexSource.length; i++) {
        const index = indexSource[i]
        const row: Record<string, any> = { __index__: index }
        for (const col of columnKeys) {
            const extraValue = props.extra?.[col]?.[i]
            row[col] = extraValue ? extraValue : props.data[col]?.[index]
        }
        result.push(row)
    }
    return result
})
</script>

<style scoped></style>
