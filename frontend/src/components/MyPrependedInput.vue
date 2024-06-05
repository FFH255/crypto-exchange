<script setup>
const props = defineProps(["prepend"])
</script>

<template>
    <el-input>
        <template #prepend>
            <span class="prepend-span"> {{prepend}}</span>
        </template>
    </el-input>
</template>

<style scoped>

</style>