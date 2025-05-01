<template>
    <n-form-item v-for="field in inputs" :key="field.name" :label="field.label || field.name" :path="field.name">
        <n-input v-if="field.type === 'string'" v-model:value="inputValues[field.name]"
            :placeholder="`请输入 ${field.label || field.name}`" />
        <n-input-number v-else-if="field.type === 'number'" v-model:value="inputValues[field.name]"
            :placeholder="`请输入数字`" />
        <n-select v-else-if="field.type === 'select'" v-model:value="inputValues[field.name]"
            :options="(field.options || []).map((o: string) => ({ label: o, value: o }))" :placeholder="`请选择`" />
        <n-upload v-else-if="field.type === 'file'" :show-file-list="false"
            :on-change="(options: UploadFileInfo) => handleFileUpload(options, field.name)">
            <template #default>
                <div class="flex items-center gap-4">
                    <n-button>点击上传</n-button>
                    <span v-if="inputValues[field.name]" class="text-xs text-gray-500">
                        已上传：{{ inputValues[field.name] }}
                    </span>
                </div>
            </template>
        </n-upload>
        <n-switch v-else-if="field.type === 'boolean'" v-model:value="inputValues[field.name]" />
    </n-form-item>
</template>

<script setup lang="ts">
import type { UploadFileInfo } from 'naive-ui'
import { TenantSpaceAPI } from '@/apis/endpoints'
import request from '@/utils/axios'

const props = defineProps<{
    inputs: Array<any>
    inputValues: Record<string, any>
}>()

function handleFileUpload(options: UploadFileInfo, fieldName: string) {
    if (!options.file) {
        window.$message.error('上传失败，未获取到文件')
        return
    }
    const realFile = (options.file as unknown as { file: File }).file
    if (!realFile) {
        window.$message.error('上传失败，未获取到文件')
        return
    }

    const formData = new FormData()
    formData.append('file', realFile)
    request.post(TenantSpaceAPI.files.upload, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    }).then((res) => {
        const fileId = res.data?.data?.file_id
        props.inputValues[fieldName] = fileId
        window.$message.success(`上传成功：${realFile.name}`)
    }).catch((err) => {
        window.$message.error('文件上传失败')
        console.error(err)
    })
}

</script>