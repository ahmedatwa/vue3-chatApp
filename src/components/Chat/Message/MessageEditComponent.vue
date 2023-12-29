<script setup lang="ts">
import { ref, inject, computed, watch } from "vue";
import { ChatFormComponent } from "@/components/Chat";
// Types
import type { UserMessages, User, UserSessionData } from "@/types/User";
import type { ChannelMessages } from "@/types/Channel";
import { createDateTime } from "@/helpers";
import type { TenorGifs } from "@/types/Chat";

const user = inject<UserSessionData>("user");
const isDialog = ref(false);

const props = defineProps<{
    message: UserMessages | ChannelMessages;
    selectedUser?: User | null;
    tooltip?: string;
}>();

const emit = defineEmits<{
    "update:open": [value: boolean];
    editMessage: [
        value: {
            _messageID: string | number;
            editContent: string;
            content: string;
            updatedAt: string;
        }
    ];
}>();

const editMessage = (
    message: UserMessages | ChannelMessages,
    $event: { content: string; files: File[] | TenorGifs | null }
) => {
    emit("editMessage", {
        _messageID: message._id,
        editContent: $event.content,
        content: message.content,
        updatedAt: createDateTime(),
    });
    message.editContent = $event.content;
    message.content = message.content;
    message.isEdit = true;
    message.updatedAt = createDateTime();
};

const displayName = computed(() => {
    if (props.message) {
        return props.message?.from === user?._uuid
            ? user?.displayName
            : props.selectedUser?.displayName;
    }
    return "";
});

watch(isDialog, (value) => {
    emit("update:open", value);
});
</script>
<template>
    <v-btn @click.stop="isDialog = !isDialog">
        <v-icon icon="mdi-circle-edit-outline" color="green" size="large"></v-icon>
        <v-tooltip activator="parent" location="top" v-if="tooltip">
            {{ tooltip }}
        </v-tooltip>
        <v-dialog v-model="isDialog" :id="`edit-message${message._id}`" transition="dialog-bottom-transition" width="440"
            class="mx-auto">
            <v-card>
                <v-card-title>
                    <v-icon icon="mdi-circle-edit-outline"></v-icon>
                    {{ $lang("chat.text.editMessage") }}
                    <v-icon class="float-right" icon="mdi-close-circle-outline" @click.stop="isDialog = false"
                        color="error"></v-icon>
                </v-card-title>
                <v-divider :thickness="3" color="success"></v-divider>
                <v-card-text>
                    <v-sheet :border="true" rounded elevation="1" class="pa-4 w-100">
                        <p class="font-weight-bold">
                            {{ displayName }}:
                            <span class="text-caption">{{ message.createdAt }}</span>
                        </p>
                        <div class="mt-3" v-html="message.content"></div>
                    </v-sheet>
                </v-card-text>
                <v-card-actions class="w-100 d-inline-block">
                    <chat-form-component :id="`message-edit-${message._id}`" :key="`message-${message._id}`"
                        text-area-row-height="3" text-area-rows="1" :text-area-label="$lang('chat.input.edit')" no-resize
                        @update:submit="editMessage(message, $event)">
                    </chat-form-component>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-btn>
</template>
