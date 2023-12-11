<script setup lang="ts">
import { ref, watch, inject, watchEffect, nextTick } from "vue";
import { UserMessages, UserTyping, SendThreadPayload, User } from "@/types/User";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";

const currentUser = inject<User>("user");

const props = defineProps<{
  user: User | null;
  message: UserMessages | null;
  typing: UserTyping | null;
  threadCard: boolean;
  name?: string;
}>();

const emit = defineEmits<{
  "sendThreadMessage": [payload: SendThreadPayload];
  "update:threadTyping": [value: string];
  "update:threadCard": [value: boolean];
}>();

// Thread
const threadMessageInput = ref("");
const threadMessageFiles = ref<File[]>([]);

const updatethreadMessageEmoji = (emoji: string) => {
  threadMessageInput.value += emoji;
};

const sendThreadMessage = () => {
  if (props.message) {
    if (threadMessageInput.value || threadMessageFiles.value) {
      emit("sendThreadMessage", {
        _messageID: props.message?._id,
        _channelID: props.user?._channelID ? props.user?._channelID : '',
        to: props.message?.from,
        from: props.message?.from,
        content: threadMessageInput.value,
        files: threadMessageFiles.value,
      });
      threadMessageInput.value = "";
      threadMessageFiles.value = [];
    }
  }
};

watch(threadMessageInput, (threadM) => {
  emit("update:threadTyping", threadM);
});

const lastRef = ref<HTMLDivElement | null>(null)

watchEffect(() => {
  if(props.message?.thread?.length) {    
    nextTick(() => {
      lastRef.value?.scrollIntoView(true)
    })
  }
})
</script>

<template>
  <!-- <v-slide-x-reverse-transition mode="in-out"> -->
    <v-card class="mx-auto overflow-y-auto" :key="message?._id" elevation="3" :model-value="threadCard" v-if="threadCard">
      <v-card-title>
        <span class="text-subtitle-1">{{ $lang("chat.text.threadTitle", [user?.displayName]) }}</span>
        <v-icon class="float-right" size="small" icon="mdi-close-circle-outline"
          @click="$emit('update:threadCard', false)" color="error"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="warning"></v-divider>
      <v-card-text class="text">
        <div class="d-flex flex-wrap overflow-y-auto" :id="`thread-container-${message?._id}`">
          <div class="flex-1-1-100 mx-2 py-2" v-for="thread in message?.thread" :key="thread._id">
            <span class="font-weight-bold text-teal" v-if="thread?.from === currentUser?._uuid">
              {{ currentUser?.displayName }}:
            </span>
            <span class="font-weight-bold text-blue" v-else>
              {{ user?.displayName }}:
            </span>
            <span>{{ thread.content }}</span>
          </div>
          <span ref="lastRef"></span>
        </div>
      </v-card-text>
      <v-card-actions class="w-100 d-inline-block">
        <chat-form-component :id="message?._id" :key="`thread-${message?._id}`" v-model:model-value="threadMessageInput"
          v-model:files="threadMessageFiles" :text-area-row-height="5" :text-area-rows="2"
          :text-area-label="$lang('chat.input.reply')" :auto-grow="true" @update:emoji="updatethreadMessageEmoji"
          @submit="sendThreadMessage">
        </chat-form-component>
        <chat-typing-component v-show="typing" :typing="typing"></chat-typing-component>
      </v-card-actions>
    </v-card>
  <!-- </v-slide-x-reverse-transition> -->
</template>
<style scoped>
.text {
  overflow-y: scroll;
  height: 439px;
  scroll-snap-type: y mandatory;
  overflow-x: hidden;
}
</style>
