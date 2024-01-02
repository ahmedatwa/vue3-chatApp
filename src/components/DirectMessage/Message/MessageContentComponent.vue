<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { watchEffect, nextTick } from "vue";
import { formatDateLong } from "@/helpers";
import { MessageActionMenuComponent, MessageThreadChipComponent } from "@/components/Chat";
import { MessageContentBodyComponent } from "@/components/Chat";
// types
import type { User, UserMessages, UserSessionData } from "@/types/User";
import type { MessagePagination, UploadedFiles } from "@/types/Chat";

const currentUser = inject<UserSessionData>("user");
const pagination = ref<MessagePagination>({
  total: 0,
  offset: 0,
  limit: 0,
});
const isLoadMore = ref(false);
const lastRow = ref<HTMLDivElement>();
const firstRow = ref<HTMLDivElement | null>(null);
const actionMenu = ref(false);
const actionMenuID = ref<string | number | null>(null);

// props
const props = defineProps<{
  selectedUser: User | null;
  isScroll: { start: boolean; end: boolean } | null
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
  "update:threadMessages": [value: UserMessages];
  "update:messageReaction": [value: { _id: string | number; emoji: string }];
  "update:deleteFile": [value: { fileID: string | number, messageID: string | number }];
  "update:downdloadFile": [value: UploadedFiles];
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
    pagination.value.offset = Math.ceil(pagination.value.offset - pagination.value.limit)

    emit("loadMoreMessages", {
      _channelID: props.selectedUser?._channelID,
      limit: pagination.value.limit,
      offset: paginationOffset.value,
      unshift: true,
    });
  }
};

watchEffect(() => {
  if (props.selectedUser?.pagination) {
    pagination.value = props.selectedUser?.pagination;
  }
});

const paginationOffset = computed(() => {
  if (
    pagination.value.offset < pagination.value.limit &&
    pagination.value.offset > 0
  ) {
    pagination.value.limit = pagination.value.offset + pagination.value.limit;
    pagination.value.offset = 0;
    return 0;
  }
  return pagination.value.offset;
});

watchEffect(() => {
  if (pagination.value.total > pagination.value.limit) {
    isLoadMore.value = true;
  }
});

watchEffect(() => {
  if (props.isScroll)
    scroll(props.isScroll);
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

const loadMoreDisabled = computed(() => {
  if (props.selectedUser?.messages)
    return pagination.value.total > props.selectedUser?.messages?.length ? true : false
})

const showActionMenu = (visible: boolean, id: string | number | null) => {
  actionMenu.value = visible;
  actionMenuID.value = id;
};

</script>
<template>
  <v-container class="container" :key="selectedUser?._uuid" ref="rootEl">
    <v-sheet :align="'center'" justify="center" class="my-2" :key="selectedUser?._uuid">
      <v-btn :loading="isLoading.messages" v-if="loadMoreDisabled" variant="plain" prepend-icon="mdi-refresh"
        @click="loadMoreMessages" color="success">
        {{ $lang("chat.button.loadMore") }}
      </v-btn>
    </v-sheet>
    <row ref="firstRow" class="v-row v-row--no-gutters first-row"></row>
    <v-row no-gutters v-for="(userMessage, index) in userMessages" :key="index">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-col v-for="message in userMessage" :key="`col-${message._id}`" :id="`col-${message._id}`" cols="12"
        class="ma-1 pa-2 column__wrapper" @mouseover="showActionMenu(true, message._id)">
        <v-sheet :key="`message-wrapper-${message._id}`" class="transparent">
          <!-- Thread Chip -->
          <message-thread-chip-component v-if="message.thread" :key="`thread-chip-${message._id}`"
            :message="(message as UserMessages)"
            @update:thread-messages="$emit('update:threadMessages', $event as UserMessages)">
          </message-thread-chip-component>
          <!-- Body -->
          <message-content-body-component :key="message._id" :message="message" :current-user="currentUser"
            :selected-user="selectedUser" @update:delete-file="$emit('update:deleteFile', $event)"
            @update:downdload-file="$emit('update:downdloadFile', $event)"
            @update:message-reaction="$emit('update:messageReaction', $event)">
          </message-content-body-component>
          <!-- message-action-menu -->
          <message-action-menu-component v-if="actionMenuID === message._id" :message-value="actionMenuID"
            :key="`action-menu${message._id}`" :selected-user="selectedUser" :message="message" :action-menu="actionMenu"
            @edit-message="$emit('editMessage', $event)" @delete-message="$emit('deleteMessage', $event)"
            @update:action-menu="actionMenu = $event" @update:message-value="actionMenuID = $event"
            @update:thread-messages="$emit('update:threadMessages', $event as UserMessages)"
            @update:messageReaction="$emit('update:messageReaction', $event)">
          </message-action-menu-component>
        </v-sheet>
      </v-col>
    </v-row>
    <row ref="lastRow" class="v-row v-row--no-gutters last-row"></row>
  </v-container>
</template>
<style scoped>
.container {
  overflow-y: scroll;
  overflow-x: hidden;
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
