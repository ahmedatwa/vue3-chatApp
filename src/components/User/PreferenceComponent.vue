<script setup lang="ts">
import { shallowRef, inject } from "vue"
// Types
import type { UserSettings, UserSessionData } from "@/types/User";
// children 
import { SettingComponent, ProfileComponent, DownloadComponent } from "@/components/User"

const tab = shallowRef("profile")
const user = inject<UserSessionData>("user")

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  "update:profile": [value: { displayName: string, image: File | null }];
  "update:settings": [value: UserSettings];
  "update:modelValue": [value: boolean]
}>();

</script>
<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="450" height="auto"
    transition="dialog-top-transition" class="pa-4" scrollable>
    <v-card>
      <v-card-title>
        <v-avatar v-if="user?.image !== ''" :image="user?.image"></v-avatar>
        <v-avatar icon="mdi-account-circle" :color="user.connected ? 'success' : ''" v-else> </v-avatar>
        {{ user?.displayName }}
        <v-icon icon="mdi-close-circle-outline" color="red" class="float-right"
          @click="$emit('update:modelValue', false)"></v-icon>
      </v-card-title>
      <v-tabs v-model="tab" align-tabs="center" class="mb-3">
        <v-tab value="profile">{{ $lang('preference.userProfile') }}</v-tab>
        <v-tab value="setting">{{ $lang('preference.userSettings') }}</v-tab>
        <v-tab value="download">{{ $lang('preference.userDownloads') }}</v-tab>
      </v-tabs>
      <v-divider :thickness="3" color="info"></v-divider>
      <v-window v-model="tab">
        <v-window-item value="profile">
          <profile-component @update:profile="$emit('update:profile', $event)"></profile-component>
        </v-window-item>
        <v-window-item value="setting">
          <setting-component @update:settings="$emit('update:settings', $event)"></setting-component>
        </v-window-item>
        <v-window-item value="download">
          <download-component />
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>