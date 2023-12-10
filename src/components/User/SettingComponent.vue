<script setup lang="ts">
import { ref, onMounted, nextTick, inject } from "vue";
import { UserSettings, UserSessionData } from "@/types/User"

const user = inject<UserSessionData>("user")

// Settings
const settingsForm = ref<UserSettings>({
  theme: "light",
  leftOff: true,
  muteConnectionNotif: false
})

const isAlert = ref(false)

const emit = defineEmits<{
  "update:settings": [value: UserSettings];
}>();

const saveSettings = () => {
  if (settingsForm.value) {
    emit("update:settings", { ...settingsForm.value })
    nextTick(() => {
      isAlert.value = true
    })
  }
};


onMounted(() => {
  if (user?.settings) {
    settingsForm.value = user?.settings
  }
})
</script>
<template>
  <v-sheet class="ma-4 px-4">
    <v-alert v-if="isAlert" closable :text="$lang('preference.success', ['settings'])" type="success"
      variant="tonal"></v-alert>
    <v-switch :label="$lang('preference.input.toggleDark')" hide-details v-model="settingsForm.theme" true-value="dark"
      false-value="light" color="success"></v-switch>
    <v-switch :label="$lang('preference.input.leftOff')" true-value="1" false-value="0" hide-details
      v-model="settingsForm.leftOff" color="success">
    </v-switch>
    <v-switch :label="$lang('preference.input.userConnNotification')" hide-details
      v-model="settingsForm.muteConnectionNotif" true-value="1" false-value="0" color="success"></v-switch>
    <v-btn prepend-icon="mdi-content-save-cog" class="mt-3" color="#5865f2" @click="saveSettings" block variant="flat">{{
      $lang('preference.button.saveSettings') }}</v-btn>
  </v-sheet>
</template>