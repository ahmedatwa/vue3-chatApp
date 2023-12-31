<script setup lang="ts">
import { ref, watch, inject } from "vue";
import { SearchComponent } from "@/components/Common"
import { DownloadsComponent, ProfileComponent, SettingComponent } from "@/components/User";
// types
import type { UserSessionData, UserSettings } from "@/types/User";
import type { SearchUsers } from "@/types/Chat"
import type { UploadedFiles } from '@/types/Chat';
import { langKey } from "@/types/Symbols";

const drawer = inject<boolean>("drawer")
const user = inject<UserSessionData>("user")
const isOffline = ref(false);
const lang = inject(langKey)
const isDownloadsDialog = ref(false);
const isProfileDialog = ref(false);
const isSettingsDialog = ref(false);

defineProps<{
  searchUsers: SearchUsers[]
  downloadedFiles: UploadedFiles[] | null
}>()

const emit = defineEmits<{
  "logout": [value: { _uuid: string, sessionID: string, connected: boolean }];
  "update:status": [value: boolean];
  "update:setting": [value: UserSettings];
  "update:search": [value: string];
  "update:locale": [value: string];
  "update:profile": [value: { displayName: string, image: File | null }];
  "update:searchValue": [value: string];
  "update:downloads": [value: boolean];
  "update:downloadFile": [value: UploadedFiles];
  "update:clearDownloads": [value: boolean];
}>();

const logout = () => {
  if (user)
    emit("logout", { _uuid: user?._uuid, sessionID: user.sessionID, connected: false });
};

watch(isOffline, (newStatus) => {
  emit("update:status", newStatus);
});

</script>
<template>
  <v-container>
    <v-app-bar :elevation="2">
      <template v-slot:prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" icon="mdi-backburger"></v-app-bar-nav-icon>
      </template>
      <v-row>
        <v-col cols="9" class="mx-auto">
          <search-component :search-users="searchUsers" @update:search-value="$emit('update:searchValue', $event)">
          </search-component>
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
              @click="lang?.setLocale(locale.key)">
              <v-list-item-title>{{ locale.value }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
      <v-menu transition="slide-y-transition" offset="10" close-on-content-click>
        <template v-slot:activator="{ props }">
          <v-list-item v-bind:="props" value="avatar">
            <v-badge dot location="bottom end" :color="user?.connected ? 'success' : 'grey'" class="ma-1">
              <v-avatar v-if="user?.image" :image="user.image" size="30"></v-avatar>
              <v-avatar color="info" size="30" v-else variant="flat">
                <v-icon icon="mdi-account-circle"></v-icon>
              </v-avatar>
            </v-badge>
          </v-list-item>
        </template>
        <v-list>
          <v-list-item class="text-center" key="user" value="user">
            <v-badge dot location="bottom end" :color="user?.connected ? 'success' : 'grey'" class="ma-1">
              <v-avatar v-if="user?.image" :image="user.image"></v-avatar>
              <v-avatar color="info" v-else>
                <v-icon icon="mdi-account-circle"></v-icon>
              </v-avatar>
            </v-badge>
            <p class="mr-1 mt-1">{{ user?.displayName }}</p>
          </v-list-item>
          <v-list-item @click="isOffline = !isOffline" key="status">
            <v-list-item-title>
              <v-icon icon="mdi-account-badge" :color="isOffline === false ? 'success' : ''"></v-icon>
              {{ $lang('header.offline', [isOffline ? 'active' : 'away']) }}
            </v-list-item-title>
          </v-list-item>
          <v-divider :thickness="2"></v-divider>
          <v-list-item key="profile" value="profile" :title="$lang('header.profile')"
            @click="isProfileDialog = !isProfileDialog">
          </v-list-item>
          <v-list-item key="preference" value="preference" :title="$lang('header.preferences')"
            @click="isSettingsDialog = !isSettingsDialog">
          </v-list-item>
          <v-divider :thickness="2"></v-divider>
          <v-list-item key="downloads" value="downloads" :title="$lang('header.downloads')"
            @click="isDownloadsDialog = !isDownloadsDialog">
          </v-list-item>
          <v-divider :thickness="2"></v-divider>
          <v-list-item @click.stop="logout" key="logout">
            <v-list-item-title><v-icon icon="mdi-logout"></v-icon> {{ $lang('header.signOut') }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <profile-component v-if="isProfileDialog" v-model:model-value="isProfileDialog" :key="`profile-${user?._uuid}`"
      :user="user" @update:profile="$emit('update:profile', $event)" @update:model-value="isProfileDialog = $event">
    </profile-component>
    <setting-component v-if="isSettingsDialog" v-model:model-value="isSettingsDialog" :key="`settings-${user?._uuid}`"
      :user="user" @update:settings="$emit('update:setting', $event)" @update:model-value="isSettingsDialog = $event">
    </setting-component>
    <downloads-component v-if="isDownloadsDialog" v-model:model-value="isDownloadsDialog"
      :key="`downloads-${user?._uuid}`" :downloaded-files="downloadedFiles"
      @update:downloads="$emit('update:downloads', $event)" @update:download-file="$emit('update:downloadFile', $event)"
      @update:clear-downloads="$emit('update:clearDownloads', $event)" @update:model-value="isDownloadsDialog = $event">
    </downloads-component>
  </v-container>
</template>
