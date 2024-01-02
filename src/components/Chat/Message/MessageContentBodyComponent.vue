<script setup lang="ts">
import { MessageReactionComponent } from "@/components/Chat";
import { MessageFilesComponent } from "@/components/Chat";
// Types
import type { ChannelMessages } from "@/types/Channel";
import type { UserMessages, User, UserSessionData } from "@/types/User";
import type { UploadedFiles } from "@/types/Chat";
import { formatTimeShort } from "@/helpers";

defineProps<{
  message: ChannelMessages & UserMessages
  currentUser: UserSessionData | undefined
  selectedUser?: User | null;
}>();

defineEmits<{
  "update:messageReaction": [value: { _id: string | number; emoji: string }];
  "update:deleteFile": [value: { fileID: string | number, messageID: string | number }];
  "update:downdloadFile": [value: UploadedFiles];
}>();


</script>
<template>
  <v-sheet class="transparent d-inline" :id="`message-body-${message._id}`" :key="`message-body-${message._id}`">
    {{ formatTimeShort(message.createdAt) }}
    <!-- display Name -->
    <v-sheet class="d-inline transparent" v-if="message.fromName">
      <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
        {{ message.fromName }}:
      </span>
      <span class="font-weight-bold text-blue" v-else>
        {{ message.fromName }}:
      </span>
    </v-sheet>
    <v-sheet class="d-inline transparent" v-else>
      <p class="font-weight-bold text-teal d-inline" v-if="message.from === currentUser?._uuid">
        {{ currentUser?.displayName }}:</p>
      <p class="font-weight-bold text-blue d-inline" v-else>
        {{ selectedUser?.displayName }}: </p>
    </v-sheet>
    <!-- Edited Content -->
    <div :key="`message-edited-${message._id}`" v-if="message.editContent" class="d-inline transparent">
      <span class="text-caption me-1">{{ $lang("chat.text.edited") }}</span>
      <p v-html="message.editContent" class="d-inline"></p>
    </div>
    <!-- Main Message Body -->
    <div class="text-left d-inline transparent" v-else>
      <p class="d-inline ms-1" v-html="message.content"></p>
      <message-files-component v-if="message.files" :files="message.files" :message-id="message._id"
        @update:delete-file="$emit('update:deleteFile', $event)"
        @update:downdload-file="$emit('update:downdloadFile', $event)">
      </message-files-component>
    </div>
    <!-- reactions -->
    <message-reaction-component v-if="message.reactions" :key="`reaction-${message._id}`" :message-id="message._id"
      :reactions="message.reactions" @update:message-reaction="$emit('update:messageReaction', $event)">
    </message-reaction-component>
  </v-sheet>
</template>
<style scoped>
.transparent {
  background-color: transparent;
}
</style>
<!-- <v-sheet class="transparent d-inline" :id="`message-content-wrapper-${message._id}`">
            {{ formatTimeShort(message.createdAt) }}
            <span class="font-weight-bold text-teal" v-if="message.from === currentUser?._uuid">
              {{ message.fromName }}:
            </span>
            <span class="font-weight-bold text-blue" v-else>
              {{ message.fromName }}:
            </span>
            <span v-if="message.editContent" class="text-caption me-1">
              {{ $lang("chat.text.edited") }}  <p v-html="message.content" class="d-inline"></p> </span>
            <span class="text-left" v-else> <p v-html="message.content" class="d-inline"></p>
              <message-files-component v-if="message.files" :files="message.files" :message-id="message._id"
                @update:delete-file="$emit('update:deleteFile', $event)"
                @update:downdload-file="$emit('update:downdloadFile', $event)">
              </message-files-component>
            </span>
            
            <message-reaction-component v-if="message.reactions" :key="`reaction-${message._id}`"
              :message-id="message._id" :reactions="message.reactions"
              @update:message-reaction="$emit('update:messageReaction', $event)">
            </message-reaction-component>
          </v-sheet> -->