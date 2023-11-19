<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { MessageFormComponent } from "@/components/Message";
import type { ChannelMessages, SendMessageThreadPayload } from "@/types/Channel.ts";

const messageInput = ref("");
const uploadedFiles = ref<File[]>([]);
const threadwrapper = ref<HTMLDivElement | null>(null)
const props = defineProps<{
    message: ChannelMessages;
    uuid: string | undefined;
    modelValue: boolean;
}>();

const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "on:send:messageThread": [payload: SendMessageThreadPayload];
}>();

const isSendDisabled = computed(() => {
    return false;
});

const updateEmoji = (emoji: string) => {
    messageInput.value += emoji;
};

const sendMessage = () => {
    if (props.message) {
        emit("on:send:messageThread", {
            _messageID: props.message._id,
            _channelID: props.message._channelID,
            to: props.message.from,
            toName: props.message.fromName,
            content: messageInput.value,
            files: uploadedFiles.value,
        });
    }

    messageInput.value = "";
    uploadedFiles.value = [];
    handleScroll()
};

const handleScroll = () => {
    threadwrapper.value?.lastElementChild?.scroll({
        top: threadwrapper.value.lastElementChild.scrollHeight,
        behavior: "smooth"
    })
}
onMounted(() => {
    if (threadwrapper.value) {
        handleScroll()
    }
})
</script>

<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" scrollable width="auto"
        height="400">
        <v-card class="mx-auto" :id="message._id" width="400" height="400" elevation="6">
            <v-card-title>
                <v-icon icon="mdi-spider-thread"></v-icon> Message Thread
            </v-card-title>
            <v-divider :thickness="3" color="warning"></v-divider>
            <v-card-text v-if="message.thread">
                <div class="d-flex flex-wrap overflow" :id="`thread-container-${message?._id}`" ref="threadwrapper">
                    <div class="flex-1-1-100 mx-2 py-2" v-for="thread in message.thread" :key="thread._id">
                        <span class="font-weight-bold text-teal" v-if="thread?.from === uuid">
                            {{ thread?.fromName }}: </span>
                        <span class="font-weight-bold text-blue" v-else>
                            {{ thread.fromName }}: </span>
                        <span>{{ message.content }}</span>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions class="w-100 d-inline-block">
                <message-form-component :key="`message-${message?._id}`" v-model:model-value="messageInput"
                    v-model:files="uploadedFiles" @update:emoji="updateEmoji" :text-area-row-height="5" :text-area-rows="1"
                    no-resize  @send-message="sendMessage">
                    <template #send>
                        <v-btn icon="mdi-send" color="teal-lighten-1" :disabled="isSendDisabled"
                            @click="sendMessage"></v-btn>
                    </template>
                </message-form-component>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
