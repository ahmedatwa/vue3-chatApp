<script setup lang="ts">
import { onUnmounted, onBeforeMount } from "vue";
import { LoginComponent, ChatComponent } from "@/components";
import socket from "@/client";
import { useSessionStore } from "@/stores";
import { DBUser } from "@/types";
import { useTheme } from "vuetify";

const sessionStore = useSessionStore();
const theme = useTheme();

const onLogin = async (user: DBUser) => {
  await sessionStore.addSession(user);
};

onBeforeMount(async () => {
  const sessionId = localStorage.getItem("JSESSIOND");
  if (sessionId) {
    await sessionStore.getSession(sessionId);
  }
  const prefTheme = localStorage.getItem("theme");
  if (prefTheme) {
    theme.global.name.value = prefTheme;
  }
});

onUnmounted(() => {
  socket.off("connect_error");
  sessionStore.isLoggedIn = false;
});

socket.on("connect_error", (err) => {
  if (err.message === "invalid User ID") sessionStore.isLoggedIn = false;
});

socket.on("error", (err) => {
  sessionStore.responseError = err;
  socket.disconnect();
});
</script>

<template>
  <v-app>
    <v-overlay
      v-model="sessionStore.isLoading"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
    <LoginComponent @update:selected="onLogin" v-if="!sessionStore.isLoggedIn"></LoginComponent>
    <ChatComponent :session="sessionStore.userSessionData" v-else></ChatComponent>
  </v-app>
</template>
