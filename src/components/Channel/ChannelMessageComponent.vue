<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue"
import { formatTimeShort, formatDate } from "@/helpers";
import type { Channels, SendMessageThreadPayload } from "@/types/Channel";
import { ChannelActionMenu } from "@/components/Channel";

//import SkeletonComponent from "@/components/SkeletonComponent.vue";
//import { useChannelStore } from "@/stores";

//const channelStore = useChannelStore()
//const messagesLimit = ref(10)
const contentWrapper = ref<HTMLDivElement>();

const props = defineProps<{
  uuid: string | undefined;
  channel: Channels | null;
  isDelete: boolean;
  messagesPaginate: {limit: number, offset: number, total: number, end: boolean};
}>()

const emit = defineEmits<{
  "delete:message": [value: number];
  "send:messageThread": [payload: SendMessageThreadPayload]
  "edit:message": [value: { _messageId: string | number, editContent: string, content: string, updatedAt: string; }];
  "on:load:moreMessages": [_channelID: string];
}>()

const channelMessages = computed(() => {
  if (props.channel?.messages) {
    return props.channel.messages.reduce((result: any, value) => {
      const date = value.createdAt.split(" ")[0];
      (result[date] || (result[date] = [])).push(value);
      return result;
    }, {});
  }
});


const loadMoreMessages = (options: { done: (status: 'error' | 'loading' | 'empty' | 'ok') => void }) => {
  if (props.messagesPaginate.end === true) {
    options.done("empty")
    return;
  }
  if (props.messagesPaginate.offset >= 0 && props.channel?._channelID) {
    emit("on:load:moreMessages", props.channel?._channelID)
    nextTick(() => {
      options.done("ok")
    })
  }

}

const onDeleteMessage = (event: number) => {
  emit("delete:message", event);
};

const onEditMessage = (event: {
  _messageId: string | number;
  editContent: string;
  content: string;
  updatedAt: string;
}) => {
  emit("edit:message", event);
};


const rowContentWrapper = ref()
onMounted(() => {
  //console.log(rowContentWrapper.value)
 // contentWrapper.value?.lastElementChild?.scrollIntoView()
  //rowContentWrapper.value. = `${rowContentWrapper.value?.scrollHeight}px`
  // const el  = document.getElementById("content-wrapper") as HTMLDivElement
  // console.log(el);
  
  //  el.scrollTop = el.scrollHeight
   //console.log(test);
  // if (contentWrapper.value) {
   
    
  //   nextTick(() => {
  //     contentWrapper.value?.lastElementChild?.scroll({
  //       top: contentWrapper.value?.lastElementChild?.scrollHeight,
  //       behavior: "smooth",
  //     });
  //   })

  // }

})

const sendMessageThread = (payload: SendMessageThreadPayload) => {
  emit("send:messageThread", payload);
};

</script>
<template>
  <v-container class="card" :id="`messages-container-${channel?._channelID}`">
    <!-- <skeleton-component :loading="isMessagesLoading" :length="messages.length" type="list-item"></skeleton-component> -->

    <v-infinite-scroll :height="430" @load="loadMoreMessages" side="start" mode="manual" empty-text="">
      <v-row no-gutters ref="rowContentWrapper">
        <template v-for="(channelMessage, index) in channelMessages" :key="channelMessage._id">
          <v-col class="text-center text-divider mb-2" cols="12" :id="`id-${index}`">{{ formatDate(index, true) }}</v-col>
          <div ref="contentWrapper">
            <v-slide-x-transition group mode="out" tag="v-col">

              <v-col v-for="message in channelMessage" :key="message._id" cols="12" class="mb-2">
                <channel-action-menu :message="message" @on:edit:message="onEditMessage" :uuid="uuid"
                  @on:delete:message="onDeleteMessage"
                  @send:message-thread="sendMessageThread"></channel-action-menu>
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
                  {{ $lang("textEdited") }}</span>
                <span v-if="message.deletedContent" class="text-caption ms-1">
                  {{ $lang("textDeleted") }}</span>
                <span v-else>{{ message.content }}</span>
              </v-col>
            </v-slide-x-transition>
          </div>
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
</style>