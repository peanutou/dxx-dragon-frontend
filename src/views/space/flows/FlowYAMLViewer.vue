<template>
    <n-card title="" size="small" class="h-full w-full">
        <template #default>
            <VueJsonPretty :data="uploadedConfig ? uploadedConfig : reorderedConfig" :deep="Infinity" showLength
                showIcon theme="dark" />
        </template>
        <template #action>
            <div class="flex items-center gap-2">
                <n-button type="primary" @click="copyToClipboard(JSON.stringify(reorderedConfig, null, 4))">复制
                    JSON</n-button>
                <n-button type="primary" @click="downloadConfig">下载 JSON</n-button>
                <n-divider vertical />
                <n-button type="warning" @click="uploadConfig">上传 JSON</n-button>
                <n-button type="warning" @click="saveUploadedConfig" :disabled="!uploadedConfig">存储 JSON</n-button>
            </div>
        </template>
    </n-card>
</template>

<script setup lang="ts">
import { NCard, NButton } from 'naive-ui'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { computed, ref, Ref } from 'vue'

const props = defineProps<{
    config: object
}>()
const emits = defineEmits<{
    (e: 'update:flow-config', jsonConfig: object): void
}>()
const uploadedConfig: Ref<any> = ref(null)

const reorderedConfig = computed(() => {
    if (typeof props.config !== 'object' || props.config === null || Array.isArray(props.config)) {
        return props.config
    }
    const entries = Object.entries(props.config)
    const simpleEntries = entries.filter(([_, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v))
    const complexEntries = entries.filter(([_, v]) => v !== null && typeof v === 'object')
    return Object.fromEntries([...simpleEntries, ...complexEntries])
})

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard:', text.substring(0, 100) + '...');
    }).catch(err => {
        console.error('Error copying text to clipboard:', err);
    });
};

const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(reorderedConfig.value, null, 4)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if ('name' in props.config && typeof props.config.name === 'string') {
        a.download = `flow-config-${props.config.name}.json`;
    } else {
        a.download = 'flow-config.json';
    }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

const uploadConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const textConfig = e.target?.result as string;
                    const jsonConfig = JSON.parse(textConfig);
                    uploadedConfig.value = jsonConfig;
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    window.$dialog.error({
                        title: '上传失败',
                        content: '无法解析 JSON 文件，请确保文件格式正确。',
                    });
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
};

const saveUploadedConfig = () => {
    if (uploadedConfig.value) {
        emits('update:flow-config', uploadedConfig.value);
    } else {
        window.$dialog.warning({
            title: '未上传配置',
            content: '请先上传 JSON 配置。',
        });
    }
};
</script>

<style scoped>
:deep(.n-card__content) {
    overflow: auto;
}

:deep(.vjs-tree-node) {
    font-size: 12px;
}

:deep(.vjs-tree-node .vjs-indent-unit) {
    width: 2em;
    font-size: 12px;
}

:deep(.vue-json-pretty .vjs-tree-node.is-selected) {
    background-color: #ffe58f !important;
    /* 自定义背景色 */
    color: #000000 !important;
    /* 自定义文字颜色 */
}

:deep(.vjs-tree-node .vjs-key) {
    white-space: nowrap;
}
</style>