<script setup lang="ts">
import { ref, inject } from "vue";
import { ChatFormComponent } from "@/components/Chat";
import type { UserMessages, User, UserSessionData } from "@/types/User";
import { createDateTime } from "@/helpers";

const editMessageContent = ref("");
const user = inject<UserSessionData>("user");

defineProps<{
    modelValue: boolean;
    message: UserMessages;
    selectedUser: User | null;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    editMessage: [
        value: {
            _messageID: string | number;
            editContent: string;
            content: string;
            updatedAt: string;
        }
    ];
}>();

const editMessage = (message: UserMessages) => {
    emit("editMessage", {
        _messageID: message._id,
        editContent: message.content,
        content: editMessageContent.value,
        updatedAt: createDateTime(),
    });
    message.editContent = message.content;
    message.content = editMessageContent.value;
    message.isEdit = true;
    message.updatedAt = createDateTime();
    editMessageContent.value = "";
};

const onEditEmoji = (emoji: any) => {
    editMessageContent.value += emoji;
};
</script>

<template>
    <div>
        <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :id="`edit-message${message._id}`" transition="dialog-bottom-transition">
            <v-card class="mx-auto" width="440" height="auto">
                <v-card-title>
                    <v-icon icon="mdi-circle-edit-outline"></v-icon>
                    {{ $lang("chat.text.editMessage") }}
                    <v-icon class="float-right" icon="mdi-close-circle-outline" @click="$emit('update:modelValue', false)"
                        color="error"></v-icon>
                </v-card-title>
                <v-divider :thickness="3" color="success"></v-divider>
                <v-card-text>
                    <v-sheet :border="true" rounded elevation="1" class="pa-4 w-100">
                        <ul class="ma-3 list-style-none">
                            <li>
                                
                                <span class="font-weight-bold">{{ message.from === user?._uuid ? user.displayName :
                                    selectedUser?.displayName }}: </span>
                                {{ message.createdAt }}
                            </li>
                            <li>{{ message.content }}</li>
                        </ul>
                    </v-sheet>
                </v-card-text>
                <v-card-actions class="w-100 d-inline-block">
                    <chat-form-component :id="message._id" :key="`message-${message._id}`" text-area-row-height="3"
                        text-area-rows="1" v-model:model-value="editMessageContent" @update:emoji="onEditEmoji"
                        :text-area-label="$lang('chat.input.edit')" no-resize @submit="editMessage(message)">
                    </chat-form-component>
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
    color: #3f51b5;
}
</style>
