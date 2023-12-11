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
    return ChatComponent;
  }
  return LoginComponent;
});

onBeforeMount(async () => {
  if (storageStore.sessionID) {
    await sessionStore.getSession(storageStore.sessionID);
  }

  if (!sessionStore.userSessionData?.settings) {
    storageStore.setStorage("APPUSSTIG", {
      theme: "light",
      muteConnectionNotif: false,
      leftOff: true,
    });
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
  //userStore.sessionResponse. = err;
  socket.disconnect();
});

const exitApp = () => {
  storageStore.destroy();
};

const restore = () => {
  if (storageStore.sessionID) {
    sessionStore.restoreSession(storageStore.sessionID);
  }
};

const isError = computed(() => {
  return sessionStore.newAlert !== null ? true : false;
});
</script>
<template>
  <v-app>
    <overlay-component
      v-model:isLoading="sessionStore.isLoading"
      v-model:isError="isError"
      :error="sessionStore.newAlert"
      @exit:app="exitApp"
      @restore:session="restore"
    ></overlay-component>
    <component :is="current"></component>
  </v-app>
</template>
