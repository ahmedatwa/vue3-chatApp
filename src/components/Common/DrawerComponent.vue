<script setup lang="ts">
import { ref, inject } from "vue";
import { CreateChannelComponent } from "@/components/Channel";
// Types
import type { Channels, ChannelForm } from "@/types/Channel";
import type { User } from "@/types/User";

const drawer = inject<boolean>("drawer")
const listGroups = ref(["users", "channels"])

// Props
defineProps<{
  users: User[];
  channels: Channels[];
  isLoadingChannels: boolean;
  isLoadingUsers: boolean;
  _uuid?: string;
  lastActiveElement?: number | string | null;
}>();

const emit = defineEmits<{
  "update:selected": [id: number | string, key: string, value: User | Channels];
  "createChannel": [value: ChannelForm];
  "update:channel:users": [value: string[]];
  "removeUser": [value: User]
}>();

const onSelect = (_id: number | string, key: string, value: User | Channels) => {
  emit("update:selected", _id, key, value);
};

</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list lines="two" v-model:opened="listGroups">
      <!-- Users -->
      <v-list-group value="users">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :title="$lang('directMessages.title')" elevation="1" variant="flat"></v-list-item>
        </template>
        <!-- skeleton-loader -->
        <v-skeleton-loader v-if="isLoadingUsers" type="list-item-avatar" v-for="n in users?.length" :key="n"
          :loading="isLoadingUsers"></v-skeleton-loader>
        <!-- skeleton-loader -->
        <v-list-item v-for="user in users" :key="user._uuid" color="teal-darken-1" v-if="!isLoadingUsers" :id="user._uuid"
          :active="lastActiveElement === user._uuid" @click="onSelect(user._uuid, 'user', user)" class="list-item">
          <v-list-item-title>
            <!-- remove User -->
            <v-btn v-if="user._uuid !== _uuid" icon="mdi-close" class="remove-user" size="sm" variant="plain"
              @click.prevent="$emit('removeUser', user)"></v-btn>
            <v-sheet class="d-flex">
              <v-badge location="bottom end" :color="user.connected ? 'success' : 'grey'" class="ma-1"
                :dot="user.newMessages ? false : true">
                <template #badge>
                  <span v-if="user.newMessages && lastActiveElement !== user._uuid"> {{ user.newMessages.total }}</span>
                </template>
                <v-avatar v-if="user.image" :image="user.image" size="30"></v-avatar>
                <v-avatar color="info" size="30" v-else>
                  <v-icon icon="mdi-account-circle"></v-icon>
                </v-avatar>
              </v-badge>
              <p class="ms-1 d-inline my-auto">{{ user.displayName }}</p>
            </v-sheet>
            <v-list-item-subtitle v-if="user.newMessages && lastActiveElement !== user._uuid" class="ms-1 mt-1">
              {{ user.newMessages.lastMessage }}
            </v-list-item-subtitle>
          </v-list-item-title>
        </v-list-item>
      </v-list-group>
      <!-- channels -->
      <v-list-group value="channels">
        <template #activator="{ props }">
          <v-list-item v-bind="props" :title="$lang('channel.title')" elevation="1" class="mt-3" variant="flat">
            <template #append>
              <v-btn prepend-icon="mdi-chat-plus" variant="plain" color="teal">
                <create-channel-component @create-channel="emit('createChannel', $event)" :title="$lang('channel.create')"
                  create :key="_uuid" :users="users">
                </create-channel-component>
              </v-btn>
            </template>
          </v-list-item>
        </template>
        <!-- skeleton-loader -->
        <v-skeleton-loader v-if="isLoadingChannels" type="list-item-avatar" v-for="n in channels?.length" :key="n"
          :loading="isLoadingChannels">
        </v-skeleton-loader>
        <!-- skeleton-loader -->
        <v-list-item v-for="channel in channels" :key="channel._id" color="teal-darken-1" v-if="!isLoadingChannels"
          @click="onSelect(channel._channelID, 'channel', channel)" :active="lastActiveElement === channel._channelID"
          :value="channel._channelID">
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

      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.remove-user {
  display: none;
  float: right;
}

.list-item:hover .remove-user {
  display: inline-block;
}
</style>
