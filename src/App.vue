<script setup lang="ts">
import { onUnmounted, onBeforeMount } from "vue";
import { LoginComponent, ChatComponent } from "@/components";
import socket from "@/client";
import { useSessionStore } from "@/stores";
import { LoggedUser } from "@/types";
import { useTheme } from 'vuetify'

const userSessionStore = useSessionStore();
const theme = useTheme()

const onLogin = async (user: LoggedUser) => {
  await userSessionStore.addSession(user);
};

onBeforeMount(async () => {
  const sessionId = localStorage.getItem("JSESSIOND");
  if (sessionId) {
    await userSessionStore.getSession(sessionId);
  }
  const prefTheme = localStorage.getItem("theme");
  if(prefTheme) {
    theme.global.name.value = prefTheme
  }
});

onUnmounted(() => {
  socket.off("connect_error");
  userSessionStore.isLoggedIn = false;
});

socket.on("connect_error", (err) => {
  if (err.message === "invalid User ID") userSessionStore.isLoggedIn = false;
});

socket.on("error", (err) => {
  userSessionStore.responseError = err;
  socket.disconnect();
});
</script>

<template>
  <v-app>
    <v-overlay v-model="userSessionStore.isLoading" class="align-center justify-center">
      <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-alert v-if="userSessionStore.responseError" color="success" icon="$success" title="Alert title"
      :text="userSessionStore.responseError"></v-alert>
    <LoginComponent @selected="onLogin"></LoginComponent>
    <ChatComponent :session="userSessionStore.userSessionData"></ChatComponent>
  </v-app>
</template>
