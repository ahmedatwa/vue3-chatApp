<script setup lang="ts">
import { ref, provide, inject } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import { MessageThreadComponent } from "@/components/Chat";
import { MessageContentComponent, DirectManageComponent } from "@/components/DirectMessage";
// types
import type { User, UserMessages, UserSessionData } from "@/types/User";
import type { Typing, SendThreadPayload, TenorGifs } from "@/types/Chat";
import type { UploadedFiles, MessageReactions } from "@/types/Chat";

const currentUser = inject<UserSessionData>("user");

// thread
const isThread = ref(false);
const threadMessage = ref<UserMessages | null>(null)
provide("isThread", isThread);

// Props
defineProps<{
  user: User | null;
  selected: boolean;
  typing: Record<"messages" | "thread", Typing | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
  isScroll: { start: boolean; end: boolean } | null
}>();

// emits
const emit = defineEmits<{
  "update:sendMessage": [value: { content: string; files: File[] | TenorGifs | null }];
  "update:typing": [value: number];
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
  "update:messageReaction": [value: MessageReactions];
  "update:threadTyping": [value: number];
  "send:threadMessage": [value: SendThreadPayload];
  "update:deleteFile": [value: { fileID: string | number, messageID: string | number }];
  "update:downdloadFile": [value: UploadedFiles];
  // 
  "update:formatting": [value: string[]];
  "update:alignment": [value: string];
  "update:selectedTxt": [value: string];
}>();

const updateMessageReaction = (event: { _id: string | number; emoji: string }) => {
  if (currentUser) {
    emit("update:messageReaction", {
      _uuid: currentUser?._uuid,
      _messageID: event._id,
      emoji: event.emoji,
      displayName: currentUser?.displayName,
    })
  }
}

const updateThread = (message: UserMessages) => {
  isThread.value = true
  threadMessage.value = message
}


</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`direct-message-${user?._uuid}`"
    :class="selected ? 'd-block' : 'd-none'" fluid>
    <v-row>
      <v-col :id="`direct-${user?._uuid}`">
        <v-card class="mx-auto" id="container" :loading="isLoading.messages">
          <v-card-title>
            <direct-manage-component :current-user="currentUser"
              ></direct-manage-component>
          </v-card-title>
          <v-divider :thickness="3" color="success"></v-divider>
          <message-content-component :key="`direct-${user?._uuid}`" :selected-user="user" :is-loading="isLoading"
            @update:thread-messages="updateThread" :is-scroll="isScroll"
            @load-more-messages="$emit('loadMoreMessages', $event)" @delete-message="$emit('deleteMessage', $event)"
            @edit-message="$emit('editMessage', $event)" @update:messageReaction="updateMessageReaction"
            @update:delete-file="$emit('update:deleteFile', $event)"
            @update:downdload-file="$emit('update:downdloadFile', $event)">
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component :id="user?._uuid" :key="`user-${user?._uuid}`" :text-area-row-height="10"
              :text-area-rows="2" :text-area-label="$lang('chat.input.send')"
              @update:typing="$emit('update:typing', $event)" @update:submit="$emit('update:sendMessage', $event)"
              upload-button auto-grow>
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :key="`direct-message-${user?._uuid}`"
              :typing="typing.messages"></chat-typing-component>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Thread -->
      <v-col cols="3" v-if="isThread" :id="`thread-${user?._uuid}`">
        <message-thread-component :typing="typing.thread" :message="(threadMessage as UserMessages)"
          :is-loading="isLoading.thread" :selected-user="user" height="455px"
          @send:thread-message="$emit('send:threadMessage', $event)"
          @update:thread-typing="$emit('update:threadTyping', $event)">
        </message-thread-component>
      </v-col>
    </v-row>
  </v-container>
</template>
