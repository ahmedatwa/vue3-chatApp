<script setup lang="ts">
import { computed } from "vue";
import type { UploadedFiles } from "@/types/Chat";

const props = defineProps<{
    files: UploadedFiles[] | null
    messageId: string | number;
}>();

defineEmits<{
    "update:deleteFile": [value: { fileID: string | number, messageID: string | number }];
    "update:downdloadFile": [value: UploadedFiles];
}>();

const mapFiles = computed(() => {
    if (props.files) {
        return props.files.map((file: UploadedFiles) => {
            return {
                _id: file._id,
                name: file.name,
                size: file.size,
                type: file.type,
                randomName: file.randomName,
                path: file.path,
                _uuid: file._uuid,
                url: file.url,
                _channelID: file._channelID,
                createdAt: file.createdAt,
            }
        })
    }
})
</script>

<template>
    <v-row v-if="mapFiles">
        <v-col cols="2" class="d-flex child-flex " v-for="file in mapFiles" :key="file._id">
            <v-hover v-slot="{ isHovering, props }" :key="file._id">
                <v-card v-bind="props">
                    <template #title v-if="!file.type.startsWith('image/gif')">
                        <p class="text-body-2">{{ file.name }}</p>
                    </template>
                    <embed v-if="!file.type.startsWith('image/')" :src="file.url" :type="file.type" width="217"
                        max-height="150" />
                    <v-img :key="file._id" class="mx-auto" width="217" max-height="180" cover aspect-ratio="1/1"
                        :src="file.url" v-else>
                        <template v-slot:error>
                            <v-img class="mx-auto" max-height="150" width="217" aspect-ratio="4/3" cover
                                src="https://placehold.co/217x150?text=No Image Available"></v-img>
                        </template>
                        <template v-slot:placeholder>
                            <v-row class="fill-height ma-0" align="center" justify="center">
                                <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                            </v-row>
                        </template>
                    </v-img>
                    <v-overlay :model-value="isHovering" contained scrim="#036358" class="align-center justify-center" :key="file._id">
                        <v-btn-toggle divided density="comfortable">
                            <v-btn @click.stop="$emit('update:deleteFile', { fileID: file._id, messageID: messageId })">
                                <v-icon color="red" icon="mdi-delete-forever"></v-icon>
                                <v-tooltip activator="parent" location="top">{{ $lang('chat.files.delete', [file.name])
                                }}</v-tooltip>
                            </v-btn>
                            <v-btn @click.stop="$emit('update:downdloadFile', file)">
                                <v-icon color="info" icon="mdi-cloud-download"></v-icon>
                                <v-tooltip activator="parent" location="top">{{ $lang('chat.files.download', [file.name])
                                }}</v-tooltip>
                            </v-btn>
                        </v-btn-toggle>
                    </v-overlay>
                </v-card>
            </v-hover>
        </v-col>
    </v-row>
</template>
