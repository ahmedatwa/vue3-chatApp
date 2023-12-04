<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { watch, onMounted } from "vue";
import { formatTimeShort, formatDateLong } from "@/helpers";
import type { ChannelMessages, Channels, SendThreadPayload } from "@/types/Channel";
import { ChannelActionMenu } from "@/components/Channel";
import type { TypingEvent } from "@/types";

const messagesTotal = ref(0)
const messagesLimit = ref(0)
const messagesOffset = ref(0)
const itemRefStart = ref()
// props
const props = defineProps<{
  channel: Channels | null;
  uuid: string | undefined;
  isDelete?: boolean;
  isSendMessage?: boolean;
  isLoading: {
    messages: boolean,
    thread: boolean,
    channels: boolean
  };
  threadTyping: TypingEvent | null;
}>()

// emits
const emit = defineEmits<{
  "on:deleteMessage": [value: number];
  "on:sendMessageThread": [payload: SendThreadPayload]
  "on:editMessage": [value: { _messageId: string | number, editContent: string, content: string, updatedAt: string; }];
  "on:loadMoreMessages": [_channelID: string | number, limit: number, offset: number, unshift: boolean];
  "on:scroll": [value: boolean];
  "on:threadTyping": [value: string];
  "on:threadMessageContent": [value: ChannelMessages]
}>()

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

onMounted(() => {
  if (props.channel?.messagesLimit) {
    messagesLimit.value = props.channel?.messagesLimit
  }
})

const loadMoreMessages = () => {
  if (messagesOffset.value <= 0) {
    return;
  }
  if (props.channel?._channelID) {
    emit("on:loadMoreMessages", props.channel?._channelID, messagesLimit.value, messagesOffset.value, true)
    messagesOffset.value = Math.ceil(messagesOffset.value - messagesLimit.value)
    // Scroll
    
    nextTick(() => {
      itemRefStart.value?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
        inline: "start"
      })
    })
    autoScroll(false)
  }

}

const isLoadingMoreDisabled = computed(() => {
  if (messagesOffset.value < 0) {
    return true
  }
  return false
})

// Watchers
watch(
  () => props.channel?.messagesTotal, (total) => {
    if (total) {
      messagesTotal.value = total
      messagesOffset.value = Math.ceil(total - messagesLimit.value)
    }
  })


const itemRefDown = ref<HTMLDivElement | null>(null)

const autoScroll = (auto: boolean) => {
  if(auto === true)
  nextTick(() => {
    itemRefDown.value?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
      inline: "start"
    })
  })
  
}

const onIntersect = (isIntersecting, entries, observer) => {
  console.log(isIntersecting, entries, observer);
  
}



</script>
<template>
  <v-container class="card" :id="`messages-container-${channel?._channelID}`">
    <v-infinite-scroll :height="430" side="start" mode="manual" empty-text="" >
      <div ref="itemRefStart"></div>
      <v-row no-gutters >
        <template v-for="(channelMessage, index) in channelMessages" :key="index">
          <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">{{ formatDateLong(index) }}</v-col>
          <v-slide-x-transition group mode="out" tag="v-col">
            <v-col v-for="message in channelMessage" :key="message._id" cols="12" class="mb-2" v-intersect="onIntersect">
              <channel-action-menu 
                :message="message" 
                :is-thread-loading="isLoading.thread" 
                :thread-typing="threadTyping"
                @on:edit-message="$emit('on:editMessage', $event)"
                @on:send-message-thread="$emit('on:sendMessageThread', $event)"
                @on:delete-message="$emit('on:deleteMessage', $event)" 
                @on:thread-typing="$emit('on:threadTyping', $event)"
                @update:thread-message="$emit('on:threadMessageContent', $event)">
              </channel-action-menu>
              {{ formatTimeShort(message.createdAt) }}
              <span class="font-weight-bold text-teal" v-if="message.from === uuid">
                {{ message.fromName }}: </span>
              <span class="font-weight-bold text-blue" v-else>
                {{ message.fromName }}: </span>
              <span v-if="message.editContent" class="text-caption me-1">
                {{ $lang("text.edited") }}</span>
              <span v-else>{{ message.content }}</span>
            </v-col>
          </v-slide-x-transition>
          
        </template>

      </v-row>
      <template #load-more>
        <v-btn v-if="!isLoadingMoreDisabled" :loading="isLoading.messages" variant="plain" prepend-icon="mdi-refresh"
          color="success" @click="loadMoreMessages">
          {{ $lang('button.loadMore') }}
        </v-btn>
      </template>
      <div ref="itemRefDown" ></div>
    </v-infinite-scroll>
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
  content: '';
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
</style>