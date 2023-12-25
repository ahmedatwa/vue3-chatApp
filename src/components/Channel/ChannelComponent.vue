<script setup lang="ts">
import { ref, provide, computed } from "vue";
import { ChatFormComponent, ChatTypingComponent, MessageThreadComponent } from "@/components/Chat";
import { CreateChannelComponent, MessageContentComponent } from "@/components/Channel";
// types
import type { SearchUsers, Typing, SendThreadPayload, TenorGifs } from "@/types/Chat";
import type { Channels, ChannelMembers, ChannelMessages } from "@/types/Channel";
import type { ChannelForm, ChannelSettings } from "@/types/Channel";

const isScroll = ref(false);

// Props
const props = defineProps<{
  channel: Channels | null;
  searchUsers: SearchUsers[]
  typing: Record<"channel" | "thread", Typing | null>;
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
  "update:typing": [value: number];
  // checked
  leaveChannel: [value: { _channelID: string; name: string }];
  editMessage: [
    value: {
      _messageID: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  deleteMessage: [value: string | number];
  loadMoreMessages: [
    _channelID: string | number,
    offset: number,
    unshift: boolean
  ];
  "update:sendMessage": [value: { content: string; files: File[] | TenorGifs | null }];
  archiveChannel: [value: { _channelID: string; name: string }];
  updateChannelSettings: [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
  updateChannel: [value: ChannelForm];
  "update:channelMembers": [
    { add: ChannelMembers[]; remove: ChannelMembers[] }
  ];
  "update:messageReaction": [value: { _id: string | number; emoji: string }];
  "update:threadTyping": [value: number];
  "send:threadMessage": [value: SendThreadPayload];
}>();



const totalChannelMemebers = computed((): number => {
  if (props?.channel?.members) {
    return props.channel.members.length;
  }
  return 0;
});


const loadMoreMessages = (
  _channelID: string | number,
  offset: number,
  unshift: boolean
) => {
  emit("loadMoreMessages", _channelID, offset, unshift);
};

// thread
const isThread = ref(false);
provide("isThread", isThread);
const threadMessage = ref<ChannelMessages | null>(null);
const startThread = (message: ChannelMessages) => {
  isThread.value = true
  threadMessage.value = message;
};

const sendThreadMessage = (message: SendThreadPayload) => {
  if (props.channel?._channelID) {
    emit("send:threadMessage", {
      ...message,
      _channelID: props.channel?._channelID as string,
    })
  }


}
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2" :id="`channel-${channel?._channelID}`" :class="selected ? '' : 'd-none'"
    fluid>
    <v-row>
      <v-col :id="`main-channel-${channel?._channelID}`">
        <v-card class="mx-auto" id="channel-container" :key="`channel${channel?._channelID}`" elevation="3">
          <v-card-title>
            <v-btn append-icon="mdi-menu-down" variant="text">
              {{ channel?.channelName }}
              <create-channel-component :key="`channel-manage${channel?._id}`" :channel="channel"
                :search-users="searchUsers" :is-loading="isLoading.channels" @update:channel-settings="$emit('updateChannelSettings', $event)
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
          <message-content-component :key="`channel-${channel?._channelID}`" :thread-typing="typing.thread"
            :is-loading="isLoading" :channel="channel" :is-delete="isMessageDelete" :is-scroll="isScroll"
            @load-more-messages="loadMoreMessages" @delete-message="$emit('deleteMessage', $event)"
            @edit-message="$emit('editMessage', $event)" @update:scroll="isScroll = $event"
            @update:thread-messages="startThread" @update:message-reaction="$emit('update:messageReaction', $event)">
          </message-content-component>
          <v-card-actions class="w-100 d-inline-block">
            <chat-form-component :id="channel?._channelID" :key="`channel-${channel?._channelID}`"
              :text-area-row-height="10" :text-area-rows="2"
              :text-area-label="$lang('channel.input.send', [channel?.channelName])"
              @update:submit="$emit('update:sendMessage', $event)" auto-grow upload-button>
            </chat-form-component>
            <!-- Typing -->
            <chat-typing-component :typing="typing.channel"></chat-typing-component>
          </v-card-actions>
        </v-card>
      </v-col>
      <!-- Thread -->
      <v-col cols="3" v-if="isThread" :id="`channel-thread-${channel?._channelID}`">
        <message-thread-component :typing="typing.thread" :message="(threadMessage as ChannelMessages)"
          :is-loading="isLoading.thread" :title="channel?.channelName" height="435px"
          @send:thread-message="sendThreadMessage" @update:thread-typing="$emit('update:threadTyping', $event)">
        </message-thread-component>
      </v-col>
    </v-row>
  </v-container>
</template>