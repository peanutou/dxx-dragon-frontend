<template>
    <div class="p-4">
        <!-- 面包屑导航 -->
        <div style="margin-bottom: 12px;" class="flex items-center gap-2">
            <template v-for="(segment, index) in path" :key="index">
                <n-popselect :options="getAvailableKeys(index).map(k => ({ label: k, value: k }))" :value="path[index]"
                    @update:value="val => onSelectSegment(index, val)" size="small">
                    <n-tag type="info" style="cursor: pointer;">{{ segment }}</n-tag>
                </n-popselect>
            </template>
            <n-button size="tiny" @click="decrementPath">-</n-button>
            <n-button size="tiny" @click="incrementPath">+</n-button>
        </div>
        <div v-if="path[path.length - 1] === '__MAP__'">
            <MapViewer :data="currentData" />
        </div>
        <div v-else-if="path[path.length - 1] === '__TABLE__'">
            <DataTableViewer :data="currentData" />
        </div>
        <div v-else>
            <pre>{{ JSON.stringify(currentData, null, 2) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NTag, NSelect, NButton, NPopselect } from 'naive-ui'
import MapViewer from './MapViewer.vue';
import DataTableViewer from './DataTableViewer.vue';

const props = defineProps<{
    data: any
}>()

const parsedResult = ref<any>(props.data?.data?.node?.outputs?.result)
const path = ref<string[]>([])

watch(
    () => props.data,
    (newData) => {
        parsedResult.value = newData?.data?.node?.outputs?.result
        path.value = []
        const keys = Object.keys(parsedResult.value || {})
        if (keys.length > 0) path.value = [keys[0]]
    },
    { deep: true, immediate: true }
)


const currentData = computed(() => {
    return getCurrentData(parsedResult.value, path.value)
})

function getCurrentData(data: any, path: string[]): any {
    return path.reduce((obj, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), data)
}


function getAvailableKeys(index: number): string[] {
    const subPath = path.value.slice(0, index)
    const base = getCurrentData(parsedResult.value, subPath)
    if (base && typeof base === 'object') {
        return Object.keys(base)
    }
    return []
}

function incrementPath() {
    const current = getCurrentData(parsedResult.value, path.value)
    if (current && typeof current === 'object') {
        const keys = Object.keys(current)
        if (keys.length > 0) {
            path.value.push(keys[0])
        }
    }
}

function decrementPath() {
    if (path.value.length > 1) {
        path.value.pop()
    }
}

function onSelectSegment(index: number, val: string) {
    path.value.splice(index, path.value.length - index, val)
}
</script>

<style scoped></style>