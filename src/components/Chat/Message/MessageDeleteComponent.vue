<script setup lang="ts">
import { ref, inject, watch } from "vue";
import type { UserMessages, User, UserSessionData } from "@/types/User";
import type { ChannelMessages } from "@/types/Channel";

const user = inject<UserSessionData>("user");
const isDialog = ref(false)

defineProps<{
    message: UserMessages | ChannelMessages;
    selectedUser?: User | null;
    tooltip?: string;
}>();

const emit = defineEmits<{
    "update:open": [value: boolean];
    deleteMessage: [value: number | string];
}>();

const deleteMessage = (messageID: number | string) => {
    emit("deleteMessage", messageID);
};

watch(isDialog, (value) => {
    emit("update:open", value)
})
</script>

<template>
    <v-btn @click.stop="isDialog = !isDialog">
        <v-icon icon="mdi-delete-forever" color="red" size="large"></v-icon>
        <v-tooltip activator="parent" location="top" v-if="tooltip">{{ tooltip }}</v-tooltip>
        <v-dialog v-model="isDialog" :id="`edit-message${message._id}`" transition="dialog-bottom-transition"
            class="mx-auto" width="450" height="300">
            <v-card>
                <v-card-title>
                    <v-icon icon="mdi-circle-edit-outline"></v-icon>
                    {{ $lang("chat.text.deleteMessage") }}
                    <v-icon class="float-right" icon="mdi-close-circle-outline" @click="isDialog = false"
                        color="error"></v-icon>
                </v-card-title>
                <v-divider :thickness="3" color="success"></v-divider>
                <v-card-text>
                    <p class="text-body-1">
                        {{ $lang("chat.text.confirm", ["delete this message"]) }}
                    </p>
                    <v-sheet :border="true" rounded elevation="1" class="pa-4 w-100">
                        <p class="font-weight-bold">{{ message.from === user?._uuid ? user.displayName :
                            selectedUser?.displayName }}:
                            <span class="text-caption">{{ message.createdAt }}</span>
                        </p>
                        <div class="mt-3" v-html="message.content"></div>
                    </v-sheet>
                </v-card-text>
                <v-card-actions class="w-100 d-inline-block">
                    <v-btn @click.prevent="deleteMessage(message._id)" prepend-icon="mdi-delete-empty-outline"
                        class="red" block>{{ $lang("chat.button.delete") }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-btn>
</template>
<style scoped>
.red{
    background-color: #F44336 !important;
}
</style>