<script setup lang="ts">
import { capitalize, isEmpty } from "lodash";
import { computed, ref, watch } from "vue";
import { SettingComponent, ProfileComponent, SearchInputComponent } from "@/components";
import { Settings, UserSessionData } from "@/types";

const isOffline = ref(false);
const searchTerm = ref("");
const drawer = ref(true);

const props = defineProps<{
  userSession: UserSessionData | undefined;
  userSetting: Settings | string;
  drawer: boolean;
}>();

const emit = defineEmits<{
  logout: [uuid: string, sessionId: string];
  "update:status": [value: boolean];
  "toggle:drawer": [value: boolean];
  "update:setting": [value: Settings];
  "update:search": [value: string];
}>();


const logout = () => {
  if (props.userSession?._uuid && props.userSession?.sessionId)
    emit("logout", props.userSession?._uuid, props.userSession?.sessionId);
};

watch(isOffline, (newStatus) => {
  emit("update:status", newStatus);
});

const status = computed(() => {
  if (isOffline.value) {
    return "Set yourself as active";
  } else {
    return "Set yourself as away";
  }
});

const updateSettings = (settings: Settings) => {
  emit('update:setting', settings)
}

watch(drawer, (value) => {
  emit("toggle:drawer", value);
});

watch(
  () => props.drawer,
   (newValue) => {
    drawer.value = newValue
   })
// Atwa Mankash
const color = ref(false);
</script>
<template>
  <v-container>
    <v-app-bar :elevation="2">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" icon="mdi-backburger"></v-app-bar-nav-icon>
      </template>
      <v-row>
        <v-col cols="9" class="mx-auto">
          <search-input-component v-model:term="searchTerm" @input="$emit('update:search', $event.target.value)"
            class="mt-5"></search-input-component>
        </v-col>
      </v-row>


      <v-btn icon>
        <v-icon @click="color = !color" :color="color ? 'red' : ''">mdi-heart</v-icon>
      </v-btn>
      <v-menu transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind:="props" style="cursor: pointer;">
            <v-avatar v-if="!isEmpty(userSession?.image)" :image="userSession?.image" class="me-2"></v-avatar>
            <v-avatar icon="mdi-account-circle" size="69" v-else> </v-avatar>
          </v-list-item>
        </template>
        <v-list>
          <v-list-item class="text-center" key="user" value="user">
            <v-avatar>
              <v-img v-if="userSession?.image" :src="userSession.image" alt="John"></v-img>
              <v-icon icon="mdi-account-circle" v-else> </v-icon>
            </v-avatar>
            <v-badge dot inline :color="userSession?.connected ? 'success' : 'dark'">
              <p class="mr-1">{{ capitalize(userSession?.username) }}</p>
            </v-badge>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="isOffline = !isOffline" key="status">
            <v-list-item-title>
              <v-icon icon="mdi-account-badge" :color="isOffline === false ? 'success' : ''"></v-icon> {{ status }}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item key="profile" value="profile">
            <v-list-item-title> <v-icon icon="mdi-account-edit"></v-icon> Profile</v-list-item-title>
            <profile-component :user="userSession"></profile-component>
          </v-list-item>
          <v-list-item key="setting" value="setting">
            <v-list-item-title><v-icon icon="mdi-cog"></v-icon> Preferences</v-list-item-title>
            <setting-component @on:update:settings="updateSettings" :setting="userSetting"></setting-component>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item key="downloads" value="downloads" class="pointer">
            <v-list-item-title> <v-icon icon="mdi-download-box"></v-icon> Downloads</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click.stop="logout" key="logout">
            <v-list-item-title><v-icon icon="mdi-logout"></v-icon> Sign out </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </v-container>
</template>
