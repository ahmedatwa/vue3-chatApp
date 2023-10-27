<script setup lang="ts">
import { ref } from "vue"
import { ChannelMessages } from "@/types"
import { set } from "lodash";

const selectedToEditMessage = ref<ChannelMessages | null>(null);
const messageContent = ref("");
const dialog = ref(false);

defineProps<{
    message: ChannelMessages;
    uuid: string | undefined;
}>()
// emits
const emit = defineEmits<{
    "on:alter:message": [key: string, value: ChannelMessages];
}>();


const editMessage = () => {
    if (selectedToEditMessage.value) {
        set(selectedToEditMessage.value, "content", messageContent.value);
        emit("on:alter:message", 'edit', selectedToEditMessage.value);
    }
    dialog.value = false;
};

const deleteMessage = (message: ChannelMessages) => {
    emit("on:alter:message", 'delete', message);
};

const onEditMessage = (message: ChannelMessages) => {
    selectedToEditMessage.value = message;
    messageContent.value = message.content;
    dialog.value = true;
};

</script>
<template>
    <v-btn variant="plain" density="compact" size="xs" prepend-icon="mdi-dots-vertical">
        <v-menu activator="parent" location="top" transition="slide-x-transition">
            <v-list nav>
                <v-list-item :key="`edit`" @click="onEditMessage(message)" v-if="message.from === uuid">
                    <v-list-item-title><v-icon icon="mdi-pencil"></v-icon></v-list-item-title>
                </v-list-item>
                <v-list-item :key="`delete`" @click="deleteMessage(message)" class="float-right"
                    v-if="message.from === uuid">
                    <v-list-item-title>
                        <v-icon icon="mdi-delete-forever" color="error"></v-icon></v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-btn>



    <!-- edit Message Dialog -->
    <v-dialog v-model="dialog" width="auto">
        <v-card>
            <v-textarea clearable auto-grow v-model="messageContent">
            </v-textarea>
            <v-card-actions>
                <v-btn color="primary" prepend-icon="mdi-content-save-check-outline" @click="editMessage">Save</v-btn>
                <v-btn color="error" @click="dialog = false" class="ms-auto"
                    prepend-icon="mdi-close-circle">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>