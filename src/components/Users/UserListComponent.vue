<script setup lang="ts">
import { capitalize } from "lodash";
import { SearchInputComponent, RoomFormComponent, SkeletonLoaderComponent } from "@/components";
import { User, Room } from "@/types";
import { ref, watch } from "vue";

const filterUser = ref("");
const drawer = ref(true);

interface Props {
  users: User[] | undefined;
  rooms: Room[];
  selectedUserID: String | undefined;
  drawer: boolean,
  loading: boolean
}
const props = defineProps<Props>();

const emit = defineEmits<{
  "update:selected": [value: User];
  "update:filter": [value: string];
  'create:room': [value: string];
  'join:room': [value: Room];
}>();

watch(filterUser, (NewValue) => {
  emit("update:filter", NewValue);
});

watch(
  () => props.drawer,
  (newVal) => {
    drawer.value = newVal
  }
)


</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <template v-slot:prepend>
      <SearchInputComponent v-model:term="filterUser" class="mt-2" />
    </template>



    <v-list>
      <!-- Users -->
      <v-sheet class="text-center text-disabled text-body-2">
        Direct Messages
      </v-sheet>
      <!-- skeleton-loader -->
      <SkeletonLoaderComponent type="list-item-avatar" :length="users?.length" :loading="props.loading"></SkeletonLoaderComponent>
      <!-- skeleton-loader -->
      <v-list-item v-for="user in users" :key="user.uuid" :id="user.uuid" v-if="!props.loading"
        :active="user.uuid === selectedUserID" :elevation="1" @click="$emit('update:selected', user)" class="my-2"
        rounded="shaped">
        <template v-slot:append v-if="user.newMessages">
          <v-badge :color="user.connected ? 'success' : 'dark'" :content="user.newMessages?.total" inline></v-badge>
        </template>
        <v-list-item-title>
          <v-icon icon="mdi-account-circle" :color="user.connected ? 'success' : ''"> </v-icon> {{ capitalize(user.username) }}
          {{ user.self ? " (Me)" : "" }}
          <v-list-item-subtitle v-if="user.newMessages" class="ms-1 mt-1">
            {{ user.newMessages?.lastMessage }}
          </v-list-item-subtitle>
        </v-list-item-title>
      </v-list-item>

      <!-- Rooms -->

      <v-sheet class="text-center text-disabled text-body-2">
        Channels
        <RoomFormComponent @create:room="$emit('create:room', $event)" :users="props.users"></RoomFormComponent>
      </v-sheet>



      <v-list-item v-for="room in rooms" :key="room._id" :id="`id-${room._id}`" v-if="!props.loading" :elevation="1"
        @click="$emit('join:room', room)" rounded="shaped">
        <v-list-item-title> {{ room.name }}</v-list-item-title>
      </v-list-item>

      <!-- skeleton-loader -->
      <v-list v-for="n in rooms?.length" v-if="props.loading">
          <v-skeleton-loader :elevation="1" type="list-item-avatar" :key="n"></v-skeleton-loader>
        </v-list>
      <!-- skeleton-loader -->

      <v-list-item>

      </v-list-item>
    </v-list>

  </v-navigation-drawer>
</template>