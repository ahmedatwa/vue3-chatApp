<script setup lang="ts">
import { ref, watch, inject, computed } from "vue";
import { watchEffect, nextTick } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
//types 
import type { User, UserMessages } from "@/types/User";
import type { ChannelMessages } from "@/types/Channel"
import type { Typing, SendThreadPayload } from "@/types/Chat";

const currentUser = inject<User>("user");
const isThread = inject<boolean>("isThread");
const formInputValue = ref("");
const uploadFiles = ref<File[] | null>(null);
const lastRef = ref<HTMLDivElement | null>(null)

const props = defineProps<{
  selectedUser?: User | null;
  message: UserMessages | ChannelMessages | null
  typing: Typing | null;
  isLoading: boolean;
  title?: string;
  height?: string | number
}>();

const emit = defineEmits<{
  "send:threadMessage": [value: SendThreadPayload];
  "update:threadTyping": [value: number];
}>();


const updatethreadMessageEmoji = (emoji: string) => {
  formInputValue.value += emoji;
};

const sendThreadMessage = () => {
  if (formInputValue.value.length || uploadFiles.value !== null) {

    if (props.message) {
      let toName = null
      if ("fromName" in props.message) {
        toName = props.message?.fromName
      }
      
      emit("send:threadMessage", {
        _messageID: props.message?._id,
        _channelID: props.selectedUser?._channelID ? props.selectedUser?._channelID : null,
        to: props.message?.from,
        toName: toName,
        content: formInputValue.value,
        files: uploadFiles.value,
      });
      formInputValue.value = "";
      uploadFiles.value = [];
    }
  }
};

watch(formInputValue, (threadM) => {
  emit("update:threadTyping", threadM.length);
});


watchEffect(() => {
  if (props.message?.thread?.length) {
    nextTick(() => {
      lastRef.value?.scrollIntoView(true)
    })
  }
})

const threadTitle = computed(() => {
  return props.title ? props.title : props.selectedUser?.displayName
})

const cssVars = computed(() => {
  return {
    '--card-height': props.height,
  }
})
</script>

<template>
  <v-slide-x-reverse-transition mode="in-out">
    <v-card class="mx-auto overflow-y-auto" elevation="3" v-if="isThread" :model-value="isThread" :loading="isLoading">
      <v-card-title>
        <span class="text-subtitle-1">{{ $lang("chat.text.threadTitle", [threadTitle]) }}</span>
        <v-icon class="float-right" size="small" icon="mdi-close-circle-outline" @click="isThread = false"
          color="error"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="warning"></v-divider>
      <v-card-text class="text" :style="cssVars">
        <div class="d-flex flex-wrap overflow-y-auto" :id="`thread-container-${message?._id}`">
          <div class="flex-1-1-100 mx-2 py-2" v-for="thread in message?.thread" :key="thread._id">
            <span class="font-weight-bold text-teal" v-if="thread?.from === currentUser?._uuid">
              {{ currentUser?.displayName }}:
            </span>
            <span class="font-weight-bold text-blue" v-else>
              {{ selectedUser?.displayName }}:
            </span>
            <span>{{ thread.content }}</span>
          </div>
          <span ref="lastRef"></span>
        </div>
      </v-card-text>
      <v-card-actions class="w-100 d-inline-block">
        <chat-form-component :id="`chat-form${message?._id}`" :key="`chat-form-${message?._id}`"
          v-model:input-value="formInputValue" v-model:files="uploadFiles" :text-area-row-height="5" :text-area-rows="2"
          :text-area-label="$lang('chat.input.reply')" @update:emoji="updatethreadMessageEmoji"
          @update:submit="sendThreadMessage" upload-button auto-grow>
        </chat-form-component>
        <chat-typing-component v-show="typing" :typing="typing"></chat-typing-component>
      </v-card-actions>
    </v-card>
  </v-slide-x-reverse-transition>
</template>
<style scoped>
.text {
  overflow-y: scroll;
  height: var(--card-height);
  scroll-snap-type: y mandatory;
  overflow-x: hidden;
}
</style>
