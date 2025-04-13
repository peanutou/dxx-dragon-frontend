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
        <n-form-item label="版本" path="version">
          <n-input v-model:value="createForm.version" placeholder="由后台初始化" disabled />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showCreateModal = false">取消</n-button>
        <n-button type="primary" @click="submitCreate">创建</n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="showEditModal" title="编辑流程" preset="dialog">
      <n-form :model="editForm" label-width="80">
        <n-form-item label="名称" path="name" :rule="nameRules">
          <n-input v-model:value="editForm.name" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="editForm.description" type="textarea" />
        </n-form-item>
        <n-form-item label="状态">
          <n-select v-model:value="editForm.status" :options="statusOptions" placeholder="请选择状态" />
        </n-form-item>
        <n-form-item label="版本">
          <n-input v-model:value="editForm.version" disabled />
        </n-form-item>
      </n-form>
      <template #action>
        <n-button @click="showEditModal = false">取消</n-button>
        <n-button type="primary" @click="submitEdit">保存</n-button>
      </template>
    </n-modal>

    <n-card title="流程列表">
      <div class="mb-4 flex justify-between items-center">
        <n-space>
          <n-button type="primary" @click="showCreateModal = true">创建流程</n-button>
        </n-space>
      </div>
      <n-data-table :columns="columns" :data="flows" :loading="loading" :pagination="pagination"
        @update:page="handlePageChange" remote :row-key="(row: Flow) => row.flow_id"
        @update:sorter="handleSorterChange" />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NDataTable, NButton, NSpace, NModal, NForm, NFormItem, NInput, NSelect, NTooltip } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import axios from '@/utils/axios'

interface Flow {
  flow_id: string
  name: string
  description: string
  version: string
  created_at: string
  status: string
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

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
  { label: '已弃用', value: 'deprecated' }
]

const columns: DataTableColumns<Flow> = [
  {
    title: '名称',
    key: 'name',
    sorter: true,
    render: (row) => {
      return h(
        'a',
        {
          href: 'javascript:void(0)',
          onClick: () => {
            editForm.value = { ...row }
            showEditModal.value = true
          },
          style: { color: '#18a058', cursor: 'pointer' }
        },
        row.name
      )
    }
  },
  {
    title: '操作',
    key: 'action',
    render: (row) =>
      h(
        'div',
        [
          h(
            'a',
            {
              href: 'javascript:void(0)',
              onClick: () => router.push({ name: 'FlowEditor', params: { id: row.flow_id } }),
              style: { color: '#2080f0', cursor: 'pointer', marginRight: '12px' }
            },
            '编辑'
          ),
          h(
            'a',
            {
              href: 'javascript:void(0)',
              onClick: () => router.push({ name: 'FlowRunner', params: { id: row.flow_id } }),
              style: { color: '#2080f0', cursor: 'pointer' }
            },
            '运行'
          )
        ]
      )
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      const match = statusOptions.find(opt => opt.value === row.status)
      return h('span', match ? match.label : row.status || '-')
    }
  },
  {
    title: '描述',
    key: 'description',
    render: (row) =>
      h(
        NTooltip,
        { trigger: 'hover' },
        {
          trigger: () =>
            h(
              'span',
              {
                style: {
                  maxWidth: '160px',
                  display: 'inline-block',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'top'
                }
              },
              row.description || '-'
            ),
          default: () =>
            h(
              'div',
              {
                style: {
                  maxWidth: '300px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }
              },
              row.description || '-'
            )
        }
      )
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
const showEditModal = ref(false)
const formRef = ref()
const createForm = ref({
  name: '',
  description: '',
  version: ''
})
const editForm = ref<Flow>({
  flow_id: '',
  name: '',
  description: '',
  version: '',
  created_at: '',
  status: ''
})

const nameRules = [
  {
    required: true,
    validator: (rule: any, value: string) => {
      if (value.length < 3) return new Error('名称不能少于 3 个字符')
      if (/\s/.test(value)) return new Error('名称不能包含空格')
      if (!/^[\u4e00-\u9fa5a-zA-Z_][\u4e00-\u9fa5a-zA-Z0-9_]*$/.test(value)) return new Error('名称只能包含中英文字符、数字和下划线，且不能以数字开头')
      return true
    },
    trigger: ['input', 'blur']
  }
]

const submitCreate = async () => {
  try {
    await axios.post('/flows', {
      name: createForm.value.name,
      description: createForm.value.description,
      version: createForm.value.version
    })
    createForm.value = { name: '', description: '', version: '1.0' }
    showCreateModal.value = false
    fetchFlows()
  } catch (err) {
    console.error('创建流程失败:', err)
  }
}

const submitEdit = async () => {
  try {
    await axios.put(`/flows/${editForm.value.flow_id}`, {
      name: editForm.value.name,
      status: editForm.value.status,
      description: editForm.value.description,
      version: editForm.value.version
    })
    showEditModal.value = false
    fetchFlows()
  } catch (err) {
    console.error('更新流程失败:', err)
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