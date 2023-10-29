<script setup lang="ts">
import { capitalize } from "lodash";
import { CreateRoomComponent, SkeletonComponent } from "@/components";
import { ConfirmDialogComponent } from "@/components";
import { User, Channels } from "@/types";
import { ref, watch, watchEffect } from "vue";

const drawer = ref(true);
const selectedElement = ref<string | number | null>(null);

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
  "on:leave:channel": [id: string, value: Channels];
  "update:drawer": [value: boolean];

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

const leaveChannel = (channel: Channels) => {
  if (props._uuid)
    emit("on:leave:channel", props._uuid, channel);
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
        <create-room-component @create:room="$emit('user:created:room', $event)" icon="mdi-chat-plus"
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
      <v-expand-x-transition v-for="channel in channels" :key="channel._id">
        <v-list-item v-if="!isRoomLoading" :elevation="1" @click="onSelect(channel._roomId, 'room', channel)"
          :active="selectedElement === channel._roomId">
          <template v-slot:append v-if="channel.newMessages">
          <v-badge color="success" :content="channel.newMessages?.total" inline></v-badge>
        </template>
          <v-list-item-title> {{ channel.name }}
            <v-list-item-subtitle v-if="channel.newMessages" class="ms-1 mt-1">
            {{ capitalize(channel.newMessages?.from) }}: {{ channel.newMessages?.lastMessage }}
          </v-list-item-subtitle>
        </v-list-item-title>
          <template v-slot:append>
            <!-- Leave Channel -->
            <v-sheet class="d-flex justify-end">
              <v-btn color="blue-grey-lighten-2" density="compact" :icon="true" class="me-2">
                <v-icon icon="mdi-exit-run" size="x-small"></v-icon>
                <confirm-dialog-component title="Leave Channel." title-icon="mdi-exit-run">
                  <template v-slot:action-button>
                    <v-btn @click="leaveChannel(channel)" color="primary"
                      prepend-icon="mdi-content-save-check-outline">Leave</v-btn>
                  </template>
                </confirm-dialog-component>
              </v-btn>
              <!-- Delete Channel -->
              <v-btn color="pink-darken-1" density="compact" :icon="true" 
                v-if="channel.createdBy === _uuid">
                <v-icon icon="mdi-delete-empty-outline" size="x-small"></v-icon>
                <confirm-dialog-component title="This Action can't be undone." title-icon="mdi-store-remove">
                  <template v-slot:action-button>
                    <v-btn @click="deleteChannel(channel)" color="primary"
                      prepend-icon="mdi-content-save-check-outline">Confirm</v-btn>
                  </template>
                </confirm-dialog-component>
              </v-btn>
            </v-sheet>
          </template>
        </v-list-item>
      </v-expand-x-transition>
    </v-list>
  </v-navigation-drawer>
</template>
