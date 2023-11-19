<script setup lang="ts">
import { formatTimeShort, formatDate } from "@/helpers";


defineProps<{
 _id: string | number
}>()

const load = (__side: string, done: (status: string) => void) => {
  if (channelStore.messagesOffset < messagesLimit.value) {
    setTimeout(() => {
      done('empty')
    }, 1000)
    return;
  }
  setTimeout(async () => {
    if (props.currentChannel?._channelID) {
      const offset = Math.ceil(channelStore.messagesOffset - messagesLimit.value)
      await channelStore.getChannelMessages(props.currentChannel?._channelID, messagesLimit.value, offset, true)
      channelStore.messagesOffset = offset
    }

    done("ok")
  }, 1000)
}

</script>
<template>
  <v-card>
    <div class="card mb-4 d-flex flex-column" :id="`messages-container${_id}`" ref="cardDiv">
          <!-- <skeleton-component :loading="isMessagesLoading" :length="messages.length" type="list-item"></skeleton-component> -->
          <v-infinite-scroll :height="430" @load="load" side="start" mode="manual">
            <template v-for="(channelMessage, index) in channelMessages" :key="index">
              <p class="text-center text-divider">{{ formatDate(index, true) }}</p>
              <v-fade-transition group>
                <div v-for="message in channelMessage" :key="message._id" class="my-3 mx-2 text-subtitle-1">
                  <channel-action-menu :message="message" @on:edit:message="onEditMessage" :uuid="user?._uuid"
                    @on:reply:message="onReplyMessage" @on:delete:message="onDeleteMessage"></channel-action-menu>
                  {{ formatTimeShort(message.createdAt) }}
                  <v-tooltip v-if="message.relatedId" :text="message.relatedContent">
                    <template v-slot:activator="{ props }">
                      <v-icon icon="mdi-reply" v-bind="props" color="tonal"></v-icon>
                    </template>
                  </v-tooltip>
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
                </div>
              </v-fade-transition>
            </template>
            <template v-slot:empty>
              <v-sheet class=""> <v-icon icon="mdi-information-variant-circle-outline"></v-icon> No more items! </v-sheet>
            </template>
          </v-infinite-scroll>
        </div>
  </v-card>
</template>