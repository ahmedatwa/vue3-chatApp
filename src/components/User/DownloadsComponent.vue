<script setup lang="ts">
import { shallowRef, watchEffect, onMounted } from 'vue';
// Types
import type { UploadedFiles } from '@/types/Chat';

const isLoading = shallowRef(true)

const props = defineProps<{
    modelValue: boolean;
    downloadedFiles: UploadedFiles[] | null
}>()

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "update:downloads": [value: boolean];
    "update:downloadFile": [value: UploadedFiles];
    "update:clearDownloads": [value: boolean];
}>()

onMounted(() => {
    emit("update:downloads", true)
})
watchEffect(() => {
    if (props.downloadedFiles) {
        isLoading.value = true
        setTimeout(() => {
            isLoading.value = false
        }, 500);
    }
})

</script>
<template>
    <v-dialog width="500" :model-value="modelValue">
        <v-card>
            <v-card-title>
                <v-icon icon="mdi-download-circle-outline"></v-icon> {{ $lang('header.downloads') }}
                <v-btn variant="flat" @click.stop="$emit('update:clearDownloads', true)" v-if="downloadedFiles !== null">
                    <v-icon icon="mdi-vacuum" color="red"> </v-icon>
                    <v-tooltip activator="parent" location="top">Clear</v-tooltip>
                </v-btn>
                <v-icon icon="mdi-close-circle-outline" color="red" class="float-right"
                    @click="$emit('update:modelValue', false)"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-card-text>
                <v-sheet class="text-center ma-2 pa-4" v-if="downloadedFiles === null">
                    {{ $lang('header.textEmptyDownloads') }}
                </v-sheet>
                <v-list lines="one" height="300" v-else>
                    <v-list-item v-for="file in downloadedFiles" :key="file._id" v-if="!isLoading">
                        <v-sheet elevation="2" class="ma-1 pa-2 d-flex  flex-row">
                            <div>
                                <v-list-item-title>{{ file.name }}</v-list-item-title>
                                <v-list-item-subtitle>{{ $lang('chat.text.downloaded') }}:
                                    {{ file.createdAt }}</v-list-item-subtitle>
                            </div>
                            <div class="ms-auto">
                                <v-btn icon="mdi-cloud-download" variant="text"
                                    @click="$emit('update:downloadFile', file)"></v-btn>
                            </div>
                        </v-sheet>
                    </v-list-item>
                    <v-list-item v-if="isLoading">
                        <v-skeleton-loader type="list-item-two-line" v-if="isLoading" v-for="n in downloadedFiles.length"
                            :key="n"></v-skeleton-loader>
                    </v-list-item>
                </v-list>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>