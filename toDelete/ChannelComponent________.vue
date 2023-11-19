<script setup lang="ts">
import MessageFormComponent from "@/components/Chat/MessageFormComponent.vue";
import ChannelActionMenu from "@/components/Channel/ChannelActionMenu.vue";
import CreateChannelComponent from "@/components/Channel/CreateChannelComponent.vue";
import SkeletonComponent from "@/components/SkeletonComponent.vue";

import { onMounted, computed, ref, inject } from "vue";
import { Channels, NewChannel } from "@/types/Channel.ts";
import { formatDate, formatTimeShort, isEmpty } from "@/helpers";
// types
import { DBUser } from "@/types/User.ts";
import { TypingEvent } from "@/types";
import { UserSessionData } from "@/types/Session.ts";

const cardDiv = ref<HTMLDivElement>();
const user = inject<UserSessionData>("user");
//const userSettings = inject<Settings>('settings')
// Props
const props = defineProps<{
  allUsers: DBUser[];
  currentChannel: Channels | null;
  typing: TypingEvent | null;
  isLoading: boolean;
  isMessagesLoading: boolean;
  isMessageDelete: boolean;
}>();

// emits
const emit = defineEmits<{
  "send:message": [payload: { content: string; files?: File[] | null }];
  "update:typing": [value: string];
  "update:seen": [value: boolean];
  "update:newMessagesCount": [value: number];
  "reply:message": [value:  {relatedId: string | number, relatedContent: string, content: string}];
  "edit:message": [value: {_messageId: string | number, editContent: string, content: string, updatedAt: string;}];
  "delete:message": [value: {_messageId: string | number, deletedContent: string, deletedAt: string, softDelete: boolean}];
  "update:channel:users": [value: string[]];
  "archive:channel": [value: string];
  "update:channel": [value: NewChannel];
  "leave:channel": [value: string];
  "download:file": [value: { name: string; path: string }];
}>();

const handleScroll = () => {
  cardDiv.value?.scroll({
    top: cardDiv.value?.scrollHeight,
    behavior: "smooth",
  });
};

const roomMessages = computed(() => {
  if (props.currentChannel?.messages) {
    return props.currentChannel.messages.reduce((result: any, value) => {
      const date = value.createdAt.split(" ")[0];
      (result[date] || (result[date] = [])).push(value);
      return result;
    }, {});
  }
});

onMounted(() => {
  //handleScroll();
});

const onMutate = () => {
 // handleScroll();
};

const onEditMessage = (event: {
  _messageId: string | number;
  editContent: string;
  content: string;
  updatedAt: string;
}) => {
  emit("edit:message", event);
};

const onDeleteMessage = (event: {
  _messageId: string | number;
  deletedContent: string;
  deletedAt: string;
  softDelete: boolean;
}) => {
  emit("delete:message", event);
};

const onReplyMessage = (payload: {relatedId: string | number, relatedContent: string, content: string}) => {
  emit("reply:message", payload);
};

const archiveChannel = ($event: string) => {
  emit("archive:channel", $event);
};

const leaveChannel = (_channelId: string) => {
  emit("leave:channel", _channelId);
};
const updateChannel = ($event: NewChannel) => {
  emit("update:channel", $event);
};

const downloadFile = (name: string, path: string) => {
  emit("download:file", { name, path });
};

