<script setup lang="ts">
import { ref, provide, watch } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import {
  MessageContentComponent,
  MessageThreadComponent,
} from "@/components/DirectMessage";
// types
import type {
  User,
  UserTyping,
  UserMessages,
  SendThreadPayload,
} from "@/types/User";

const messageInput = ref("");
const uploadedFiles = ref<File[]>([]);
const isScroll = ref(false);

// Props
defineProps<{
  user: User | null;
  selected: boolean;
  uuid: string | undefined;
  typing: Record<"messages" | "thread", UserTyping | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
}>();

// emits
const emit = defineEmits<{
  sendMessage: [value: { content: string; files: File[] }];
  userTyping: [value: string];
  threadTyping: [value: string];
  sendThreadMessage: [payload: SendThreadPayload];
  deleteMessage: [value: number | string];
  editMessage: [
    value: {
      _messageID: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
}>();

const sendMessage = () => {
  emit("sendMessage", {
    content: messageInput.value,
    files: uploadedFiles.value,
  });
  messageInput.value = "";
  uploadedFiles.value = [];
  isScroll.value = true;
};

const updateEmoji = (emoji: string) => {
  messageInput.value += emoji;
};

watch(messageInput, (newValue) => {
  emit("userTyping", newValue);
});

// thread
const isThreadOpen = ref(false);
provide("isStartThread", isThreadOpen);
const threadMessage = ref<UserMessages | null>(null);

const startThread = (message: UserMessages) => {
  threadMessage.value = null;
  threadMessage.value = message;
};
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`direct-message-${user?._uuid}`" :class="selected ? '' : 'd-none'"
    fluid>
    <v-row>
      <v-col>
        <v-card class="mx-auto" id="container" :loading="isLoading.messages">
          <v-card-title>
            <v-avatar>
              <v-img v-if="user?.image" :src="user?.image" alt="image"></v-img>
              <v-icon icon="mdi-account-circle" :color="user?.connected ? 'success' : 'dark'" v-else>
              </v-icon>
            </v-avatar>
            <v-badge dot inline :color="user?.connected ? 'success' : 'dark'">
              <p class="mr-1">{{ user?.displayName }}</p>
            </v-badge>
          </v-card-title>
          <v-divider :thickness="3" color="success"></v-divider>
          <message-content-component :selected-user="user" :is-loading="isLoading" @start:thread="startThread"
            @delete-message="$emit('deleteMessage', $event)" @edit-message="$emit('editMessage', $event)">
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component :id="user?._uuid" :key="`user-${user?._uuid}`" v-model:model-value="messageInput"
              v-model:files="uploadedFiles" :text-area-row-height="10" :text-area-rows="2"
              :text-area-label="$lang('chat.input.send')" :auto-grow="true" @update:emoji="updateEmoji"
              @submit="sendMessage">
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :typing="typing.messages"></chat-typing-component>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Thread -->
      <v-col cols="3" v-if="isThreadOpen">
        <message-thread-component v-model:thread-card="isThreadOpen" :message="threadMessage" :typing="typing.thread"
          :user="user" @update:thread-card="isThreadOpen = $event"
          @send-thread-message="$emit('sendThreadMessage', $event)"
          @update:thread-typing="$emit('threadTyping', $event)"></message-thread-component>
      </v-col>
    </v-row>
  </v-container>
</template>
