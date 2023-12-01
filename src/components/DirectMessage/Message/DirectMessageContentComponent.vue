<script setup lang="ts">
import { shallowRef, computed, nextTick } from "vue"
import { formatTimeShort, formatDateLong } from "@/helpers";
import type { User } from "@/types/User"
import { ChannelActionMenu } from "@/components/Channel";
import SkeletonComponent from "@/components/SkeletonComponent.vue";

//const itemRefs = shallowRef<HTMLDivElement[]>([])

// props
const props = defineProps<{
  messages: User | null;
  pagination: { limit: number, offset: number, total: number, end: boolean };
}>()

// emits
const emit = defineEmits<{
}>()

// group messages by date
// const channelMessages = computed(() => {
//   if (props.channel?.messages) {
//     return props.channel.messages.reduce((result: any, value) => {
//       const date = value.createdAt.split(" ")[0];
//       (result[date] || (result[date] = [])).push(value);
//       return result;
//     }, {});
//   }
// });


// const loadMoreMessages = (options: { done: (status: 'error' | 'loading' | 'empty' | 'ok') => void }) => {
//   if (props.messagesPaginate.end === true) {
//     options.done("empty")
//     return;
//   }
//   if (props.messagesPaginate.offset >= 0 && props.channel?._channelID) {
//     emit("loadMoreMessages", props.channel?._channelID)
//     nextTick(() => {
//       options.done("ok")

//     })
//   }
// }

// const getItemRefs = (el: any) => {
//   if (el) {
//     itemRefs.value.push(el.$el)
//   }
// }

// const autoScroll = () => {
//   if (itemRefs.value) {
//     const element = itemRefs.value.slice(-1)[0]
//     nextTick(() => {
//       if (props.isNewMessageScroll) {
//         element?.scrollIntoView({
//           block: "nearest",
//           behavior: "smooth",
//           inline: "start"
//         })
//       }
//       // clear scoll value 
//       // loading more function more overlap 
//       emit("update:scroll", false)
//     })
//   }
// }
</script>
<template>
  <v-container class="card" id="mess">
    <v-infinite-scroll :height="430" @load="loadMoreMessages" side="start" mode="manual" empty-text="">
      <v-row no-gutters>
        <!-- <skeleton-component  :length="channel?.messages?.length"
            type="list-item"></skeleton-component> -->
        <template v-for="(channelMessage, index) in messages" :key="channelMessage._id">
          <v-col class="text-center text-divider mb-2" cols="12" :id="`id-${index}`">{{ formatDateLong(index) }}</v-col>
          <v-slide-x-transition group mode="out" tag="v-col">
            <v-col v-for="message in channelMessage" :key="message._id" cols="12" class="mb-2" >
              <!-- <channel-action-menu :message="message" :is-thread-loading="isThreadLoading"
                @on:edit-message="$emit('editMessage', $event)" @on:message-thread="$emit('sendMessageThread', $event)"
                @on:delete-message="$emit('deleteMessage', $event)">
              </channel-action-menu> -->
              {{ formatTimeShort(message.createdAt) }}
              <v-tooltip v-if="message.relatedId" :text="message.relatedContent">
                <template v-slot:activator="{ props }">
                  <v-icon icon="mdi-reply" v-bind="props" color="tonal"></v-icon>
                </template>
              </v-tooltip>
              <span class="font-weight-bold text-teal" v-if="message.from === uuid">
                {{ message.fromName }}: </span>
              <span class="font-weight-bold text-blue" v-else>
                {{ message.fromName }}: </span>
              <span v-if="message.editContent" class="text-caption me-1">
                {{ $lang("text.edited") }}</span>
              <span v-if="message.deletedContent" class="text-caption ms-1">
                {{ $lang("text.eeleted") }}</span>
              <span v-else>{{ message.content }}</span>
            </v-col>
          </v-slide-x-transition>
        </template>

      </v-row>
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

.end {
  opacity: hidden;
}
</style>