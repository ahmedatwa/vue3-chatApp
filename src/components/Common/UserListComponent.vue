<script setup lang="ts">
import { capitalize } from "lodash";
import { SearchInputComponent, CreateRoomComponent, SkeletonComponent } from "@/components";
import { User, Room, DBUser } from "@/types";
import { ref, watch, onMounted, watchEffect, computed } from "vue";
import { useStorage } from "@vueuse/core";

const filter = ref("");
const drawer = ref(true);
const selectedElement = ref("");
const state = useStorage("LSTSELECD", selectedElement.value);

interface Props {
  users: User[] | undefined;
  allUsers: DBUser[] | undefined;
  channels: Room[] | undefined;
  selectedUserID: String | undefined;
  roomId: String | undefined;
  drawer: boolean;
  isRoomLoading: boolean;
  isUserLoading: boolean;
  _uuid: string | undefined;

}
const props = defineProps<Props>();

const emit = defineEmits<{
  "update:selected": [id: string, value: User | Room];
  "update:filter": [value: string];
  "create:room": [value: { name: string, users: string[] }];
}>();



const onSelect = (_id: string | number, key: string, value: User | Room) => {
  emit('update:selected', key, value)
  selectedElement.value = _id as string
}

onMounted(() => {
  const activeX = localStorage.getItem("LSTSELECD");
  if (activeX) {
    selectedElement.value = activeX

  }
})

// watchers
watch(filter, (NewValue) => {
  emit("update:filter", NewValue);
});

watch(
  () => props.drawer,
  (newVal) => {
    drawer.value = newVal
  }
)

watch(
  () => selectedElement.value,
  (selected) => {
    state.value = selected;
  }
);


watchEffect(() => {
  if (selectedElement.value) {
    // refselectedElement.value?.click();
    console.log("#" + selectedElement.value);
    let el = "#" + selectedElement.value
    const test = document.querySelector(el);
    console.log(test);
  } else {
    // not mounted yet, or the element was unmounted (e.g. by v-if)
  }
})

const channelNameInput = ref("")

const channelNameValidition = (input: string) => {
  channelNameInput.value = input
  
}
const isValidChannelInput = computed(() => {
  return channelNameInput.value.length < 3 
})
</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <template v-slot:prepend>
      <search-input-component v-model:term="filter" class="mt-2"></search-input-component>
    </template>
    <v-list>
      <!-- Users -->
      <v-sheet class="text-center text-disabled text-body-2">
        Direct Messages
      </v-sheet>
      <!-- skeleton-loader -->
      <skeleton-component type="list-item-avatar" :length="users?.length" :loading="isUserLoading" v-if="isUserLoading">
      </skeleton-component>
      <!-- skeleton-loader -->
      <v-list-item v-for="user in users" :key="user._uuid" v-if="!isUserLoading" :active="selectedElement === user._uuid"
        :elevation="1" @click="onSelect(user._uuid, 'user', user)" class="my-2" rounded="shaped" :id="selectedElement">
        <template v-slot:append v-if="user.newMessages">
          <v-badge :color="user.connected ? 'success' : 'dark'" :content="user.newMessages?.total" inline></v-badge>
        </template>
        <v-list-item-title>
          <v-icon icon="mdi-account-circle" :color="user.connected ? 'success' : 'dark'"> </v-icon> {{
            capitalize(user.username) }} {{ user.self ? " (Me)" : "" }}
          <v-list-item-subtitle v-if="user.newMessages" class="ms-1 mt-1">
            {{ user.newMessages?.lastMessage }}
          </v-list-item-subtitle>
        </v-list-item-title>
      </v-list-item>

      <!-- Rooms -->

      <v-sheet class="text-center text-disabled text-body-2">
        Channels
        <create-room-component @create:room="$emit('create:room', $event)" :allUsers="allUsers" icon="mdi-chat-plus"
          color="primary" title="Create Channel" subTitle="Invite Users" :currentUser="_uuid" :key="_uuid"
          @update:input:value="channelNameValidition">
          <v-btn type="submit" :disabled="isValidChannelInput" block color="indigo-darken-3">Create</v-btn>
        </create-room-component>
      </v-sheet>

      <!-- skeleton-loader -->
      <skeleton-component type="list-item-avatar" :length="channels?.length" :loading="isRoomLoading"
        v-if="isRoomLoading">
      </skeleton-component>
      <!-- skeleton-loader -->

      <v-list-item v-for="channel in channels" :key="channel._id" v-if="!isRoomLoading" :elevation="1"
        @click="onSelect(channel._roomId, 'room', channel)" rounded="shaped" :active="selectedElement === channel._roomId"
        :id="selectedElement">
        <v-list-item-title> {{ channel.name }}</v-list-item-title>
        <template v-slot:append>
          <create-room-component @create:room="$emit('create:room', $event)" :allUsers="allUsers" icon="mdi-account-plus"
            color="grey-lighten-1" title="Invite Users" :channelName="channel.name" :currentUser="_uuid" :key="channel.name">
            <v-btn type="submit" block color="indigo-darken-3">Add</v-btn>
          </create-room-component>
        </template>
      </v-list-item>
    </v-list>

  </v-navigation-drawer>
</template>