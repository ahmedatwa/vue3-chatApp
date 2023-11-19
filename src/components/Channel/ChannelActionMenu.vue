<script setup lang="ts">
import { ref } from "vue";
import DialogComponent from "@/components/DialogComponent.vue";
import { ChannelMessageThreadComponent } from "@/components/Channel";
import type { ChannelMessages, SendMessageThreadPayload } from "@/types/Channel.ts";
import { createDateTime } from "@/helpers";
import 'vue3-emoji-picker/css'
import EmojiPicker from "vue3-emoji-picker";

const editMessageContent = ref("");
//const replyContent = ref("");
const toggleMenu = ref(false);
const messageThreadDialog = ref(false);
// Props
defineProps<{
    message: ChannelMessages;
    uuid: string | undefined
}>();

// emits
const emit = defineEmits<{
    "on:edit:message": [value: { _messageId: string | number, editContent: string, content: string, updatedAt: string }];
    "on:delete:message": [value: number];
    "send:messageThread": [payload: SendMessageThreadPayload]
}>();

const editMessage = (message: ChannelMessages) => {
    emit("on:edit:message", {
        _messageId: message._id,
        editContent: message.content,
        content: editMessageContent.value,
        updatedAt: createDateTime()
    });
    message.editContent = message.content
    message.content = editMessageContent.value
    message.isEdit = true
    message.updatedAt = createDateTime()
    editMessageContent.value = ''
    toggleMenu.value = false;
};

const deleteMessage = (messageID: number) => {
    emit("on:delete:message", messageID);
    toggleMenu.value = false;
};

const onEditEmoji = (emoji: any) => {
    editMessageContent.value += emoji.i;
};

const sendMessagethread = (payload: SendMessageThreadPayload) => {
    emit("send:messageThread", payload);
};
// const replyMessage = (message: ChannelMessages) => {
//     emit("on:reply:message", {
//         relatedId: message._id,
//         relatedContent: message.content,
//         content: replyContent.value,
//     });
//     message.relatedContent = message.content;
//     message.relatedId = message._id;
//     message.updatedAt = createDateTime()
//     message.isReply = true
//     toggleMenu.value = false;
//     replyContent.value = ""
// };

// emoji


</script>
<template>
    <v-btn variant="text" size="xs" prepend-icon="mdi-dots-vertical" color="red" @click="toggleMenu = !toggleMenu">
    </v-btn>
    <v-slide-x-transition mode="out-in">
        <v-sheet class="d-inline" v-if="toggleMenu" :key="`sheet-${message._id}`">
            <!-- v-if="message.from !== uuid" -->
            <v-btn prepend-icon="mdi-reply" color="blue-darken-1" class="ma-2" elevation="1" variant="tonal" size="small"
                @click="messageThreadDialog = !messageThreadDialog">
                <v-badge color="error" :content="message.thread?.length" floating>
                    {{ $lang('textThread') }}
                </v-badge>
            </v-btn>
            <channel-message-thread-component :message="message" :uuid="uuid" v-model:model-value="messageThreadDialog"
                @on:send:message-thread="sendMessagethread"></channel-message-thread-component>
            <!-- Edit -->
            <v-btn prepend-icon="mdi-circle-edit-outline" color="green" v-if="message.from === uuid" class="ma-2"
                elevation="1" size="small" variant="tonal">
                {{ $lang('textEdit') }}
                <dialog-component :title-text="$lang('textEditMessage')" title-icon="mdi-circle-edit-outline">
                    <template #main>
                        <v-textarea clearable auto-grow v-model="editMessageContent" rows="2"
                            :label="$lang('textEditMessage')" width="100">
                            <template #append-inner>
                                <v-btn icon="mdi-emoticon-happy-outline" density="default" id="edit-emoji-activator"
                                    color="orange-darken-2" size="x-small">
                                </v-btn>
                                <v-menu :close-on-content-click="false" location="right" activator="#edit-emoji-activator">
                                    <emoji-picker :native="true" :hide-search="false" @select="onEditEmoji"></emoji-picker>
                                </v-menu>
                            </template>
                        </v-textarea>
                    </template>
                    <template #buttons>
                        <v-btn @click="editMessage(message)" prepend-icon="mdi-square-edit-outline" color="green" block
                            variant="flat" :disabled="editMessageContent.length < 1">
                            {{ $lang('textEdit') }}</v-btn>
                    </template>
                </dialog-component>
            </v-btn>
            <!-- Delete -->
            <v-btn prepend-icon="mdi-delete-forever" color="red" class="ma-2" elevation="1" size="small" variant="tonal">
                {{ $lang('textDelete') }}
                <dialog-component title-text="Delete Message" title-icon="">
                    <template #main>
                        <p class="text-body-1">Are you sure you want to delete this message? This can't be undone.</p>
                        <v-sheet :border="true" :elevation="3" class="ma-2 p-2" rounded="rounded" color="grey-lighten-">
                            <ul class="ma-3 list-style-none">
                                <li><span class="font-weight-bold">{{ message.fromName }}</span> {{ message.createdAt }}
                                </li>
                                <li>{{ message.content }}</li>
                            </ul>
                        </v-sheet>
                    </template>
                    <template #buttons>
                        <v-btn @click="deleteMessage(message._id)" prepend-icon="mdi-delete-empty-outline"
                            color="red-accent-2" block variant="flat">
                            {{ $lang('textDelete') }}</v-btn>
                    </template>
                </dialog-component>
            </v-btn>
        </v-sheet>
    </v-slide-x-transition>
</template>
<style scoped>
.list-style-none {
    list-style-type: none;
}

.list-style-none li span {
    color: #3F51B5;
}
</style>