<script setup lang="ts">
import { onUnmounted, onBeforeMount } from "vue";
import { computed, watchEffect } from "vue";
import { LoginComponent } from "@/components/Common";
import { ChatComponent } from "@/components/Chat";
import OverlayComponent from "@/components/OverlayComponent.vue";
import { useSessionStore, useStorageStore } from "@/stores";
import socket, { socketError } from "@/client";

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

socket.on("error", (error) => {
  console.log(error);

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

watchEffect(() => {
  if (socketError.value !== null) {
    sessionStore.newAlert = socketError.value
  }
})
</script>
<template>
  <v-app>
    <overlay-component v-model:isLoading="sessionStore.isLoading"
      :error="sessionStore.newAlert" @exit:app="exitApp" @restore:session="restore"></overlay-component>
    <component :is="current"></component>
  </v-app>
</template>
