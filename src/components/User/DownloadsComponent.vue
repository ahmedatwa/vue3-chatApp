<script setup lang="ts">
import { shallowRef, onMounted, watchEffect } from 'vue';
// Types
import type { UploadedFiles } from '@/types/Chat';

const isLoading = shallowRef(true)

const props = defineProps<{
    downloadedFiles: UploadedFiles[]
}>()

const emit = defineEmits<{
    "update:downloads": [value: boolean];
    "update:downloadFile": [value: UploadedFiles];
}>()

onMounted(() => {
    emit("update:downloads", true)
})

watchEffect(() => {
    if (props.downloadedFiles.length) {
        setTimeout(() => {
            isLoading.value = false
        }, 500);
    }
})

</script>
<template>
    <v-sheet class="overflow-y-auto pa-2 mb-4" height="450">
        <v-list lines="one" height="300">
            <v-list-item v-for="file in downloadedFiles" :key="file._id" v-if="!isLoading">
                <v-sheet elevation="2" class="ma-1 pa-2 d-flex  flex-row">
                    <div>
                        <v-list-item-title>{{ file.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ $lang('chat.text.downloaded') }}:
                            {{ file.createdAt }}</v-list-item-subtitle>
                    </div>
                    <div class="ms-auto">
                        <v-btn icon="mdi-cloud-download" color="red" variant="text"
                            @click="$emit('update:downloadFile', file)"></v-btn>
                    </div>
                </v-sheet>
            </v-list-item>
            <v-list-item v-if="isLoading">
                <v-skeleton-loader type="list-item-two-line" v-if="isLoading" v-for="n in downloadedFiles.length"
                    :key="n"></v-skeleton-loader>
            </v-list-item>
        </v-list>
    </v-sheet>
</template>