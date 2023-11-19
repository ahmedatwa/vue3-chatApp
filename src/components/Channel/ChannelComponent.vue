<script setup lang="ts">
import { MessageFormComponent } from "@/components/Message";
import {
  CreateChannelComponent,
  ChannelMessageComponent,
} from "@/components/Channel";

import { ref, inject, computed } from "vue";
import type { Channels, ChannelMembers } from "@/types/Channel.ts";
import type {
  ChannelForm,
  ChannelSettings,
  SendMessageThreadPayload,
} from "@/types/Channel.ts";
// types
import type { DBUser } from "@/types/User.ts";
import type { TypingEvent } from "@/types";
import type { UserSessionData } from "@/types/Session.ts";

const user = inject<UserSessionData>("user");

const messageInput = ref("");
const uploadedFiles = ref<File[]>([]);

// Props
defineProps<{
  allUsers: DBUser[];
  currentChannel: Channels | null;
  typing: TypingEvent | null;
  isLoading: boolean;
  isMessagesLoading: boolean;
  isMessageDelete: boolean;
  messagesPaginate: {
    limit: number;
    offset: number;
    total: number;
    end: boolean;
  };
}>();

// emits
const emit = defineEmits<{
  "update:typing": [value: string];
  "update:seen": [value: boolean];
  "update:newMessagesCount": [value: number];

  "leave:channel": [value: string];
  "download:file": [value: { name: string; path: string }];

  // checked
  "editMessage": [
    value: {
      _messageId: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  deleteMessage: [value: string | number];
  "send:messageThread": [payload: SendMessageThreadPayload];
  "load:moreMessages": [value: string];
  "send:message": [payload: { content: string; files?: File[] }];
  "archive:channel": [_channelID: string];
  "update:channel:settings": [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
  "update:channel": [value: ChannelForm];
  "add:channel:members": [value: ChannelMembers];
  "remove:channel:member": [value: string];
}>();

const archiveChannel = ($event: string) => {
  emit("archive:channel", $event);
};

const leaveChannel = (_channelId: string) => {
  emit("leave:channel", _channelId);
};
const updateChannel = ($event: ChannelForm) => {
  emit("update:channel", $event);
};

// const downloadFile = (name: string, path: string) => {
//   emit("download:file", { name, path });
// };

const addChannelMembers = ($event: ChannelMembers) => {
  emit("add:channel:members", $event);
};

const updateChannelSettings = ($event: {
  _channelID: string;
  _uuid: string;
  setting: ChannelSettings;
}) => {
  emit("update:channel:settings", $event);
};
const removeChannelMember = (_uuid: string) => {
  emit("remove:channel:member", _uuid);
};

// checked
const editMessage = (event: {
  _messageId: string | number;
  editContent: string;
  content: string;
  updatedAt: string;
}) => {
  emit("editMessage", event);
};

const deleteMessage = (_messageID: number | string) => {
  emit("deleteMessage", _messageID);
};
const loadMoreMessages = (_channelID: string) => {
  emit("load:moreMessages", _channelID);
};

const updateEmoji = (emoji: string) => {
  messageInput.value += emoji;
};

const sendMessage = () => {
  emit("send:message", {
    content: messageInput.value,
    files: uploadedFiles.value,
  });
  messageInput.value = "";
  uploadedFiles.value = [];
  //handleScroll();
};

const sendMessageThread = (payload: SendMessageThreadPayload) => {
  emit("send:messageThread", payload);
};

const isSendDisabled = computed(() => {
  if (messageInput.value.length > 0 || uploadedFiles.value?.length > 0) {
    return false;
  } else {
    return true;
  }
});
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-card class="mx-auto" id="channel-container" :loading="isMessagesLoading" elevation="3">
      <v-card-title>
        <v-btn append-icon="mdi-menu-down" variant="plain">
          {{ currentChannel?.channelName }}
          <create-channel-component v-if="currentChannel?.createdBy === user?._uuid"
            :key="`channel-manage${currentChannel?._id}`" :current-user="user" :channel="currentChannel"
            :all-users="allUsers" :is-loading="isLoading" @on:channel:settings="updateChannelSettings"
            @on:archive:channel="archiveChannel" @on:create:channel="updateChannel" @on:leave:channel="leaveChannel"
            @on:add:channel:members="addChannelMembers" @on:remove:member="removeChannelMember"
            @on:update:channel="updateChannel">
          </create-channel-component>
        </v-btn>
        <!-- Members -->
        <v-btn class="float-right" color="pink" variant="plain">
          <v-icon start icon="mdi-account-group-outline"></v-icon>
          {{ currentChannel?.members.length }}
          <create-channel-component v-if="currentChannel?.createdBy === user?._uuid" :current-user="user"
            :channel="currentChannel" :all-users="allUsers" :is-loading="isLoading"
            :key="`channel-members${currentChannel?._id}`" @on:add:channel:members="addChannelMembers"
            @on:remove:member="removeChannelMember" members>
          </create-channel-component>
        </v-btn>
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>
      <channel-message-component :channel="currentChannel" :uuid="user?._uuid" :is-delete="isMessageDelete"
        @on:load:more-messages="loadMoreMessages" :messages-paginate="messagesPaginate"
        @send:message-thread="sendMessageThread" @delete:message="deleteMessage"
        @edit:message="editMessage"></channel-message-component>
      <v-card-actions class="w-100 d-inline-block">
        <message-form-component :key="`channel-${currentChannel?._channelID}`" v-model:model-value="messageInput"
          v-model:files="uploadedFiles" @update:emoji="updateEmoji" :text-area-row-height="10" :text-area-rows="2"
          @send-message="sendMessage" autoGrow>
          <template #send>
            <v-btn icon="mdi-send" color="teal-lighten-1" :disabled="isSendDisabled" @click="sendMessage"></v-btn>
          </template>
        </message-form-component>
        <v-scroll-y-transition>
          <v-sheet :key="`typing${typing.isTyping}`" v-if="typing">
            <p class="font-weight-light ma-2">{{ typing.name }} is Typing...</p>
          </v-sheet>
        </v-scroll-y-transition>
      </v-card-actions>
    </v-card>
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
