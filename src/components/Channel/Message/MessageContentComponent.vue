<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { inject } from "vue";
import { formatTimeShort, formatDateLong } from "@/helpers";
import { ChannelActionMenu } from "@/components/Channel";
import type { ChannelMessages, Channels } from "@/types/Channel";
import type { SendThreadPayload, Pagination, Typing } from "@/types/Channel";
import { User } from "@/types/User";

const currentUser = inject<User>("user");
const pagination = ref<Pagination>({
  total: 0,
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
  threadTyping: Typing | null;
}>();

// emits
const emit = defineEmits<{
  "on:deleteMessage": [value: number];
  "on:sendMessageThread": [payload: SendThreadPayload];
  "on:editMessage": [
    value: {
      _messageId: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  "on:loadMoreMessages": [
    _channelID: string | number,
    limit: number,
    offset: number,
    unshift: boolean
  ];
  "update:scroll": [value: boolean];
  "on:threadTyping": [value: string];
  "on:threadMessageContent": [value: ChannelMessages];
}>();

// group messages by date
const channelMessages = computed(() => {
  if (props.channel?.messages) {
    return props.channel.messages.reduce((result: any, value) => {
      const date = value.createdAt.split(" ")[0];
      (result[date] || (result[date] = [])).push(value);
      return result;
    }, {});
  }
});

// Load More
const loadMoreMessages = () => {
  if (pagination.value.offset < 0) {
    return;
  }
  if (props.channel?._channelID) {
    emit(
      "on:loadMoreMessages",
      props.channel?._channelID,
      pagination.value.limit,
      pagination.value.offset,
      true
    );
  }
};

// Watchers
watch(
  () => props.channel?.pagination,
  (value) => {
    if (value) {
      pagination.value = value;
    }
  }
);

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

const isLoadMoreDisabled = computed(() => {
  return pagination.value.offset < 0;
});

const autoScroll = () => {
  if (lastRow.value) {
    setTimeout(() => {
      console.log(lastRow.value);

      lastRow.value?.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      })
    }, 200);
  }


  // setTimeout(() => {
  //   const el = itemRef.value.$el.children[1].lastChild;
  //   if (el) {
  //     el?.lastChild.scrollIntoView({
  //       behavior: "instant",
  //       block: "start",
  //       inline: "nearest",
  //     });
  //   }
  // }, 1200);
};

onMounted(() => {
  setTimeout(() => {
      console.log(lastRow.value);

      lastRow.value?.scrollIntoView({
        behavior: "instant",
        block: "start",
        inline: "nearest",
      })
    }, 200);
});

</script>
<template>
  <v-container class="container">
    <v-sheet :align="'center'" justify="center" class="my-2">
      <v-btn :loading="isLoading.messages" :disabled="isLoadMoreDisabled" variant="plain" prepend-icon="mdi-refresh"
        :color="isLoadMoreDisabled ? 'error' : 'success'" @click="loadMoreMessages">
        {{ $lang("button.loadMore") }}
      </v-btn>
    </v-sheet>
    <v-row no-gutters v-for="(channelMessage, index) in channelMessages" :key="index">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-slide-x-transition group mode="in-out" tag="v-col">
        <v-col v-for="message in channelMessage" :key="message._id" cols="12" class="mb-2">
          <channel-action-menu :message="message" :is-thread-loading="isLoading.thread" :thread-typing="threadTyping"
            @on:edit-message="$emit('on:editMessage', $event)"
            @on:send-message-thread="$emit('on:sendMessageThread', $event)"
            @on:delete-message="$emit('on:deleteMessage', $event)" @on:thread-typing="$emit('on:threadTyping', $event)"
            @update:thread-message="$emit('on:threadMessageContent', $event)">
          </channel-action-menu>
          {{ formatTimeShort(message.createdAt) }}
          <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
            {{ message.fromName }}:
          </span>
          <span class="font-weight-bold text-blue" v-else>
            {{ message.fromName }}:
          </span>
          <span v-if="message.editContent" class="text-caption me-1">
            {{ $lang("text.edited") }}</span>
          <span v-else>{{ message.content }}</span>
        </v-col>
      </v-slide-x-transition>
    </v-row>
    <span ref="lastRow" class="last-ref">last</span>
  </v-container>
</template>
<style scoped>
.container {
  overflow-y: scroll;
  min-height: 400px;
  max-height: 500px;
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
