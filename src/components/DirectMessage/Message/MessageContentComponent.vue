<script setup lang="ts">
import { ref, computed, inject } from "vue"
import { formatTimeShort, formatDateLong } from "@/helpers";
import { ChatActionMenu } from "@/components/Chat";
// types
import type { User, Pagination } from "@/types/User"

const currentUser = inject<User>("user");
const pagination = ref<Pagination>({
  total: 0,
  offset: 0,
  limit: 0,
});

// props
const props = defineProps<{
  selectedUser: User | null;
  isScroll?: boolean;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
}>()

// emits
const emit = defineEmits<{
}>()

// group messages by date
const userMessages = computed(() => {
  if (props.selectedUser?.messages) {
    return props.selectedUser.messages.reduce((result: any, value) => {
      const date = value.createdAt.split(" ")[0];
      (result[date] || (result[date] = [])).push(value);
      return result;
    }, {});
  }
});


// Load More
const loadMoreMessages = () => {
  // if (pagination.value.offset < 0) {
  //   return;
  // }
  // if (props.channel?._channelID) {
  //   emit(
  //     "on:loadMoreMessages",
  //     props.channel?._channelID,
  //     pagination.value.limit,
  //     pagination.value.offset,
  //     true
  //   );
  // }
};

const isLoadMoreDisabled = computed(() => {
  return pagination.value.offset < 0;
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
    <v-row no-gutters v-for="(userMessage, index) in userMessages" :key="index">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-slide-x-transition group mode="in-out" tag="v-col">
        <v-col v-for="message in userMessage" :key="message._id" id="tes" cols="12" class="mb-2">
          <chat-action-menu :message="message" @on:edit-message="$emit('on:editMessage', $event)"
            @on:delete-message="$emit('on:deleteMessage', $event)" @start:thread="$emit('start:thread', $event)">
          </chat-action-menu>
          {{ formatTimeShort(message.createdAt) }}
          <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
            {{ message.fromName }}:
          </span>
          <span class="font-weight-bold text-blue" v-else-if="message.to">
            {{ message.toName }}:
          </span>
          <span v-if="message.editContent" class="text-caption me-1">
            {{ $lang("text.edited") }}</span>
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