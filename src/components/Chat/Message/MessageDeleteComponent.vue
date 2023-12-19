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
                    <v-sheet :border="true" :elevation="3" class="ma-2 p-2" rounded="rounded" color="grey-lighten-">
                        <ul class="ma-3 list-style-none">
                            <li>
                                <span class="font-weight-bold">{{
                                    message.from === user?._uuid
                                    ? user.displayName
                                    : selectedUser?.displayName
                                }}:
                                </span>
                                {{ message.createdAt }}
                            </li>
                            <li>{{ message.content }}</li>
                        </ul>
                    </v-sheet>
                </v-card-text>
                <v-card-actions class="w-100 d-inline-block">
                    <v-btn @click="deleteMessage(message._id)" prepend-icon="mdi-delete-empty-outline" color="red-accent-2"
                        block variant="flat">
                        {{ $lang("chat.button.delete") }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-btn>
</template>
<style scoped>
.list-style-none {
    list-style-type: none;
}

.list-style-none li span {
    color: #3f51b5;
}
</style>
