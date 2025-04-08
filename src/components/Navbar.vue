<!-- src/components/Navbar.vue -->
<template>
    <div class="h-14 w-full flex items-center px-6 shadow-sm bg-white border-b">
        <img :src="logo" alt="Logo" class="h-8" />
    </div>
</template>

<script setup>
import logo from '@/assets/logo.svg'
</script>