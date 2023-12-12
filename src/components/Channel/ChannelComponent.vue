<script setup lang="ts">
import { ref, inject, watch, computed } from "vue";
import { provide, shallowRef } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import {
  CreateChannelComponent,
  MessageContentComponent,
  MessageThreadComponent,
} from "@/components/Channel";
import type {
  Channels,
  ChannelMembers,
  ChannelMessages,
  ChannelTyping,
} from "@/types/Channel";
import type {
  ChannelForm,
  ChannelSettings,
  SendThreadPayload,
} from "@/types/Channel";
// types
import type { UserSessionData } from "@/types/User";


const user = inject<UserSessionData>("user");

const messageInput = ref("");
const uploadedFiles = ref<File[]>([]);
const isScroll = ref(false);

// Props
const props = defineProps<{
  channel: Channels | null;
  typing: Record<"channel" | "thread", ChannelTyping | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    channels: boolean;
  };
  isMessageDelete?: boolean;
  selected: boolean
}>();

// emits
const emit = defineEmits<{
  seen: [value: boolean];
  newMessagesCount: [value: number];
  downloadFile: [value: { name: string; path: string }];

  // checked
  leaveChannel: [value: { _channelID: string; name: string }];
  channelTyping: [value: string];
  threadTyping: [value: string];
  editMessage: [
    value: {
      _messageId: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  deleteMessage: [value: string | number];
  sendThreadMessage: [payload: SendThreadPayload];
  loadMoreMessages: [
    _channelID: string | number,
    offset: number,
    unshift: boolean
  ];
  sendMessage: [payload: { content: string; files?: File[] }];
  archiveChannel: [value: { _channelID: string; name: string }];
  updateChannelSettings: [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
  updateChannel: [value: ChannelForm];
  "update:channelMembers": [
    { add: ChannelMembers[]; remove: ChannelMembers[] }
  ];
}>();

// checked
const editMessage = (event: {
  _messageId: string | number;
  editContent: string;
  content: string;
  updatedAt: string;
}) => {
  emit("editMessage", event);
};

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
  isScroll.value = true;
};

const totalChannelMemebers = computed((): number => {
  if (props?.channel?.members) {
    return props.channel.members.length;
  }
  return 0;
});

watch(messageInput, (newValue) => {
  emit("channelTyping", newValue);
});

const loadMoreMessages = (
  _channelID: string | number,
  offset: number,
  unshift: boolean
) => {
  emit("loadMoreMessages", _channelID, offset, unshift);
};

// thread
const isThreadOpen = shallowRef(false);
provide("isStartThread", isThreadOpen);
const threadMessage = ref<ChannelMessages>();

const startThread = (message: ChannelMessages) => {
  threadMessage.value = message;
};
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`channel${channel?._channelID}`" :class="selected ? '' : 'd-none'"
    fluid>
    <v-row>
      <v-col>
        <v-card class="mx-auto" id="channel-container" :key="`channel${channel?._channelID}`" elevation="3">
          <v-card-title>
            <v-btn append-icon="mdi-menu-down" variant="text">
              {{ channel?.channelName }}
              <create-channel-component :key="`channel-manage${channel?._id}`" :channel="channel"
                :is-loading="isLoading.channels" @update:channel-settings="
                  $emit('updateChannelSettings', $event)
                  " @archive-channel="$emit('archiveChannel', $event)" @create-channel="$emit('updateChannel', $event)"
                @leave-channel="$emit('leaveChannel', $event)"
                @update:channel-members="$emit('update:channelMembers', $event)"
                @update-channel="$emit('updateChannel', $event)">
              </create-channel-component>
            </v-btn>
            <!-- Members -->
            <v-btn class="float-right" color="pink" variant="plain">
              <v-icon start icon="mdi-account-group-outline"></v-icon>
              {{ totalChannelMemebers }}
              <create-channel-component :channel="channel" :is-loading="isLoading.channels"
                :key="`channel-members${channel?._id}`" @update:channel:members="$emit('update:channelMembers', $event)"
                members>
              </create-channel-component>
            </v-btn>
          </v-card-title>
          <v-divider :thickness="3" color="success"></v-divider>
          <message-content-component :key="`channel-${channel?._channelID}`" :thread-typing="typing.thread" :is-loading="isLoading"
            :channel="channel" :is-delete="isMessageDelete" :is-scroll="isScroll" @load-more-messages="loadMoreMessages"
            @delete-message="$emit('deleteMessage', $event)" @edit-message="editMessage"
            @update:scroll="isScroll = $event" @start:thread="startThread">
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component :id="channel?._channelID" :key="`channel-${channel?._channelID}`"
              v-model:model-value="messageInput" v-model:files="uploadedFiles" :text-area-row-height="10"
              :text-area-rows="2" :text-area-label="$lang('channel.input.send', [channel?.channelName])
                " :auto-grow="true" @update:emoji="updateEmoji" @submit="sendMessage">
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :typing="typing.channel"></chat-typing-component>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Thread -->
      <v-col cols="3" v-if="isThreadOpen">
        <message-thread-component v-model:thread-card="isThreadOpen" :message="threadMessage"
          :channelName="channel?.channelName" :typing="typing.thread" :uuid="user?._uuid"
          @update:thread-card="isThreadOpen = $event" @on:send-thread-message="$emit('sendThreadMessage', $event)"
          @on:thread-typing="$emit('threadTyping', $event)"></message-thread-component>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
.text-divider {
  --text-divider-gap: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.text-divider::before,
.text-divider::after {
  content: "";
  height: 1px;
  background-color: silver;
  flex-grow: 1;
}

.text-divider::before {
  margin-right: var(--text-divider-gap);
}

.text-divider::after {
  margin-left: var(--text-divider-gap);
}
</style>
