<template>
  <n-button class="mb-2" @click="router.push('/flows')">← 返回流程列表</n-button>
  <n-grid :cols="24" x-gap="12" class="h-full">
    <!-- 左侧节点面板 -->
    <n-gi :span="4" class="border-r pr-2">
      <n-card title="节点面板" size="small" class="h-full">
        <div
          v-for="type in nodeTypes"
          :key="type"
          class="draggable-node"
          draggable="true"
          @dragstart="onDragStart($event, type)"
        >
          {{ type }}
        </div>
      </n-card>
    </n-gi>

    <!-- 中间流程画布 -->
    <n-gi :span="14" class="h-full">
      <n-card size="small" class="h-full" content-style="padding: 0">
        <VueFlow
          :nodes="nodes"
          :edges="edges"
          class="h-full"
          @drop="onDrop"
          @dragover="onDragOver"
        />
      </n-card>
    </n-gi>

    <!-- 右侧属性编辑器 -->
    <n-gi :span="6" class="border-l pl-2">
      <n-card title="属性编辑" size="small" class="h-full">
        <div>选中节点后显示其属性（后续实现）</div>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { useRouter } from 'vue-router'

const router = useRouter()

const nodes = ref([])
const edges = ref([])
const nodeTypes = ['Prompt', 'HTTP', 'Regex']

function onDragStart(event: DragEvent, nodeType: string) {
  event.dataTransfer?.setData('node/type', nodeType)
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData('node/type')
  if (!type) return

  const bounds = (event.target as HTMLElement).getBoundingClientRect()
  const position = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top
  }

  nodes.value.push({
    id: `${type}-${+new Date()}`,
    type: 'default',
    position,
    data: { label: `${type} 节点` }
  })
}
</script>

<style scoped>
.h-full {
  height: 100%;
}
.draggable-node {
  padding: 6px 8px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: grab;
  user-select: none;
  background: #f9f9f9;
}
</style>