const sendMessage = (payload: { content: string; files?: File[] | null }) => {
  emit("send:message", payload);
  handleScroll();
};
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-card class="mx-auto" id="channel-container" :loading="isLoading">
      <v-card-title>
        <v-btn append-icon="mdi-menu-down" variant="plain">
          {{ currentChannel?.name }}
          <create-channel-component v-if="currentChannel?.createdBy === user?._uuid" :uuid="user?._uuid"
            :channel="currentChannel" :all-users="allUsers" @on:archive:channel="archiveChannel"
            @on:create:channel="updateChannel" @on:leave:channel="leaveChannel">
          </create-channel-component>
        </v-btn>
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>
      <v-container class="card mb-4 d-flex flex-column" ref="cardDiv" id="card-text-container" v-mutate="onMutate">
        <!-- <v-list v-for="(messages, key) in roomMessages" :key="key" >
          <v-list-subheader :key="key" class="d-flex justify-center">
            <span v-if="(key as keyof typeof currentChannel) === formatDate()">
              {{ $lang("textToday") }}</span>
            <span v-else>{{ formatDate(key, true) }}</span>
          </v-list-subheader> -->
          <!-- <skeleton-component :loading="isMessagesLoading" :length="messages.length" type="list-item"></skeleton-component> -->
          <!-- <v-row class="flex-wrap"
      no-gutters>
      <v-col
        cols="6"
       
      > -->
          <!-- <v-list-item > -->
            <!-- <v-expand-transition >
                <v-sheet
                
          height="40"
          width="200"
          class="mx-auto bg-secondary"
        ></v-sheet>
      </v-expand-transition> -->
            <!-- <v-list-item-title :key="message._id" :id="`id-${message._id}`"> -->
              
              <v-sheet class="ma-1 pa-1" v-for="(message, index) in currentChannel?.messages" :key="index" >
                
                <!-- Action Menu -->
                <channel-action-menu :message="message" @on:edit:message="onEditMessage" :uuid="user?._uuid"
                  @on:reply:message="onReplyMessage" @on:delete:message="onDeleteMessage"></channel-action-menu>
                {{ formatTimeShort(message.createdAt) }}
                <!-- Replies -->
                <v-tooltip v-if="message.relatedId" :text="message.relatedContent">
                  <template v-slot:activator="{ props }">
                    <v-icon icon="mdi-reply" v-bind="props" color="tonal"></v-icon>
                  </template>
                </v-tooltip>
                <!-- Replies -->
                <span class="font-weight-bold text-teal" v-if="message.from === user?._uuid">
                  {{ message.fromName }}:
                </span>
                <span class="font-weight-bold text-blue" v-else>
                  {{ message.fromName }}:
                </span>
                <span v-if="message.editContent" class="text-caption me-1">{{ $lang("textEdited") }}
                </span>
                <span v-if="message.deletedContent" class="text-caption ms-1">{{
                  $lang("textDeleted")
                }}</span>
                <span v-else>{{ message.content }}</span>
                
                <!-- uploaded files -->
                <!-- <v-container v-if="!isEmpty(message.files)">
                  <v-row>
                    <v-col v-for="(file, i) in message.files" :key="i" cols="2">
                      <v-chip v-if="file.type === 'pdf'" elevation="4" color="pink-lighten-1" variant="outlined"
                        class="ma-2" prepend-icon="mdi-file-pdf-box">
                        <template #append>
                          <v-icon icon="mdi-download-circle" color="blue-grey-darken-3" class="ms-2"
                            @click.prevet="downloadFile(file.name, file.path)" size="large"></v-icon>
                        </template>
                        {{ file.name }}
                      </v-chip>
                      <v-hover v-slot="{ isHovering, props }" v-else>
                        <v-img :width="150" :src="file.path" aspect-ratio="16/9" :elevation="4" :alt="file.name" cover
                          v-bind="props">{{ message.name }}
                          <v-overlay :model-value="isHovering" contained scrim="#036358"
                            class="align-center justify-center">
                            <v-btn variant="flat" @click.prevent="
                              downloadFile(file.name, file.path)
                              ">Download</v-btn>
                          </v-overlay>
                        </v-img>
                      </v-hover>
                    </v-col>
                  </v-row>
                </v-container> -->
                <!-- uploaded files -->
              </v-sheet>
            <!-- </v-list-item-title> -->
          <!-- </v-list-item> -->
        <!-- </v-col>
  </v-row> -->
        <!-- </v-list> -->
</v-container>
  

      <v-card-actions class="w-100 d-inline-block">
        <message-form-component :key="currentChannel?._channelId" @submit="sendMessage"
          @typing="$emit('update:typing', $event)">
        </message-form-component>
        <v-sheet transition="scroll-y-transition" v-if="typing">
          <p class="font-weight-light ma-2">{{ typing.name }} is Typing...</p>
        </v-sheet>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
<style scoped>
.card {
  overflow-y: scroll;
  z-index: initial;
  max-height: 400px;
  min-height: 400px;
}
</style>
