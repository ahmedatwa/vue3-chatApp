<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { watchEffect, nextTick } from "vue";
import { formatTimeShort, formatDateLong } from "@/helpers";
import { MessageActionMenu, MessageThreadChipComponent } from "@/components/Chat";
import { MessageReactionComponent, MessageFilesComponent } from "@/components/Chat";
// types
import type { User, UserMessages } from "@/types/User";
import type { MessagePagination, UploadedFiles } from "@/types/Chat";

const currentUser = inject<User>("user");
const pagination = ref<MessagePagination>({
  total: 0,
  offset: 0,
  limit: 0,
});
const isLoadMore = ref(false);
const lastRow = ref<HTMLDivElement | null>(null);
const firstRow = ref<HTMLDivElement | null>(null);

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
  if (props.selectedUser?.messages?.length) {
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

const loadMoreDisabled = computed(() => {
  if (props.selectedUser?.messages)
    if (pagination.value.total === props.selectedUser?.messages?.length) {
      return false
    }
  return true
})

const actionMenu = ref(false);
const actionMenuID = ref<string | number | null>(null);
const showActionMenu = (visible: boolean, id: string | number | null) => {
  actionMenu.value = visible;
  actionMenuID.value = id;
};

</script>
<template>
  <v-container class="container" :key="selectedUser?._uuid">
    <v-sheet :align="'center'" justify="center" class="my-2" :key="selectedUser?._uuid">
      <v-btn :loading="isLoading.messages" v-if="loadMoreDisabled" variant="plain" prepend-icon="mdi-refresh"
        @click="loadMoreMessages" color="success">
        {{ $lang("chat.button.loadMore") }}
      </v-btn>
    </v-sheet>
    <span ref="firstRow"></span>
    <v-row no-gutters v-for="(userMessage, index) in userMessages" :key="index">
      <v-col class="text-center text-divider" cols="12" :id="`id-${index}`">
        {{ formatDateLong(index) }}
      </v-col>
      <v-col v-for="message in userMessage" :key="`col-${message._id}`" :id="`col-${message._id}`" cols="12"
        class="ma-1 pa-2 column__wrapper" @mouseover="showActionMenu(true, message._id)">
        <v-sheet :key="`message-wrapper-${message._id}`" class="transparent">
          <message-thread-chip-component v-if="message.thread" :key="`thread-chip-${message._id}`"
            :message="(message as UserMessages)"
            @update:thread-messages="$emit('update:threadMessages', $event as UserMessages)">
          </message-thread-chip-component>
          <v-sheet class="transparent d-inline" :id="`message-content-wrapper-${message._id}`">
            {{ formatTimeShort(message.createdAt) }}
            <div class="font-weight-bold text-teal d-inline" v-if="message.from === currentUser?._uuid">
              {{ currentUser?.displayName }}:
            </div>
            <div class="font-weight-bold text-blue d-inline" v-else>
              {{ selectedUser?.displayName }}:
            </div>
            <div :key="`message-edited-${message._id}`" v-if="message.editContent" class="d-inline transparent">
              <span class="text-caption me-1">
                {{ $lang("chat.text.edited") }}
                <p v-html="message.content" class="d-inline"></p>
              </span>
            </div>
            <div :id="`message-content-${message._id}`" class="text-left d-inline transparent" v-else>
              <div class="d-inline" v-html="message.content"></div>
              <message-files-component v-if="message.files" :files="message.files" :message-id="message._id"
                @update:delete-file="$emit('update:deleteFile', $event)"
                @update:downdload-file="$emit('update:downdloadFile', $event)">
              </message-files-component>
            </div>
            <!-- reactions -->
            <message-reaction-component v-if="message.reactions" :key="`reaction-${message._id}`"
              :message-id="message._id" :reactions="message.reactions"
              @update:message-reaction="$emit('update:messageReaction', $event)">
            </message-reaction-component>
          </v-sheet>
          <!-- message-action-menu -->
          <message-action-menu v-if="actionMenuID === message._id" :message-value="actionMenuID"
            :key="`action-menu${message._id}`" :selected-user="selectedUser" :message="message" :action-menu="actionMenu"
            @edit-message="$emit('editMessage', $event)" @delete-message="$emit('deleteMessage', $event)"
            @update:action-menu="actionMenu = $event" @update:message-value="actionMenuID = $event"
            @update:thread-messages="$emit('update:threadMessages', $event as UserMessages)"
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
