<script setup lang="ts">
import { CreateChannelComponent } from "@/components/Channel";
import type { User } from "@/types/User";
import type { Channels, ChannelForm } from "@/types/Channel";
import { ref, watch, inject } from "vue";

const drawer = inject<boolean>("drawer")
const activeElement = ref<number | string | null>(null);
const listGroups = ref(["Users", "Channels"])

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
  "removeUser": [value: string]
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
    <v-list lines="two" v-model:opened="listGroups">

      <!-- Users -->
      <v-list-group value="Users">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" :title="$lang('directMessages.title')" elevation="1" variant="flat"></v-list-item>
        </template>
        <!-- skeleton-loader -->
        <v-skeleton-loader v-if="isLoadingUsers" type="list-item-avatar" v-for="n in users?.length" :key="n"
          :loading="isLoadingUsers"></v-skeleton-loader>
        <!-- skeleton-loader -->
        <v-list-item v-for="user in users" :key="user._uuid" color="teal-darken-1" v-if="!isLoadingUsers"
          :active="activeElement === user._uuid" @click="onSelect(user._uuid, 'user', user)">
          <template #append v-if="user.newMessages">
            <v-badge :color="user.connected ? 'success' : 'dark'" :content="user.newMessages.total  " inline></v-badge>
          </template>
          
          <v-list-item-title>
             <!-- remove User -->
             <v-btn v-if="user._uuid !== _uuid" icon="mdi-close" class="float-right" color="red" size="sm" variant="plain"
              @click.prevent="$emit('removeUser', user._uuid)"></v-btn>

            <v-icon icon="mdi-account-circle" :color="user.connected ? 'success' : 'dark'">
            </v-icon>
            {{ user.displayName }} <span class="text-caption">{{ user._uuid === _uuid ? " you" : "" }}</span>
            <v-list-item-subtitle v-if="user.newMessages" class="ms-1 mt-1">
              {{ user.newMessages.lastMessage }}
            </v-list-item-subtitle>
          </v-list-item-title>
        </v-list-item>
      </v-list-group>
      <!-- channels -->
      <v-list-group value="Channels">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" :title="$lang('channel.title')" elevation="1" class="mt-3" variant="flat">
            <template #append>
              <v-btn prepend-icon="mdi-chat-plus" variant="plain" color="teal">
                <create-channel-component @create-channel="emit('createChannel', $event)"
                  :title="$lang('channel.createChannel')" create :key="_uuid" :users="users">
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
          @click="onSelect(channel._channelID, 'channel', channel)" :active="activeElement === channel._channelID"
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


