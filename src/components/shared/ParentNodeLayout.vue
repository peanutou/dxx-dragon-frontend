<template>
    <NodeResizer :min-width="200" :min-height="150">
    </NodeResizer>
    <div class="parent-node-container">
        <div style="margin-top: -60px;">
            <slot></slot>
        </div>
        <div style="padding-top: 10px; width: 95%; border-bottom: 1px dashed var(--n-text-color); opacity: 0.5;"></div>
    </div>
</template>

<script setup lang="ts">
import './shared-style.css'
import { NodeResizer } from '@vue-flow/node-resizer'
</script>

<style scoped></style>