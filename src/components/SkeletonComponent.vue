<script setup lang="ts">

defineProps<{
    loading: boolean;
    length: number | undefined;
    type: string;
}>();

</script>

<template>
    <v-list v-for="n in length" v-if="loading" rounded="shaped">
        <v-skeleton-loader :elevation="1" :type="type" :key="n"></v-skeleton-loader>
    </v-list>
</template>