<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { UserSettings, UserSessionData } from "@/types/User"

const isAlert = ref(false)

// Settings
const settingsForm = ref<UserSettings>({
  theme: "light",
  leftOff: true,
  muteConnectionNotif: false,
})


const props = defineProps<{
  modelValue: boolean;
  user: UserSessionData | undefined;
}>()
const emit = defineEmits<{
  "update:settings": [value: UserSettings];
  "update:modelValue": [value: boolean];
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
  if (props.user?.settings) {
    settingsForm.value = props.user?.settings
  }
})
</script>
<template>
  <v-dialog :model-value="modelValue">
    <v-card class="mx-auto">
      <v-card-title>
        <v-icon icon="mdi-account-cog-outline"></v-icon> {{ $lang('header.preferences') }}
        <v-icon icon="mdi-close-circle-outline" color="red" class="float-right"
          @click="$emit('update:modelValue', false)"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="info"></v-divider>
      <v-card-text>
        <v-sheet class="ma-4 px-4">
          <v-alert v-if="isAlert" closable :text="$lang('header.success', ['settings'])" type="success"
            variant="tonal"></v-alert>
          <v-switch :label="$lang('header.input.toggleDark')" hide-details v-model="settingsForm.theme" true-value="dark"
            false-value="light" color="success"></v-switch>
          <v-switch :label="$lang('header.input.leftOff')" true-value="1" false-value="0" hide-details
            v-model="settingsForm.leftOff" color="success">
          </v-switch>
          <v-switch :label="$lang('header.input.userConnNotification')" hide-details
            v-model="settingsForm.muteConnectionNotif" true-value="1" false-value="0" color="success"></v-switch>
          <v-btn prepend-icon="mdi-content-save-cog" class="mt-3" color="#5865f2" @click="saveSettings" block
            variant="flat">{{
              $lang('header.button.saveSettings') }}</v-btn>
        </v-sheet>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>