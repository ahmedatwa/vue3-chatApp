<script setup lang="ts">
import { computed, ref, nextTick } from "vue";
import { inject, watchEffect } from "vue";
import { MessageActionMenu, MessageThreadChipComponent } from "@/components/Chat";
import { MessageContentBodyComponent } from "@/components/Chat";
// types
import type { ChannelMessages, Channels } from "@/types/Channel";
import type { MessagePagination, Typing, UploadedFiles } from "@/types/Chat";
import type { UserSessionData } from "@/types/User";
import { formatDateLong } from "@/helpers";

const currentUser = inject<UserSessionData>("user");
const isLoadMore = ref(true)
const pagination = ref<MessagePagination>({
  offset: 0,
  limit: 0,
  total: 0
});

// props
const props = defineProps<{
  channel: Channels | null;
  isDelete?: boolean;
  isLoading: {
    messages: boolean;
    thread: boolean;
    channels: boolean;
  };
  threadTyping: Typing | null;
  isScroll: { start: boolean; end: boolean } | null
}>();

// emits
const emit = defineEmits<{
  deleteMessage: [value: number | string];
  editMessage: [
    value: {
      _messageID: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  loadMoreMessages: [
    _channelID: string | number,
    offset: number,
    unshift: boolean
  ];
  "update:threadMessages": [value: ChannelMessages];
  "update:scroll": [value: boolean];
  "update:messageReaction": [value: { _id: string | number; emoji: string }];
  "update:deleteFile": [value: { fileID: string | number, messageID: string | number }];
  "update:downdloadFile": [value: UploadedFiles];
}>();

// group messages by date
const channelMessages = computed(() => {
  if (props.channel?.messages) {
    return props.channel.messages.reduce((result: any, value) => {
      const date = value.createdAt.split(" ")[0];
      (result[date] || (result[date] = [])).push(value);

      return result;
    }, {})
  }
});

// Load More
const loadMoreMessages = () => {
  if (pagination.value.offset < 0) {
    return;
  }
  if (props.channel?._channelID) {
    emit(
      "loadMoreMessages",
      props.channel?._channelID,
      pagination.value.offset,
      true
    );
  }
};

// Watchers
watchEffect(() => {
  if (props.channel?.pagination) {
    pagination.value = props.channel?.pagination;
    if (props.channel.pagination.offset < 0) {
      isLoadMore.value = false
    }
  }
});

const lastRow = ref<HTMLDivElement | null>(null);
const firstRow = ref<HTMLDivElement | null>(null);

watchEffect(() => {
  if (props.channel?.messages?.length) {
    if (props.isScroll) {
      scroll(props.isScroll);
    }
  }
});

const scroll = (direction: { start: boolean, end: boolean }) => {
  if (direction.start) {
    nextTick(() => {
      firstRow.value?.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "end"
      });
    });
  } else if (direction.end) {
    nextTick(() => {
      lastRow.value?.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "start"
      });
    });
  }
};

const actionMenu = ref(false);
const actionMenuID = ref<any>();
const showActionMenu = (visible: boolean, id?: ChannelMessages) => {
  actionMenu.value = visible;
  actionMenuID.value = id;
};

</script>
<template>
  <v-container class="container">
    <v-sheet :align="'center'" justify="center" class="my-2">
      <v-slide-y-transition>
        <v-btn :loading="isLoading.messages" v-if="isLoadMore" variant="plain" prepend-icon="mdi-refresh" color="success"
          @click="loadMoreMessages">
          {{ $lang("chat.button.loadMore") }}
        </v-btn>
      </v-slide-y-transition>
    </v-sheet>
    <span ref="firstRow"></span>

    <v-row no-gutters v-for="(channelMessage, index) in channelMessages" :key="index" v-if="!isLoading.messages">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-col v-for="message in channelMessage" :key="message._id" cols="12" :id="`col-${message._id}`"
        @mouseover="showActionMenu(true, message._id)" class="ma-1 pa-2 column__wrapper">
        <v-sheet :key="`message-wrapper-${message._id}`" class="transparent">
          <!-- Thread Chip -->
          <message-thread-chip-component v-if="message.thread" :key="`channel-thread-chip-${message._id}`"
            :message="(message as ChannelMessages)"
            @update:thread-messages="$emit('update:threadMessages', $event as ChannelMessages)">
          </message-thread-chip-component>
          <!-- Body -->
          <message-content-body-component :key="message._id" :message="message"
            :current-user="currentUser" @update:delete-file="$emit('update:deleteFile', $event)"
            @update:downdload-file="$emit('update:downdloadFile', $event)"
            @update:message-reaction="$emit('update:messageReaction', $event)">
          </message-content-body-component>
          <!-- message-action-menu -->
          <message-action-menu v-if="actionMenuID === message._id" :message-value="actionMenuID"
            :key="`action-menu${message._id}`" :message="message" :action-menu="actionMenu"
            @edit-message="$emit('editMessage', $event)" @delete-message="$emit('deleteMessage', $event)"
            @update:action-menu="actionMenu = $event"
            @update:thread-messages="$emit('update:threadMessages', $event as ChannelMessages)"
            @update:messageReaction="$emit('update:messageReaction', $event)">
          </message-action-menu>
        </v-sheet>
      </v-col>
    </v-row>
    <span ref="lastRow" class="last-row"></span>
  </v-container>
</template>
<style scoped>
.container {
  overflow-y: scroll;
  min-height: 430px;
  max-height: 450px;
  scroll-snap-type: y mandatory;
  overflow-x: hidden;
}

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
  background-color: #eee;
  flex-grow: 1;
}

.text-divider::before {
  margin-right: var(--text-divider-gap);
}

.text-divider::after {
  margin-left: var(--text-divider-gap);
}

.transparent {
  background-color: transparent;
}

.column__wrapper {
  position: relative;
}

.column__wrapper:hover {
  background-color: rgb(var(--v-theme-on-surface-variant));
  height: auto;
  border-radius: 6px;
}
.last-row {
  scroll-snap-align: end;
  scroll-margin-bottom: 20px;
}
</style>