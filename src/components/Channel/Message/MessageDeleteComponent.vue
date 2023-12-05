<script setup lang="ts">
import type { ChannelMessages } from "@/types/Channel";

defineProps<{
    modelValue: boolean;
    message: ChannelMessages
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "on:deleteMessage": [value: number];
}>();

const deleteMessage = (messageID: number) => {
    emit("on:deleteMessage", messageID);
};
</script>

<template>
    <div>
        <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :id="`edit-message${message._id}`" transition="dialog-bottom-transition">
            <v-card class="mx-auto" width="450" height="300">
                <v-card-title>
                    <v-icon icon="mdi-circle-edit-outline"></v-icon> {{ $lang('chat.text.deleteMessage') }}
                    <v-icon class="float-right" icon="mdi-close-circle-outline" @click="$emit('update:modelValue', false)"
                        color="error"></v-icon>
                </v-card-title>
                <v-divider :thickness="3" color="success"></v-divider>
                <v-card-text>
                    <p class="text-body-1">{{ $lang('chat.text.confirm', ['delete this message']) }}</p>
                    <v-sheet :border="true" :elevation="3" class="ma-2 p-2" rounded="rounded" color="grey-lighten-">
                        <ul class="ma-3 list-style-none">
                            <li>
                                <span class="font-weight-bold">{{ message.fromName }}</span> {{ message.createdAt }}
                            </li>
                            <li>{{ message.content }}</li>
                        </ul>
                    </v-sheet>
                </v-card-text>
                <v-card-actions class="w-100 d-inline-block">
                    <v-btn @click="deleteMessage(message._id)" prepend-icon="mdi-delete-empty-outline" color="red-accent-2"
                        block variant="flat">
                        {{ $lang('chat.button.delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<style scoped>
.list-style-none {
    list-style-type: none;
}

.list-style-none li span {
    color: #3F51B5;
}
</style>