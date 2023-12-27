<script setup lang="ts">
import { shallowRef, onMounted, watchEffect } from 'vue';
// Types
import type { UploadedFiles } from '@/types/Chat';

const isLoading = shallowRef(true)
const dialog = shallowRef(false)

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
    <v-sheet @click.stop="dialog = !dialog">
         {{ $lang('header.downloads') }}
    </v-sheet>
    <v-dialog width="500" v-model="dialog">
        <v-card>
            <v-card-title>
                <v-icon icon="mdi-download-circle-outline"></v-icon> {{ $lang('header.downloads') }}
                <v-icon icon="mdi-close-circle-outline" color="red" class="float-right" @click="dialog = !dialog"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="info"></v-divider>
            <v-card-text>
                <v-sheet class="text-center ma-2 pa-4" v-if="!downloadedFiles.length">
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
            </v-card-text>
        </v-card>
    </v-dialog>
</template>