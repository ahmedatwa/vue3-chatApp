<script setup lang="ts">
import { MessageFormComponent, CreateRoomComponent, ChannelActionMenu } from "@/components";
import { onMounted, computed } from "vue";
import { Channels, TypingEvent, ChannelMessages, DBUser } from "@/types";
import { capitalize, reduce, replace } from "lodash";
import { useDateFormat } from "@vueuse/core";

// Props
interface Props {
  allUsers: DBUser[];
  currentChannel: Channels | null;
  typing?: TypingEvent | null;
  uuid: string | undefined;
  username: string | undefined;
  isLoading: boolean;
}
const props = defineProps<Props>();

// emits
const emit = defineEmits<{
  "submit:form": [payload: { text: string; file?: File }];
  "update:typing": [value: string];
  "update:seen": [value: boolean];
  "update:newMessagesCount": [value: number];
  "reply:message": [id: string | number, relatedContent: string, value: string];
  "alter:message": [key: string, value: ChannelMessages];
  "update:channel:users": [value: string[]];
}>();

const handleScroll = (): void => {
  const el = document.querySelector(".v-virtual-scroll");
  el?.scroll({ top: el?.scrollHeight, behavior: "instant" });
};

const roomMessages = computed(() => {
  if (props.currentChannel?.messages) {
    return reduce(
      props.currentChannel.messages,
      (result: any, value) => {
        const date = value.createdAt.split(" ")[0];
        (result[date] || (result[date] = [])).push(value);
        return result;
      },
      {}
    );
  }
});

onMounted(() => {
  handleScroll();
});

const onMutate = () => {
  handleScroll();
};

const onAlterMessage = (key: string, event: ChannelMessages) => {
  emit("alter:message", key, event)
}

const onReplyMessage = (id: string | number, relatedContent: string, content: string) => {
  emit("reply:message", id, relatedContent, content)
}
const dateFormat = (date: string | number, format: string): string => {
  const formatted = useDateFormat(date, format);
  return replace(formatted.value, '"', "");
};
</script>
<template>
  <v-container class="flex-1-1-100 ma-2 pa-2">
    <v-card class="mx-auto" id="container" :loading="isLoading">
      <v-card-title>
        {{ capitalize(currentChannel?.name) }}
        <create-room-component v-if="currentChannel?.createdBy === uuid" title="Invite Users" :allUsers="allUsers"
          icon="mdi-account-plus" color="#00B8D4" :channel-name="currentChannel?.name" :current-user="uuid"
          :participants="currentChannel?.participants" @invite:channel:users="$emit('update:channel:users', $event)">
          <template v-slot:invite-user>
            <v-btn type="submit" block color="indigo-darken-3">Send</v-btn>
          </template>
        </create-room-component>
      </v-card-title>
      <v-divider :thickness="3" color="success"></v-divider>

      <v-virtual-scroll :height="420" :items="[roomMessages]" v-mutate="onMutate">
        <template v-slot:default="{ item }">
          <v-list v-for="(messages, key) in item" :key="key">
            <v-list-subheader :key="key" class="d-flex justify-center">
              {{ dateFormat(key, "dddd, MMMM DD, YYYY") }}
            </v-list-subheader>

            <v-list-item v-for="(message, index) in messages" :key="index">
              <v-list-item-title :key="message._id" :id="`id-${message._id}`">
                <v-sheet>
                  <!-- Action Menu -->
                  <channel-action-menu :message="message" :uuid="uuid" @on:alter:message="onAlterMessage"
                    @on:reply:message="onReplyMessage"></channel-action-menu>
                  {{ dateFormat(message.createdAt, "HH:MM A") }}
                  <!-- Reply Message -->
                  <v-tooltip :text="message.relatedContent" v-if="message.relatedId" location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon color="blue-grey-lighten-2" icon="mdi-reply-outline" size="small" v-bind:="props"></v-icon>
                    </template>
                  </v-tooltip>
                  <span class="font-weight-bold text-teal" v-if="message.from === uuid">
                    {{ capitalize(username) }}:
                  </span>
                  <span class="font-weight-bold text-teal" v-else>
                    {{ capitalize(message.username) }}:
                  </span>
                  <span>{{ message.content }}</span>
                  <v-img v-if="message.file" :width="150" :src="message.file" aspect-ratio="16/9" cover>
                    {{ message.name }}</v-img>
                </v-sheet>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </template>
      </v-virtual-scroll>
      <v-sheet>
        <v-card-actions class="w-100 d-inline-block">
          <MessageFormComponent :key="currentChannel?._roomId" @submit="$emit('submit:form', $event)"
            @typing="$emit('update:typing', $event)">
          </MessageFormComponent>
          <v-sheet transition="scroll-y-transition" v-if="typing">
            <p class="font-weight-light ma-2">
              {{ capitalize(typing.username) }} is Typing...
            </p>
          </v-sheet>
        </v-card-actions>
      </v-sheet>
    </v-card>
  </v-container>
</template>

<style scoped>
.p-2 {
  padding: 4px !important;
}
</style>
