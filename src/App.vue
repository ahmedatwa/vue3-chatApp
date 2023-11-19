<script setup lang="ts">
import { onUnmounted, onBeforeMount, computed } from "vue";
import { LoginComponent } from "@/components/Common";
import { ChatComponent } from "@/components/Chat";
import OverlayComponent from "@/components/OverlayComponent.vue";

import { useSessionStore, useStorageStore } from "@/stores";
import socket from "@/client";

const sessionStore = useSessionStore();
const storageStore = useStorageStore();

const current = computed(() => {
  if (sessionStore.isLoggedIn) {
    return ChatComponent
  }
  return LoginComponent
})

onBeforeMount(async () => {
  const sessionId = storageStore.getSessionId();
  if (sessionId) {
    await sessionStore.getSession(sessionId);
  }
  const settings = storageStore.appSettings;
  if (!settings) {
    storageStore.setAppSettings({ theme: "light", connectionNotif: true })
  }

});

onUnmounted(() => {
  socket.off("connect_error");
  sessionStore.isLoggedIn = false;
});

socket.on("connect_error", (err) => {
  if (err.message === "invalid User ID") sessionStore.isLoggedIn = false;
});

socket.on("error", (__err) => {
  //sessionStore.sessionResponse. = err;
  socket.disconnect();
});

const exitApp = () => {
  localStorage.clear()
  location.reload()
}

const restore = () => {
  const sessionId = storageStore.getSessionId();
  if (sessionId) {
    sessionStore.restoreSession(sessionId);
  }
}

const isError = computed(() => {
  return sessionStore.sessionError !== null ? true : false
})
</script>
<template>
  <v-app>
    <overlay-component v-model:isLoading="sessionStore.isLoading" @exit:app="exitApp" @restore:session="restore"
      v-model:isError="isError" :error="sessionStore.sessionError"></overlay-component>
    <component :is="current"></component>
  </v-app>
</template>
