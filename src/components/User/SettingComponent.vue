<script setup lang="ts">
import { ref, onMounted } from "vue";
import { UserAppSettings } from "@/types/User"

// Settings
const settingsForm = ref<UserAppSettings>({
  theme: "light",
  leftOff: true,
  muteConnectionNotif: false

})

const props = defineProps<{
  modelValue: boolean
  userSettings: UserAppSettings | null
}>()

const emit = defineEmits<{
  "on:update:settings": [value: UserAppSettings];
  "update:modelValue": [value: boolean];
}>();

const saveSettings = () => {
  emit("on:update:settings", {
    theme: settingsForm.value.theme,
    leftOff: settingsForm.value.leftOff,
    muteConnectionNotif: settingsForm.value.muteConnectionNotif,
  })
  emit('update:modelValue', false)
};


onMounted(() => {
  if (props.userSettings) {
    settingsForm.value = props.userSettings
  }
})
</script>
<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" width="400"
    transition="dialog-top-transition" class="ma-4">
    <v-card class="ma-2">
      <v-card-title>
        <v-icon icon="mdi-account-cog"></v-icon>{{ $lang('settings.title') }}
        <v-icon class="float-right" @click="$emit('update:modelValue', false)" icon="mdi-close-circle-outline"
          color="red"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="info"></v-divider>
      <v-card-text>
        <v-switch :label="$lang('settings.input.toggleDark')" hide-details v-model="settingsForm.theme" true-value="dark"
          false-value="light" color="success"></v-switch>
        <v-switch :label="$lang('settings.input.leftOff')" hide-details v-model="settingsForm.leftOff" color="success">
        </v-switch>
        <v-switch :label="$lang('settings.input.userConnNotification')" hide-details
          v-model="settingsForm.muteConnectionNotif" color="success"></v-switch>

      </v-card-text>
      <v-card-actions class="w-100">
        <v-btn prepend-icon="mdi-content-save-cog" color="#5865f2" @click="saveSettings" block variant="flat">{{
          $lang('settings.button.save') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>