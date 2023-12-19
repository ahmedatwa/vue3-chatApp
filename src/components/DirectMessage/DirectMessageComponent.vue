<script setup lang="ts">
import { ref, watch, provide } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import { MessageContentComponent } from "@/components/DirectMessage";
import MessageThreadComponent from "@/components/Chat/Message/MessageThreadComponent.vue"
// types
import type { User, UserMessages } from "@/types/User";
import type { Typing, SendThreadPayload } from "@/types/Chat";

const formInputValue = ref("");
const uploadedFiles = ref<File[]>([]);
const isScroll = ref(false);
// thread
const isThread = ref(false);
const threadMessage = ref<UserMessages | null>(null)
provide("isThread", isThread);

// Props
defineProps<{
  user: User | null;
  selected: boolean;
  uuid: string | undefined;
  typing: Record<"messages" | "thread", Typing | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
}>();

// emits
const emit = defineEmits<{
  sendMessage: [value: { content: string; files: File[] }];
  userTyping: [value: number];
  deleteMessage: [value: number | string];
  editMessage: [
    value: {
      _messageID: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  loadMoreMessages: [value: { _channelID: string; limit: number, offset: number; unshift: boolean }];
  "update:messageReaction": [value: { _id: string | number, emoji: string }];
  "update:threadTyping": [value: number];
  "send:threadMessage": [value: SendThreadPayload];
}>();

const sendMessage = () => {
  emit("sendMessage", {
    content: formInputValue.value,
    files: uploadedFiles.value,
  });
  formInputValue.value = "";
  uploadedFiles.value = [];
  isScroll.value = true;
};

const updateEmoji = (emoji: string) => {
  formInputValue.value += emoji;
};

watch(formInputValue, (newValue) => {
  emit("userTyping", newValue.length);
});

const updateThread = (message: UserMessages) => {
  isThread.value = true
  threadMessage.value = message
}

</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`direct-message-${user?._uuid}`" :class="selected ? '' : 'd-none'"
    fluid>
    <v-row>
      <v-col>
        <v-card class="mx-auto" id="container" :loading="isLoading.messages">
          <v-card-title>
            <v-sheet class="d-inline">
              <v-avatar :image="user?.image" v-if="user?.image"></v-avatar>
              <v-avatar color="info" v-else>
                <v-icon icon="mdi-account-circle"></v-icon>
              </v-avatar>
              <p class="ms-2 d-inline">{{ user?.displayName }}</p>
            </v-sheet>
          </v-card-title>
          <v-divider :thickness="3" color="success"></v-divider>
          <message-content-component :key="`direct-${user?._uuid}`" :selected-user="user" :is-loading="isLoading"
            @update:thread-messages="updateThread" :is-scroll="isScroll"
            @load-more-messages="$emit('loadMoreMessages', $event)" @delete-message="$emit('deleteMessage', $event)"
            @edit-message="$emit('editMessage', $event)"
            @update:messageReaction="$emit('update:messageReaction', $event)">
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component :id="user?._uuid" :key="`user-${user?._uuid}`" v-model:input-value="formInputValue"
              v-model:files="uploadedFiles" :text-area-row-height="10" :text-area-rows="2"
              :text-area-label="$lang('chat.input.send')" @update:emoji="updateEmoji" @update:submit="sendMessage"
              upload-button auto-grow>
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :typing="typing.messages"></chat-typing-component>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Thread -->
      <v-col cols="3" v-if="isThread">
        <message-thread-component :typing="typing.thread" :message="(threadMessage as UserMessages)"
          :is-loading="isLoading.thread" :selected-user="user"
          @send:thread-message="$emit('send:threadMessage', $event)"
          @update:thread-typing="$emit('update:threadTyping', $event)">
        </message-thread-component>
      </v-col>
    </v-row>
  </v-container>
</template>
