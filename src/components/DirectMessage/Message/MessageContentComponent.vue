<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { watchEffect, nextTick, watch } from "vue";
import { formatTimeShort, formatDateLong } from "@/helpers";
import { MessageActionMenu } from "@/components/DirectMessage";
// types
import type { User, Pagination, UserMessages } from "@/types/User";

const currentUser = inject<User>("user");
const pagination = ref<Pagination>({
  total: 0,
  offset: 0,
  limit: 0,
});
const lastRow = ref<HTMLDivElement | null>(null);
const firstRow = ref<HTMLDivElement | null>(null);

// props
const props = defineProps<{
  selectedUser: User | null;
  isScroll?: boolean;
  isLoading: {
    messages: boolean;
    thread: boolean;
    users: boolean;
  };
}>();

// emits
const emit = defineEmits<{
  loadMoreMessages: [
    value: {
      _channelID: string;
      limit: number;
      offset: number;
      unshift: boolean;
    }
  ];
  deleteMessage: [value: number | string];
  editMessage: [
    value: {
      _messageID: string | number;
      editContent: string;
      content: string;
      updatedAt: string;
    }
  ];
  "start:thread": [value: UserMessages];
  "update:scroll": [value: boolean];
}>();

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
  if (pagination.value.offset < 0) {
    return;
  }
  if (props.selectedUser?._channelID) {
    emit("loadMoreMessages", {
      _channelID: props.selectedUser?._channelID,
      limit: pagination.value.limit,
      offset: paginationOffset.value,
      unshift: true,
    });
    scroll(true)
  }
};

watchEffect(() => {
  if (props.selectedUser?.pagination) {
    pagination.value = props.selectedUser?.pagination;
  }
});

const paginationOffset = computed(() => {
  pagination.value.offset = Math.ceil(pagination.value.offset - pagination.value.limit); //2 10

  if (pagination.value.offset) {
    if (pagination.value.offset < pagination.value.limit && pagination.value.offset > 0) {
      pagination.value.limit = pagination.value.offset + pagination.value.limit;
      pagination.value.offset = 0;
      return 0;
    }
  }
  return pagination.value.offset;
});

const isLoadMoreDisabled = computed(() => {
  return paginationOffset.value < 0 ? true : false
});

watch(
  () => props.isScroll,
  (value) => {
    if (value) {
      scroll(false);
      emit("update:scroll", false);
    }
  }
);

const scroll = (top: boolean) => {
  watchEffect(() => {
    if (props.selectedUser?.messages?.length) {
      nextTick(() => {
        if (top) {
          firstRow.value?.scrollIntoView(true);
        } else {
          lastRow.value?.scrollIntoView(true);
        }
      });
    }
  });
}
</script>
<template>
  <v-container class="container">
    <v-sheet :align="'center'" justify="center" class="my-2">
      <v-btn :loading="isLoading.messages" :disabled="isLoadMoreDisabled" variant="plain" prepend-icon="mdi-refresh"
        color="success" @click="loadMoreMessages">
        {{ $lang("chat.button.loadMore") }}
      </v-btn>
    </v-sheet>
    <span ref="firstRow"></span>
    <v-row no-gutters v-for="(userMessage, index) in userMessages" :key="index">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-slide-x-transition group mode="in-out" tag="v-col">
        <v-col v-for="message in userMessage" :key="message._id" cols="12" class="mb-2">
          <message-action-menu :key="message._id" :selected-user="selectedUser" :message="message"
            @edit-message="$emit('editMessage', $event)" @delete-message="$emit('deleteMessage', $event)"
            @start:thread="$emit('start:thread', $event)">
          </message-action-menu>
          {{ formatTimeShort(message.createdAt) }}
          <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
            {{ currentUser?.displayName }}:
          </span>
          <span class="font-weight-bold text-blue" v-else>
            {{ selectedUser?.displayName }}:
          </span>
          <div v-if="message.editContent" class="d-inline">
            <span class="text-caption me-1">
              {{ $lang("chat.text.edited") }}</span>
            {{ message.content }}
          </div>
          <span class="text-left" v-else>{{ message.content }}</span>
        </v-col>
      </v-slide-x-transition>
    </v-row>
    <span ref="lastRow"></span>
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
