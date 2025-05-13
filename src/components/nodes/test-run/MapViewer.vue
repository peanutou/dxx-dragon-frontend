<template>
    <n-layout v-for="(section, index) in sections" :key="index" style="margin-bottom: 16px;" bordered embedded>
        <n-layout-header class="flex gap-2 flex-col mb-2">
            <n-tag type="info" size="small">Section {{ index + 1 }}</n-tag>
            <div class="flex gap-2 flex-wrap">
                <template v-for="(val, key) in section.__METADATA__" :key="key">
                    <n-thing size="small" class="flex gap-2 flex-wrap items-center">
                        <n-tag type="info" size="small" :style="{ cursor: 'pointer' }">
                            {{ key }}:
                        </n-tag>
                        <n-ellipsis :style="{ maxWidth: '250px' }" class="mx-2">
                            {{ val }}
                        </n-ellipsis>
                    </n-thing>
                </template>
            </div>
        </n-layout-header>
        <n-layout-content>
            <div class="flex flex-col gap-2">
                <n-layout v-for="(group, groupIndex) in section.__INDEXES__" :key="Math.random()" class="p-2" embedded
                    bordered>
                    <n-layout-header>
                        <n-tag type="success" size="small">Group {{ groupIndex + 1 }}</n-tag>
                    </n-layout-header>
                    <n-layout-content>
                        <div class="flex flex-row gap-4 pt-2">
                            <DataTableViewer v-for="tableName in Object.keys(group)" :key="tableName"
                                :data="tables[tableName] || {}" :name="tableName" :indexes="group[tableName]" />
                        </div>
                    </n-layout-content>
                </n-layout>
            </div>
            <!-- <pre>{{ JSON.stringify(section, null, 2) }}</pre> -->
        </n-layout-content>
    </n-layout>
    <!-- <n-divider>Tables</n-divider> -->
    <!-- <pre>{{ JSON.stringify(tables, null, 2) }}</pre> -->
</template>

<script setup lang="ts">
import { NTag, NLayout, NLayoutHeader, NLayoutContent, NTooltip, NEllipsis } from 'naive-ui'
import { ref, computed, watch } from 'vue'
import DataTableViewer from './DataTableViewer.vue';
const props = defineProps<{
    data: any
}>()
const tables = ref<Record<string, Record<string, any[]>>>(props.data.__TABLES__)
const sections = ref<any[]>(props.data.__SECTIONS__)
watch(
    () => props.data,
    (newData) => {
        tables.value = newData.__TABLES__
        sections.value = newData.__SECTIONS__
    },
    { deep: true, immediate: true }
)
</script>

<style scoped></style>