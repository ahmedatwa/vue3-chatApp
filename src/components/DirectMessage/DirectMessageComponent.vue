<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import { formatDate, formatTimeShort } from '@/helpers'
// types
import type { TypingEvent } from "@/types";
import type { User } from "@/types/User.ts";


const messageInput = ref("")
const uploadedFiles = ref<File[]>([]);

// Props
const props = defineProps<{
  selectedUser: User | null;
  typing?: TypingEvent | null;
  isLoadingUsers: boolean;
}>();

// emits 
const emit = defineEmits<{
  "sendMessage": [payload: { content: string; files?: File[] }];
  "update:typing": [value: string],
  "update:seen": [value: boolean],
  "update:newMessagesCount": [value: number],
}>()

// group messages by date
// const userMessages = computed(() => {
//   if (props.selectedUser?.messages) {
//     return props.selectedUser.messages.reduce((result: any, value) => {
//       const date = value.createdAt.split(' ')[0];
//       (result[date] || (result[date] = [])).push(value);
//       return result;
//     }, {});
//   }
// })

const handleScroll = (): void => {
  const el = document.querySelector(".v-virtual-scroll");
  el?.scroll({ top: el?.scrollHeight, behavior: "instant" });
};

onMounted(() => {
  handleScroll();
});


const updateEmoji = (emoji: string) => {
  messageInput.value += emoji;
};

const sendMessage = () => {
  emit("sendMessage", {
    content: messageInput.value,
    files: uploadedFiles.value,
  });
  messageInput.value = "";
  uploadedFiles.value = [];
  //isScroll.value = true
};


</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`direct-message-${selectedUser?._uuid}`">
    <v-card class="mx-auto" id="container" :loading="isLoadingUsers">
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

      <v-virtual-scroll :height="500" :items="[selectedUser?.messages]">
        <template v-slot:default="{ item }">
          <v-list v-for="(message, index) in item" :key="index" :id="`list-${index}`">
            <v-list-subheader :key="index" class="d-flex justify-center">
              {{ formatDate(index, true) }}
            </v-list-subheader>


            <v-list-item v-for="($mess, i) in message" :key="i" :id="`list-${index}`">
              <v-list-item-title v-if="$mess.fromSelf" :key="$mess.from" :id="`id-${$mess._id}`">
                <div>{{ formatTimeShort($mess.createdAt) }} <span class="font-weight-bold text-teal">
                    {{ currentUser.displayName }}</span> : <span>{{ $mess.content }}</span>
                  <v-img v-if="$mess.file" :width="150" :src="$mess.file" aspect-ratio="16/9" cover>{{ $mess.name
                  }}</v-img>

                </div>
              </v-list-item-title>
              <v-list-item-title v-else :key="$mess.to" :id="`id-${$mess._id}`">
                <div>{{ formatTimeShort($mess.createdAt) }} <span class="font-weight-bold text-light-blue">
                    {{ selectedUser?.displayName }}</span> : <span>{{ $mess.content }}</span>
                  <v-img v-if="$mess.file" :width="150" :src="$mess.file" aspect-ratio="16/9" cover>{{ $mess.name
                  }}</v-img>

                </div>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-virtual-scroll>
      <v-sheet>
        <v-card-actions class="w-100 d-inline-block">
          <chat-form-component :key="`channel-${selectedUser?._uuid}`" v-model:model-value="messageInput"
          v-model:files="uploadedFiles" @update:emoji="updateEmoji" :text-area-row-height="10" :text-area-rows="2"
          @submit="sendMessage" :text-area-label="$lang('text.sendMessage')" autoGrow upload>
        </chat-form-component>
        <chat-typing-component v-if="typing" :typing="typing"></chat-typing-component>
        </v-card-actions>
      </v-sheet>
    </v-card>
  </v-container>
</template>
