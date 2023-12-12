<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { inject, onMounted, watchEffect } from "vue";
import { MessageActionMenu } from "@/components/Channel";
// types
import type { ChannelMessages, Channels } from "@/types/Channel";
import type { Pagination, ChannelTyping } from "@/types/Channel";
import type { User } from "@/types/User";
import { formatTimeShort, formatDateLong } from "@/helpers";

const currentUser = inject<User>("user");
const isLoadMore = ref(true)
const pagination = ref<Pagination>({
  offset: 0,
  limit: 0,
});

// props
const props = defineProps<{
  channel: Channels | null;
  isDelete?: boolean;
  isScroll?: boolean;
  isLoading: {
    messages: boolean;
    thread: boolean;
    channels: boolean;
  };
  threadTyping: ChannelTyping | null;
}>();

// emits
const emit = defineEmits<{
  "deleteMessage": [value: number];
  "editMessage": [
    value: {
      _messageId: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  "loadMoreMessages": [
    _channelID: string | number,
    offset: number,
    unshift: boolean
  ];
  "update:scroll": [value: boolean];
  "start:thread": [value: ChannelMessages]
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

watch(
  () => props.isScroll,
  (scroll) => {
    if (scroll) {
      autoScroll();
      emit("update:scroll", false);
    }
  }
);

const autoScroll = () => {
  if (lastRow.value) {
    setTimeout(() => {
      lastRow.value?.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      });
    }, 200);
  }

};

onMounted(() => {
  setTimeout(() => {
    lastRow.value?.scrollIntoView({
      behavior: "instant",
      block: "start",
      inline: "nearest",
    });
  }, 200);
});
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
    <v-row no-gutters v-for="(channelMessage, index) in channelMessages" :key="index" v-if="!isLoading.messages">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-slide-x-transition group mode="out" tag="v-col">
      <v-col v-for="message in channelMessage" :key="message._id" id="tes" cols="12" class="my-4">
        <message-action-menu id="channel" :message="message" @edit-message="$emit('editMessage', $event)"
          @delete-message="$emit('deleteMessage', $event)"
          @start:thread="$emit('start:thread', $event)">
        </message-action-menu>
        {{ formatTimeShort(message.createdAt) }}
        <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
          {{ message.fromName }}:
        </span>
        <span class="font-weight-bold text-blue" v-else>
          {{ message.fromName }}:
        </span>
        <span v-if="message.editContent" class="text-caption me-1">
          {{ $lang("chat.text.edited") }} {{ message.content }}</span>
        <span class="text-left" v-else>{{ message.content }}</span>
      </v-col>
      </v-slide-x-transition>
    </v-row>
    <span ref="lastRow" class="last-ref">last</span>
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

.last-ref {
  opacity: 0;
  scroll-margin-top: 1em;
}
</style>
