<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Settings } from "@/types";

const isLoading = ref(false);
const isAlertVisible = ref(false);
const settingDialog = ref(false);

// Settings
const isDark = ref(false);
const connectionNotif = ref(false);

const props = defineProps<{
  setting: Settings | string;
}>();

const emit = defineEmits<{
  "on:update:settings": [value: Settings];
}>();

const saveSettings = async () => {
  isLoading.value = true;
  const darkValue = isDark.value === false
    ? "light"
    : "dark";
  emit("on:update:settings", {
    theme: darkValue,
    connectionNotif: connectionNotif.value,
  })
  isAlertVisible.value = true;
  isLoading.value = false
};


onMounted(() => {  
  if (typeof props.setting === "object") {
    isDark.value = props.setting?.theme === "dark" ? true : false;
    if (props.setting?.connectionNotif) {
      connectionNotif.value = props.setting.connectionNotif
    }
  }
  isAlertVisible.value = false;
});

</script>
<template>
  <v-dialog v-model="settingDialog" activator="parent" width="auto" transition="dialog-top-transition" class="ma-4">
    <v-card :loading="isLoading">
      <v-card-title>
        Preferences
        <v-icon class="float-right" @click="settingDialog = false" icon="mdi-close-circle-outline"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="info"></v-divider>
      <!-- Alert -->
      <v-alert text="Changes Saved." type="success" variant="tonal" v-if="isAlertVisible"></v-alert>
      <v-form @submit.prevent="saveSettings">
        <v-list>
          <v-list-item>
            <v-list-item-title>
              <v-checkbox label="Toggle Dark" v-model="isDark" hint="Toggle Dark Mode"></v-checkbox>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <v-checkbox label="On/Off User Connection Notification" v-model="connectionNotif"
                hint="Receive alert when user gets connected or disconnected"></v-checkbox>
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-sheet class="ma-3 float-right">
          <v-btn type="submit" prepend-icon="mdi-content-save-cog" color="indigo">Save</v-btn>
        </v-sheet>
      </v-form>
    </v-card>
  </v-dialog>
</template>