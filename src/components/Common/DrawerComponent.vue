<script setup lang="ts">
import { CreateChannelComponent } from "@/components/Channel";
import type { User } from "@/types/User";
import type { Channels, ChannelForm } from "@/types/Channel";
import { ref, watch, inject } from "vue";

const drawer = inject<boolean>("drawer")
const activeElement = ref<number | string | null>(null);
const panel = ref(["users", "channels"])

// Props
const props = defineProps<{
  users: User[];
  channels: Channels[];
  isLoadingChannels: boolean;
  isLoadingUsers: boolean;
  _uuid: string;
  lastActiveElement?: number | string | null;
}>();

const emit = defineEmits<{
  "update:selected": [id: number | string, key: string, value: User | Channels];
  "createChannel": [value: ChannelForm];
  "update:channel:users": [value: string[]];
}>();

const onSelect = (_id: number | string, key: string, value: User | Channels) => {
  emit("update:selected", _id, key, value);
  activeElement.value = _id;
};

watch(
  () => props.lastActiveElement,
  (el) => {
    if (el) {
      activeElement.value = el
    }
  })
  

</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list lines="two">
      <v-expansion-panels v-model="panel" variant="popout">
        <!-- Users -->
        <v-expansion-panel value="users" elevation="3" color="orange" selected-class="pink-lighten-3">
          <v-expansion-panel-title class="text-center text-disabled text-body-2">
            {{ $lang('directMessages.title') }}
          </v-expansion-panel-title>
          <v-expansion-panel-text class="mt-2">
            <!-- skeleton-loader -->
            <v-skeleton-loader v-if="isLoadingUsers" type="list-item-avatar" v-for="n in users?.length" :key="n"
              :loading="isLoadingUsers"></v-skeleton-loader>
            <!-- skeleton-loader -->
            <v-list-item v-for="user in users" :key="user._uuid" color="teal-darken-1"
              :active="activeElement === user._uuid" :elevation="1" @click="onSelect(user._uuid, 'user', user)">
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
        <!-- channels -->
        <v-expansion-panel value="channels" elevation="3">
          <v-expansion-panel-title class="text-center text-disabled text-body-2">
            {{ $lang('channel.title') }}
            <v-btn prepend-icon="mdi-chat-plus" variant="plain" color="teal">
              <create-channel-component @create-channel="emit('createChannel', $event)"
                :title="$lang('channel.createChannel')" create :key="_uuid" :users="users">
              </create-channel-component>
            </v-btn>
          </v-expansion-panel-title>
          <v-expansion-panel-text class="mt-2">
            <!-- skeleton-loader -->
            <v-skeleton-loader v-if="isLoadingChannels" type="list-item-avatar" v-for="n in channels?.length" :key="n"
              :loading="isLoadingChannels">
            </v-skeleton-loader>
            <!-- skeleton-loader -->
            <v-list-item v-for="channel in channels" :key="channel._id" :elevation="1"
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

