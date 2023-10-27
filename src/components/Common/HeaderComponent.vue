<script setup lang="ts">
import { capitalize, isEmpty } from "lodash";
import { computed, ref, watch } from "vue";
import { SettingComponent, ProfileComponent, SearchInputComponent } from "@/components";
import { Settings } from "@/types";

const isOffline = ref(false);
const preferences = ref(false);
const profile = ref(false);
const searchTerm = ref("");

const props = defineProps<{
  connected: boolean | undefined;
  username: string | undefined;
  image: string | undefined;
  sessionId: string | undefined;
  uuid: string | undefined;
}>();

const emit = defineEmits<{
  logout: [uuid: string, sessionId: string];
  "update:status": [value: boolean];
  "toggle:drawer": [value: boolean];
  "update:setting": [value: Settings];
  "update:search": [value: string];
}>();

const drawer = ref(true);

const logout = () => {
  if (props.uuid && props.sessionId)
    emit("logout", props.uuid, props.sessionId);
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

watch(drawer, (value) => {
  emit("toggle:drawer", value);
});

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

    <v-sheet id="settings" class="pointer mr-5">
      <v-avatar>
        <v-img v-if="!isEmpty(props.image)" :src="props.image" alt="image"></v-img>
        <v-icon icon="mdi-account-circle" v-else> </v-icon>
      </v-avatar>
      <v-badge dot floating :color="props.connected ? 'success' : 'dark'">
        <p class="mx-1">{{ capitalize(props.username) }}</p>
      </v-badge>
    </v-sheet>
    <v-menu transition="slide-y-transition" activator="#settings" open-on-hover>
      <v-list>
        <v-list-item rounded="xl" class="text-center">
          <v-avatar>
            <v-img v-if="!isEmpty(props.image)" :src="props.image" alt="John"></v-img>
            <v-icon icon="mdi-account-circle" v-else> </v-icon>
          </v-avatar>
          <v-badge dot inline :color="props.connected ? 'success' : 'dark'">
            <p class="mr-1">{{ capitalize(props.username) }}</p>
          </v-badge>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item rounded="xl" @click.stop="isOffline = !isOffline">
          <v-list-item-title>
            <v-icon icon="mdi-account-badge" :color="isOffline === false ? 'success' : ''"></v-icon>
            {{ status }}</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item rounded="xl" @click="profile = !profile">
          <v-list-item-title>
            <v-icon icon="mdi-face-man-profile"></v-icon>
            Profile</v-list-item-title>
        </v-list-item>

        <v-list-item rounded="xl" @click="preferences = !preferences">
          <v-list-item-title>
            <v-icon icon="mdi-cog"></v-icon> Preferences</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item rounded="xl">
          <v-list-item-title>
            <v-icon icon="mdi-download-box"></v-icon>
            Downloads</v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>

        <v-list-item rounded="xl" @click.stop="logout">
          <v-list-item-title><v-icon icon="mdi-logout"></v-icon> Sign out
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</v-container>
  <!-- Preferece -->
  <SettingComponent :visible="preferences" @update:modelValue="preferences = $event"
    @update:visible="preferences = $event" @on:update:settings="$emit('update:setting', $event)"></SettingComponent>
  <ProfileComponent :visible="profile" @update:modelValue="profile = $event" @update:visible="preferences = $event">
  </ProfileComponent>
</template>
<style scoped>
.pointer {
  cursor: pointer;
}
</style>