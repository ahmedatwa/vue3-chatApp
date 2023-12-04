<script setup lang="ts">
import { ref, provide, watch } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import { MessageContentComponent } from "@/components/DirectMessage";
// types
import type { User, UserTyping, UserMessages } from "@/types/User";


const messageInput = ref("")
const uploadedFiles = ref<File[]>([]);
const isScroll = ref(false)

// Props
defineProps<{
  selectedUser: User | null;
  typing: Record<"messages" | "thread", UserTyping | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
}>();

// emits 
const emit = defineEmits<{
  sendMessage: [value: {content: string, files: File[]}]
  userTyping: [value: string];
  threadTyping: [value: string];
}>()


const sendMessage = () => {
  emit("sendMessage", {
    content: messageInput.value,
    files: uploadedFiles.value,
  });
  messageInput.value = "";
  uploadedFiles.value = [];
  isScroll.value = true;
}

const updateEmoji = (emoji: string) => {
  messageInput.value += emoji;
};

watch(messageInput, (newValue) => {
  emit("userTyping", newValue);
});

// thread
const isThreadOpen = ref(false);
provide("isStartThread", isThreadOpen)
const threadMessage = ref<UserMessages | null>(null);

const startThread = ($event: { message: UserMessages }) => {
  threadMessage.value = null
  threadMessage.value = $event.message;
};

</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`direct-message-${selectedUser?._uuid}`">
    <v-card class="mx-auto" id="container" :loading="isLoading.messages">
      <v-card-title>
        <v-avatar>
          <v-img v-if="selectedUser?.image" :src="selectedUser?.image" alt="image"></v-img>
          <v-icon icon="mdi-account-circle" :color="selectedUser?.connected ? 'success' : 'dark'" v-else> </v-icon>
        </v-avatar>
        <v-badge dot inline :color="selectedUser?.connected ? 'success' : 'dark'">
          <p class="mr-1">{{ selectedUser?.displayName }}</p>
        </v-badge>
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>
      <message-content-component :selected-user="selectedUser" :is-loading="isLoading" @start:thread="startThread"> </message-content-component>
      
        <v-card-actions class="w-100 d-inline-block">
          <chat-form-component :key="`user-${selectedUser?._uuid}`" v-model:model-value="messageInput"
              v-model:files="uploadedFiles" :text-area-row-height="10" :text-area-rows="2"
              :text-area-label="$lang('text.sendMessage')" :auto-grow="true" @update:emoji="updateEmoji"
              @submit="sendMessage">
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :typing="typing.messages"></chat-typing-component>
        </v-card-actions>
    </v-card>
  </v-container>
</template>
