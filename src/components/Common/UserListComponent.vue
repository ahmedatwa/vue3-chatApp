<script setup lang="ts">
import { capitalize } from "lodash";
import { CreateRoomComponent, SkeletonComponent } from "@/components";
import { User, Channels } from "@/types";
import { ref, watch, watchEffect } from "vue";

const drawer = ref(true);
const selectedElement = ref<string | number | null>(null);
const confirmChannelDelete = ref(false);

const props = defineProps<{
  users: User[] | undefined;
  channels: Channels[] | undefined;
  selectedChannel: Channels | null;
  drawer: boolean;
  isRoomLoading: boolean;
  isUserLoading: boolean;
  _uuid: string | undefined;
  lastSelectedElement?: string | number | null;
}>();

const emit = defineEmits<{
  "update:selected": [id: string, key: string, value: User | Channels];
  "user:created:room": [value: string];
  "on:delete:channel": [value: Channels];
}>();

const onSelect = (_id: string, key: string, value: User | Channels) => {
  emit("update:selected", _id, key, value);
  selectedElement.value = _id;
};

watch(
  () => props.drawer,
  (newVal) => {
    drawer.value = newVal;
  }
);

watchEffect(() => {
  if (props.lastSelectedElement) {
    selectedElement.value = props.lastSelectedElement;
  }
});

const deleteChannel = (channel: Channels) => {
  emit("on:delete:channel", channel);
};
</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list lines="two">
      <!-- Users -->
      <v-sheet class="text-center text-disabled text-body-2">
        Direct Messages
      </v-sheet>
      <!-- skeleton-loader -->
      <skeleton-component type="list-item-avatar" :length="users?.length" :loading="isUserLoading" v-if="isUserLoading">
      </skeleton-component>
      <!-- skeleton-loader -->
      <v-list-item v-for="user in users" :key="user._uuid" v-if="!isUserLoading" :active="selectedElement === user._uuid"
        :elevation="1" @click="onSelect(user._uuid, 'user', user)" class="my-2">
        <template v-slot:append v-if="user.newMessages">
          <v-badge :color="user.connected ? 'success' : 'dark'" :content="user.newMessages?.total" inline></v-badge>
        </template>
        <v-list-item-title>
          <v-icon icon="mdi-account-circle" :color="user.connected ? 'success' : 'dark'">
          </v-icon>
          {{ capitalize(user.username) }} {{ user.self ? " (Me)" : "" }}
          <v-list-item-subtitle v-if="user.newMessages" class="ms-1 mt-1">
            {{ user.newMessages?.lastMessage }}
          </v-list-item-subtitle>
        </v-list-item-title>
      </v-list-item>

      <!-- Rooms -->

      <v-sheet class="text-center text-disabled text-body-2">
        Channels
        <create-room-component @create:room="$emit('user:created:room', $event)" icon="mdi-chat-plus" color="indigo-darken-1"
          title="Create Channel" :key="_uuid">
          <template v-slot:create-room="{ inputValue }">
            <v-btn type="submit" :disabled="inputValue.length < 3" block color="indigo-darken-3">Create</v-btn>
          </template>
        </create-room-component>
      </v-sheet>

      <!-- skeleton-loader -->
      <skeleton-component type="list-item-avatar" :length="channels?.length" :loading="isRoomLoading"
        v-if="isRoomLoading">
      </skeleton-component>
      <!-- skeleton-loader -->
      <v-list-item v-for="channel in channels" :key="channel._id" v-if="!isRoomLoading" :elevation="1"
        @click="onSelect(channel._roomId, 'room', channel)" :active="selectedElement === channel._roomId">
        <v-slide-x-reverse-transition mode="out-in">
        <v-list-item-title> {{ channel.name }}</v-list-item-title>
        </v-slide-x-reverse-transition>
        <template v-slot:append>
          <v-btn color="pink-darken-1" variant="tonal" rounded="xl" size="small">
            <v-icon icon="mdi-delete-empty-outline" size="large"></v-icon>
            <v-dialog v-model="confirmChannelDelete" activator="parent" width="auto">
              <v-card>
                <v-card-text>
                  <v-icon icon="mdi-alert-circle"></v-icon> This action couldn't
                  be undone!
                </v-card-text>
                <v-card-actions>
                  <v-btn @click="deleteChannel(channel)" color="primary"
                    prepend-icon="mdi-content-save-check-outline">Confirm</v-btn>
                  <v-btn @click="confirmChannelDelete = false" class="ms-auto" prepend-icon="mdi-close-circle"
                    color="error">Close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
