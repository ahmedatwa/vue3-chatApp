<script setup lang="ts">
import { computed, ref, watch, inject } from "vue";
import { SearchInputComponent } from "@/components/Common";
import { SettingComponent, ProfileComponent } from "@/components/Setting";
// types
import { UserSessionData } from "@/types/Session.ts";
import { Settings } from "@/types";
import { langKey } from "@/types/Symbols.ts";
  
const drawer = inject<boolean>("drawer")
const isOffline = ref(false);
const searchTerm = ref("");
const lang = inject(langKey)
const user = inject<UserSessionData>('user')

const emit = defineEmits<{
  "logout": [uuid: string, sessionId: string];
  "update:status": [value: boolean];
  "update:setting": [value: Settings];
  "update:search": [value: string];
  "update:locale": [value: string];
}>();

const logout = () => {
  if (user)
    emit("logout", user?._uuid, user?.sessionID);
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
  emit("update:setting", settings);
};

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
      <v-btn icon density="compact" class="me-2" color="primary">
        <v-icon icon="mdi-format-font"></v-icon>
      </v-btn>
      <v-btn icon density="compact" color="red">
        <v-icon icon="mdi-translate-variant"></v-icon>
        <v-menu activator="parent">
          <v-list>
            <v-list-item v-for="locale in lang?.locales" :key="locale.key" :value="locale.value"
              @click.stop="lang?.setLocale(locale.key)">
              <v-list-item-title>{{ locale.value }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-menu transition="slide-y-transition">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind:="props" value="avatar">
            <v-avatar v-if="user?.image !== ''" :image="user?.image"></v-avatar>
            <v-avatar icon="mdi-account-circle" size="69" v-else> </v-avatar>
            <v-icon icon="mdi-menu-down"></v-icon>
          </v-list-item>
        </template>
        <v-list>
          <v-list-item class="text-center" key="user" value="user">
            <v-avatar>
              <v-img v-if="user?.image !== ''" :src="user?.image" :alt="user?.userName"></v-img>
              <v-icon icon="mdi-account-circle" v-else> </v-icon>
            </v-avatar>
            <v-badge dot inline :color="user?.connected ? 'success' : 'dark'">
              <p class="mr-1">{{ user?.displayName }}</p>
            </v-badge>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="isOffline = !isOffline" key="status">
            <v-list-item-title>
              <v-icon icon="mdi-account-badge" :color="isOffline === false ? 'success' : ''"></v-icon>
              {{ status }}
            </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item key="profile" value="profile">
            <v-list-item-title>
              <v-icon icon="mdi-account-edit"></v-icon>
              {{ $lang('textProfile') }}</v-list-item-title>
            <profile-component :user="user"></profile-component>
          </v-list-item>
          <v-list-item key="setting" value="setting">
            <v-list-item-title><v-icon icon="mdi-cog"></v-icon> {{ $lang('textPreference') }}</v-list-item-title>
            <setting-component @on:update:settings="updateSettings"></setting-component>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item key="downloads" value="downloads" class="pointer">
            <v-list-item-title>
              <v-icon icon="mdi-download-box"></v-icon>
              {{ $lang('textDownloads') }}</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click.stop="logout" key="logout">
            <v-list-item-title><v-icon icon="mdi-logout"></v-icon> {{ $lang('textSignOut') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </v-container>
</template>
