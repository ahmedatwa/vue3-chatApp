<script setup lang="ts">
import { computed } from "vue";
import type { UploadedFiles } from "@/types/Chat";

const props = defineProps<{
    files: UploadedFiles[]
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
            <v-card v-bind="props" :key="file._id" class="card">
                <template #title v-if="!file.type.startsWith('image/gif')">
                    <p class="text-body-2">{{ file.name }}</p>
                </template>
                <embed v-if="!file.type.startsWith('image/')" :src="file.url" :type="file.type" width="217"
                    max-height="150" />
                <v-img :key="file._id" class="mx-auto" width="217" max-height="180" cover aspect-ratio="1/1" :src="file.url"
                    v-else>
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
                <div class="content-overlay"></div>
                <v-btn-toggle divided density="comfortable" variant="flat" class="button-group">
                    <v-btn @click.stop="$emit('update:deleteFile', { fileID: file._id, messageID: messageId })">
                        <v-icon color="red" icon="mdi-delete-forever"></v-icon>
                        <v-tooltip activator="parent" location="top">{{ $lang('chat.files.delete', [file.name])
                        }}</v-tooltip>
                    </v-btn>
                    <v-btn @click.stop="$emit('update:downdloadFile', file)" v-if="file.path">
                        <v-icon color="info" icon="mdi-cloud-download"></v-icon>
                        <v-tooltip activator="parent" location="top">{{ $lang('chat.files.download', [file.name])
                        }}</v-tooltip>
                    </v-btn>
                </v-btn-toggle>
            </v-card>
        </v-col>
    </v-row>
</template>
<style scoped>
.card {
    position: relative;
    transition: .5s ease;
    backface-visibility: hidden;

    .button-group {
        background: #036358;
        opacity: 0;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
        text-align: center;
        -webkit-transition: all 0.4s ease-in-out 0s;
        -moz-transition: all 0.4s ease-in-out 0s;
        transition: all 0.4s ease-in-out 0s;
    }

    .content-overlay {
        background: #036358;
        position: absolute;
        height: 99%;
        width: 100%;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        opacity: 0;
        -webkit-transition: all 0.4s ease-in-out 0s;
        -moz-transition: all 0.4s ease-in-out 0s;
        transition: all 0.4s ease-in-out 0s;
    }
}

.card:hover {
    .content-overlay {
        opacity: 0.3;
    }

    .button-group {
        opacity: 1;
    }
}
</style>