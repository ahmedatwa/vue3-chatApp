<script setup lang="ts">
import { ref, onMounted, nextTick, inject, watch } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import type { ChannelMessages, SendThreadPayload } from "@/types/Channel";
import type { UserSessionData } from "@/types/User";
import type { TypingEvent } from "@/types";

const user = inject<UserSessionData>("user");

const messageContent = ref("");
const uploadedFiles = ref<File[]>([]);
const scrollElement = ref<HTMLDivElement | null>(null)

// Props
const props = defineProps<{
    currentMessage: ChannelMessages;
    threadTyping: TypingEvent | null;
    modelValue: boolean;
    threadDrawer?: boolean;
    isLoading?: boolean;
}>();

// emits
const emit = defineEmits<{
    "update:modelValue": [value: boolean];
    "update:threadDrawer": [value: boolean]
    "on:sendMessageThread": [payload: SendThreadPayload];
    "on:threadTyping": [value: string];
}>();


const updateEmoji = (emoji: string) => {
    messageContent.value += emoji;
};


const send = () => {
    if (messageContent.value || uploadedFiles.value) {
        emit("on:sendMessageThread", {
            _messageID: props.currentMessage._id,
            _channelID: props.currentMessage._channelID,
            to: props.currentMessage.from,
            toName: props.currentMessage.fromName,
            content: messageContent.value,
            files: uploadedFiles.value,
        });
        messageContent.value = "";
        uploadedFiles.value = [];
        nextTick(() => {
            autoScroll()
        })
    }

};

const autoScroll = () => {
    scrollElement.value?.scrollIntoView({
        block: "center",
        behavior: "smooth"
    })
}
onMounted(() => {
    autoScroll()
})

watch(
  () => messageContent.value,
  (newValue) => {
    if (newValue.length > 0) {
      emit("on:threadTyping", newValue)
    }
  })


</script>

<template>
    <div>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" scrollable width="auto"
        height="400" transition="dialog-bottom-transition" :id="`message-thread${currentMessage._id}`">
        <v-card class="mx-auto" :id="currentMessage?._id" width="400" height="400" elevation="6"
            :loading="isLoading">
            <v-card-title>
                <v-icon icon="mdi-spider-thread"></v-icon> {{ $lang('text.messageThread', [currentMessage.fromName]) }}
                <v-icon class="float-right" icon="mdi-close-circle-outline" @click="$emit('update:modelValue', false)"
                    color="error"></v-icon>
            </v-card-title>
            <v-divider :thickness="3" color="warning"></v-divider>
            <v-card-text class="card-text">
                <div class="d-flex flex-wrap overflow" :id="`thread-container-${currentMessage?._id}`">
                    <div class="flex-1-1-100 mx-2 py-2" v-for="thread in currentMessage.thread" :key="thread._id">
                        <span class="font-weight-bold text-teal" v-if="thread?.from === user?._uuid">
                            {{ thread?.fromName }}: </span>
                        <span class="font-weight-bold text-blue" v-else>
                            {{ thread.fromName }}: </span>
                        <span>{{ thread.content }}</span>
                    </div>
                </div>
                <div ref="scrollElement"></div>
            </v-card-text>
            <v-card-actions class="w-100 d-inline-block">
                <chat-form-component :key="`message-${currentMessage?._id}`" v-model:model-value="messageContent"
                    v-model:files="uploadedFiles" @update:emoji="updateEmoji" :text-area-row-height="5" :text-area-rows="1"
                    no-resize @submit="send" :typing="threadTyping">
                </chat-form-component>
                <!-- Typing -->
                <chat-typing-component v-if="threadTyping" :typing="threadTyping"></chat-typing-component>
            </v-card-actions>
        </v-card>
    </v-dialog>
</div>
</template>