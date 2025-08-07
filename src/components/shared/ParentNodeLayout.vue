<template>
    <node-resizer :min-width="200" :min-height="150">
    </node-resizer>
    <div class="parent-node-container">
        <div style="margin-top: -55px;">
            <slot></slot>
        </div>
        <div style="padding-top: 15px; width: 95%; border-bottom: 1px dashed var(--n-text-color); opacity: 0.5;"></div>
    </div>
</template>

<script setup lang="ts">
import './shared-style.css'
import { NodeResizer } from '@vue-flow/node-resizer'
</script>

<style scoped></style>