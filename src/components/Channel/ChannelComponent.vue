<script setup lang="ts">
import { ref, inject, watch, computed } from "vue";
import { ChatFormComponent, ChatTypingComponent } from "@/components/Chat";
import {
  CreateChannelComponent,
  MessageContentComponent,
} from "@/components/Channel";
import type { Channels, ChannelMembers } from "@/types/Channel";
import type {
  ChannelForm,
  ChannelSettings,
  SendThreadPayload,
} from "@/types/Channel";
// types
import type { TypingEvent } from "@/types";
import type { UserSessionData } from "@/types/User";

const user = inject<UserSessionData>("user");

const messageInput = ref("");
const uploadedFiles = ref<File[]>([]);
const isScroll = ref(false);

// Props
const props = defineProps<{
  currentChannel: Channels | null;
  typing: Record<"channel" | "thread", TypingEvent | null>;
  isLoading: {
    messages: boolean;
    thread: boolean;
    channels: boolean;
  };
  isMessageDelete?: boolean;
}>();

// emits
const emit = defineEmits<{
  channelTyping: [value: string];
  threadTyping: [value: string];
  seen: [value: boolean];
  newMessagesCount: [value: number];
  leaveChannel: [value: string];
  downloadFile: [value: { name: string; path: string }];

  // checked
  editMessage: [
    value: {
      _messageId: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  deleteMessage: [value: string | number];
  newMessageThread: [payload: SendThreadPayload];
  loadMoreMessages: [
    _channelID: string | number,
    limit: number,
    offset: number,
    unshift: boolean
  ];
  sendMessage: [payload: { content: string; files?: File[] }];
  archiveChannel: [_channelID: string];
  updateChannelSettings: [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
  updateChannel: [value: ChannelForm];
  addChannelMembers: [value: ChannelMembers];
  removeChannelMember: [value: string];
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
  if (props?.currentChannel?.members) {
    return props.currentChannel.members.length;
  }
  return 0;
});

watch(messageInput, (newValue) => {
  emit("channelTyping", newValue);
});

const loadMoreMessages = (
  _channelID: string | number,
  limit: number,
  offset: number,
  unshift: boolean
) => {
  emit("loadMoreMessages", _channelID, limit, offset, unshift);
};
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-row>
      <v-col>
        <v-card
          class="mx-auto"
          id="channel-container"
          :loading="isLoading.messages"
          :key="`channel${currentChannel?._channelID}`"
          elevation="3"
        >
          <v-card-title>
            <v-btn append-icon="mdi-menu-down" variant="outlined">
              {{ currentChannel?.channelName }}
              <create-channel-component
                v-if="currentChannel?.createdBy === user?._uuid"
                :key="`channel-manage${currentChannel?._id}`"
                :current-user="user"
                :channel="currentChannel"
                :is-loading="isLoading.channels"
                @on:channel-settings="$emit('updateChannelSettings', $event)"
                @on:archive-channel="$emit('archiveChannel', $event)"
                @on:create-channel="$emit('updateChannel', $event)"
                @on:leave-channel="$emit('leaveChannel', $event)"
                @on:add-members="$emit('addChannelMembers', $event)"
                @on:remove-member="$emit('removeChannelMember', $event)"
                @on:update-channel="$emit('updateChannel', $event)"
              >
              </create-channel-component>
            </v-btn>
            <!-- Members -->
            <v-btn class="float-right" color="pink" variant="plain">
              <v-icon start icon="mdi-account-group-outline"></v-icon>
              {{ totalChannelMemebers }}
              <create-channel-component
                v-if="currentChannel?.createdBy === user?._uuid"
                :current-user="user"
                :channel="currentChannel"
                :is-loading="isLoading.channels"
                :key="`channel-members${currentChannel?._id}`"
                @on:add-channel:members="$emit('addChannelMembers', $event)"
                @on:remove-member="$emit('removeChannelMember', $event)"
                members
              >
              </create-channel-component>
            </v-btn>
          </v-card-title>
          <v-divider :thickness="3" color="success"></v-divider>
          <message-content-component
            :thread-typing="typing.thread"
            :is-loading="isLoading"
            :channel="currentChannel"
            :is-delete="isMessageDelete"
            :is-scroll="isScroll"
            @on:load-more-messages="loadMoreMessages"
            @on:send-message-thread="$emit('newMessageThread', $event)"
            @on:delete-message="$emit('deleteMessage', $event)"
            @on:edit-message="editMessage"
            @update:scroll="isScroll = $event"
            @on:thread-typing="$emit('threadTyping', $event)"
          >
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component
              :key="`channel-${currentChannel?._channelID}`"
              v-model:model-value="messageInput"
              v-model:files="uploadedFiles"
              :text-area-row-height="10"
              :text-area-rows="2"
              :text-area-label="$lang('text.sendMessage')"
              :auto-grow="true"
              @update:emoji="updateEmoji"
              @submit="sendMessage"
            >
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component
              v-show="typing.channel"
              :typing="typing.channel"
            ></chat-typing-component>
          </v-card-actions>
        </v-card>
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
