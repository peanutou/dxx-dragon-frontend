<template>
  <div>
    <!-- 快速创建流程模态框 -->
    <n-modal v-model:show="showCreateModal" title="创建流程" preset="dialog">
      <n-form :model="createForm" ref="formRef" label-width="80">
        <n-form-item label="名称" path="name" :rule="nameRules">
          <n-input v-model:value="createForm.name" placeholder="请输入流程名称" />
        </n-form-item>
        <n-form-item label="描述" path="description">
          <n-input v-model:value="createForm.description" type="textarea" placeholder="流程描述（可选）" />
        </n-form-item>
        <n-form-item label="版本" path="version" :rule="versionRules">
          <n-input v-model:value="createForm.version" placeholder="1.0" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showCreateModal = false">取消</n-button>
        <n-button type="primary" @click="submitCreate">创建</n-button>
      </template>
    </n-modal>

    <n-card title="流程列表">
      <div class="mb-4 flex justify-between items-center">
        <n-space>
          <n-button type="primary" @click="showCreateModal = true">创建流程</n-button>
        </n-space>
      </div>
      <n-data-table
        :columns="columns"
        :data="flows"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        remote
        :row-key="(row: Flow) => row.flow_id"
        @update:sorter="handleSorterChange"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDataTable, NButton, NSpace, NModal, NForm, NFormItem, NInput } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import axios from '@/utils/axios'

interface Flow {
  flow_id: string
  name: string
  description: string
  version: string
  created_at: string
}

const router = useRouter()
const flows = ref<Flow[]>([])
const loading = ref(false)
const total = ref(0)
const pageSize = ref(10)
const page = ref(1)
const sortColumn = ref<string | null>(null)
const sortOrder = ref<'ascend' | 'descend' | null>(null)

const pagination = ref({ pageSize: pageSize.value, page: page.value, itemCount: total.value })

const columns: DataTableColumns<Flow> = [
  {
    title: '名称',
    key: 'name',
    sorter: true,
    render: (row) =>
      h(
        'a',
        {
          href: 'javascript:void(0)',
          onClick: () => router.push({ name: 'FlowEditor', params: { id: row.flow_id } }),
          style: { color: '#18a058', cursor: 'pointer' }
        },
        row.name
      )
  },
  {
    title: '描述',
    key: 'description',
    render: (row) => h('span', row.description || '-')
  },
  {
    title: '版本',
    key: 'version',
    sorter: true
  },
  {
    title: '创建时间',
    key: 'created_at',
    render: (row) => new Date(row.created_at).toLocaleString(),
    sorter: true
  }
]

const fetchFlows = async () => {
  loading.value = true
  try {
    const res = await axios.get('/flows', {
      params: {
        page: page.value,
        size: pageSize.value,
        sort_by: sortColumn.value,
        order: sortOrder.value === 'ascend' ? 'asc' : sortOrder.value === 'descend' ? 'desc' : undefined
      }
    })
    flows.value = res.data.data?.flows || []
    total.value = res.data.data?.total || 0
    pagination.value = {
      pageSize: pageSize.value,
      page: page.value,
      itemCount: total.value
    }
  } catch (err) {
    console.error('获取流程失败:', err)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchFlows()
}

const handleSorterChange = (sorter: any) => {
  if (sorter === null) {
    sortColumn.value = null
    sortOrder.value = null
  } else {
    sortColumn.value = sorter.columnKey
    sortOrder.value = sorter.order
  }
  fetchFlows()
}

const showCreateModal = ref(false)
const formRef = ref()
const createForm = ref({
  name: '',
  description: '',
  version: '1.0'
})

const nameRules = [
  {
    required: true,
    validator: (rule: any, value: string) => {
      if (value.length < 3) return new Error('名称不能少于 3 个字符')
      if (/\s/.test(value)) return new Error('名称不能包含空格')
      if (!/^[\w\-一-龥]+$/.test(value)) return new Error('名称只能包含中英文、数字、下划线和短横线')
      return true
    },
    trigger: ['input', 'blur']
  }
]

const versionRules = [
  {
    required: true,
    validator: (rule: any, value: string) => {
      if (!/^[\d.]+$/.test(value)) return new Error('版本号只能包含数字和英文句点')
      if (value.length > 20) return new Error('版本号不能超过 20 个字符')
      return true
    },
    trigger: ['input', 'blur']
  }
]

const submitCreate = async () => {
  try {
    await axios.post('/flows', {
      config: {
        name: createForm.value.name,
        description: createForm.value.description,
        version: createForm.value.version,
        variables: {},
        nodes: [],
        inputs: []
      }
    })
    showCreateModal.value = false
    fetchFlows()
  } catch (err) {
    console.error('创建流程失败:', err)
  }
}

onMounted(() => {
  fetchFlows()
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>