<script setup lang="ts">
import { ref } from "vue";
import { ChannelMessages } from "@/types";
import { set } from "lodash";
import { ConfirmDialogComponent } from "@/components";

const newMessageContent = ref("");
const replyMessageContent = ref("");

const toggleMenu = ref(false);
const editDialog = ref(false);

defineProps<{
    message: ChannelMessages;
    uuid: string | undefined;
}>();
// emits
const emit = defineEmits<{
    "on:alter:message": [key: string, value: ChannelMessages];
    "on:reply:message": [id: string | number, relatedContent: string, value: string];
}>();

const editMessage = (selectedMessage: ChannelMessages) => {
    if (selectedMessage) {
        set(selectedMessage, "content", newMessageContent.value);
        emit("on:alter:message", "edit", selectedMessage);
        editDialog.value = false
        toggleMenu.value = false
    }
};

const replyMessage = (id: string | number, reltaedContent: string) => {
    emit("on:reply:message", id, reltaedContent, replyMessageContent.value);
    editDialog.value = false
    toggleMenu.value = false
}
</script>
<template>
    <v-btn variant="plain" size="xs" prepend-icon="mdi-dots-vertical" @click="toggleMenu = !toggleMenu" :ripple="false">
    </v-btn>
    <v-slide-x-reverse-transition>
    <!-- <v-expand-x-transition> -->
        <v-sheet class="d-inline" v-if="toggleMenu">
            <v-btn prepend-icon="mdi-reply" color="indigo" class="ma-2" elevation="1" variant="tonal" size="small">
                Reply
                <confirm-dialog-component title="Reply Message" title-icon="mdi-reply-all">
                    <template v-slot:append>
                        <v-textarea clearable auto-grow v-model="replyMessageContent" rows="2"> </v-textarea>
                    </template>
                    <template v-slot:action-button>
                        <v-btn @click="replyMessage(message._id, message.content)"
                            prepend-icon="mdi-content-save-check-outline" color="primary">
                            Reply</v-btn>
                    </template>
                </confirm-dialog-component>
            </v-btn>
            <!-- Edit -->
            <v-btn prepend-icon="mdi-circle-edit-outline" color="green" v-if="message.from === uuid" class="ma-2"
                elevation="1" size="small" variant="tonal">
                Edit
                <confirm-dialog-component title="Edit Message" title-icon="mdi-circle-edit-outline">
                    <template v-slot:append>
                        <v-textarea clearable auto-grow :model-value="message.content"
                            @update:model-value="newMessageContent = $event" rows="2"> </v-textarea>
                    </template>
                    <template v-slot:action-button>
                        <v-btn @click="editMessage(message)" prepend-icon="mdi-content-save-check-outline" color="primary">
                            Edit</v-btn>
                    </template>
                </confirm-dialog-component>
            </v-btn>

            <!-- Delete -->
            <v-btn prepend-icon="mdi-delete-forever" color="red" class="ma-2" elevation="1" size="small" variant="tonal">
                Delete
                <confirm-dialog-component title="Are You Sure" title-icon="">
                    <template v-slot:action-button>
                        <v-btn @click="$emit('on:alter:message', 'delete', message)"
                            prepend-icon="mdi-content-save-check-outline" color="primary">
                            Delete</v-btn>
                    </template>
                </confirm-dialog-component>
            </v-btn>
        </v-sheet>
        </v-slide-x-reverse-transition>
</template>
