<script setup lang="ts">
import SkeletonComponent from "@/components/SkeletonComponent.vue";
import { CreateChannelComponent } from "@/components/Channel";
import type { User } from "@/types/User.ts";
import type { Channels, ChannelForm } from "@/types/Channel.ts";
import { ref, watch, inject } from "vue";


const drawer = inject<boolean>("drawer")
const activeElement = ref<number | string | null>(null);
const isNewChannel = ref(false);
const panel = ref(["users", "channels"])

// Props
const props = defineProps<{
  // drawer: boolean;
  users: User[] | undefined;
  channels: Channels[] | undefined;
  channelsLoading: boolean;
  isUserLoading: boolean;
  _uuid: string;
  lastActiveElement?: number | string | null;
}>();

const emit = defineEmits<{
  "update:selected": [id: number | string, key: string, value: User | Channels];
  "user:created:channel": [value: ChannelForm];
  "update:drawer": [value: boolean];
  "update:channel:users": [value: string[]];
}>();

const onSelect = (_id: number | string, key: string, value: User | Channels) => {
  emit("update:selected", _id, key, value);
  activeElement.value = _id;
};

// watch(
//   () => props.drawer,
//   (newVal) => {
//     drawer.value = newVal;
//   }
// );

watch(
  () => props.lastActiveElement,
  (value) => {
    if (value) {
      activeElement.value = value
    }
  })

const newUserchannel = ($event: ChannelForm) => {
  isNewChannel.value = true
  emit('user:created:channel', $event)
}

</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list lines="two">
      <v-expansion-panels v-model="panel" variant="popout">
        <!-- Users -->
        <v-expansion-panel value="users" elevation="3" color="orange" selected-class="pink-lighten-3">
          <v-expansion-panel-title class="text-center text-disabled text-body-2">
            {{ $lang('directMessages') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text class="mt-2">
            <!-- skeleton-loader -->
            <skeleton-component type="list-item-avatar" :length="users?.length" :loading="isUserLoading"
              v-if="isUserLoading"></skeleton-component>
            <!-- skeleton-loader -->
            <v-list-item v-for="user in users" :key="user._uuid" v-if="!isUserLoading" color="teal-darken-1"
              :active="activeElement === user._uuid" :elevation="1" @click="onSelect(user._uuid, 'user', user)"
              class="my-2">
              <template v-slot:append v-if="user.newMessages">
                <v-badge :color="user.connected ? 'success' : 'dark'" :content="user.newMessages?.total" inline></v-badge>
              </template>
              <v-list-item-title>
                <v-icon icon="mdi-account-circle" :color="user.connected ? 'success' : 'dark'">
                </v-icon>
                {{ user.displayName }} {{ user.self ? " (Me)" : "" }}
                <v-list-item-subtitle v-if="user.newMessages" class="ms-1 mt-1">
                  {{ user.newMessages?.lastMessage }}
                </v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <!-- Rooms -->
        <v-expansion-panel value="channels" elevation="3">
          <v-expansion-panel-title class="text-center text-disabled text-body-2">
            {{ $lang('channel.channels') }}
            <v-btn prepend-icon="mdi-chat-plus" variant="plain" color="teal">
              <create-channel-component @on:create:channel="newUserchannel" :title="$lang('channel.createChannel')" create
                :key="_uuid">
              </create-channel-component>
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="mt-2">
            <!-- skeleton-loader -->
            <skeleton-component type="list-item-avatar" :length="channels?.length" :loading="channelsLoading"
              v-if="channelsLoading">
            </skeleton-component>
            <!-- skeleton-loader -->
            <v-list-item v-for="channel in channels" :key="channel._id" v-if="!channelsLoading" :elevation="1"
              color="teal-darken-1" @click="onSelect(channel._channelID, 'channel', channel)"
              :active="activeElement === channel._channelID" :value="channel._channelID">
              <template v-slot:append v-if="channel.newMessages">
                <v-badge color="success" :content="channel.newMessages?.total" inline></v-badge>
              </template>
              <v-list-item-title>
                {{ channel.channelName }}
                <v-list-item-subtitle v-if="channel.newMessages" class="ms-1 mt-1">
                  {{ channel.newMessages?.from }}: {{ channel.newMessages?.lastMessage }}
                </v-list-item-subtitle>
              </v-list-item-title>
            </v-list-item>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-list>
  </v-navigation-drawer>
</template>
<style scoped>
.v-expansion-panel-text :deep(.v-expansion-panel-text__wrapper) {
  padding: initial !important;
}
</style>

