<script setup lang="ts">
import { onUnmounted, onBeforeMount, computed } from "vue";
import { LoginComponent } from "@/components/Common";
import { ChatComponent } from "@/components/Chat";
import OverlayComponent from "@/components/OverlayComponent.vue";
import { useUserStore, useStorageStore } from "@/stores";
import socket from "@/client";

const userStore = useUserStore()
const storageStore = useStorageStore()

const current = computed(() => {  
  if (userStore.isLoggedIn) {
    return ChatComponent
  }
  return LoginComponent
})

onBeforeMount(async () => {
  if (storageStore.sessionID) {
    await userStore.getSession(storageStore.sessionID);
  }

  if (!storageStore.userStorageSettings) {
    storageStore.setStorage("APPUSSTIG", { theme: "light", muteConnectionNotif: false, leftOff: true })
  }

});

onUnmounted(() => {
  socket.off("connect_error");
  userStore.isLoggedIn = false;
});

socket.on("connect_error", (err) => {
  if (err.message === "invalid User ID") userStore.isLoggedIn = false;
});

socket.on("error", (__err) => {
  //userStore.sessionResponse. = err;
  socket.disconnect();
});

const exitApp = () => {
  storageStore.destroy()
}

const restore = () => {
  if (storageStore.sessionID) {
    userStore.restoreSession(storageStore.sessionID);
  }
}

const isError = computed(() => {
  return userStore.sessionError !== null ? true : false
})
</script>
<template>
  <v-app>
    <overlay-component v-model:isLoading="userStore.isLoading" @exit:app="exitApp" @restore:session="restore"
      v-model:isError="isError" :error="userStore.sessionError"></overlay-component>
    <component :is="current"></component>
  </v-app>
</template>
