<script setup lang="ts">

interface Props {
    loading: boolean;
    length: number | undefined;
    type: string;
}
defineProps<Props>();

</script>

<template>
    <v-list v-for="n in length" v-if="loading" rounded="shaped">
        <v-skeleton-loader :elevation="1" :type="type" :key="n"></v-skeleton-loader>
    </v-list>
</template>