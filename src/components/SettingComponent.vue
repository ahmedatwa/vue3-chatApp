<script setup lang="ts">
import { ref, watch, reactive, onMounted } from "vue";
import { Settings } from "@/types";

const isLoading = ref(false);
const isVisible = ref(false);
const isAlertVisible = ref(false);

interface Props {
  visible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  //"update:visible": [value: boolean];
  "on:update:settings": [value: Settings];
}>();

watch(
  () => props.visible,
  () => isVisible.value = props.visible
)
// settings
interface Setting {
  isDark: boolean;
  connectionNotif: boolean;
}

const setting: Setting = reactive({ isDark: false, connectionNotif: true });

const saveSettings = () => {
  isLoading.value = true;
  const darkValue = setting.isDark === false
    ? "light"
    : "dark";
  emit("on:update:settings", {
    theme: darkValue,
    connectionNotif: setting.connectionNotif,
  })
  isAlertVisible.value = true;
  isLoading.value = false
};

onMounted(() => {
  const $setting = localStorage.getItem("APPUSSTIG");
  if ($setting) {
    let $s = JSON.parse($setting);
    setting.isDark = $s.theme === "dark" ? true : false;
    setting.connectionNotif = $s.connectionNotif === true ? true : false;
  }
  isAlertVisible.value = false;
});
</script>
<template>
  <v-dialog v-model="isVisible" width="auto" transition="dialog-top-transition" class="ma-4">
    <v-card :loading="isLoading">
      <v-card-title>
        Preferences
        <v-icon class="float-right" @click="isVisible = false" icon="mdi-close-circle-outline"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="info"></v-divider>
      <!-- Alert -->
      <v-alert text="Changes Saved." type="success" variant="tonal" v-if="isAlertVisible"></v-alert>
      <v-form @submit.prevent="saveSettings">
        <v-list>
          <v-list-item>
            <v-list-item-title>
              <v-checkbox label="Toggle Dark" v-model="setting.isDark" hide-details></v-checkbox>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <v-checkbox label="On/Off User Connection Notification" v-model="setting.connectionNotif"
                hide-details></v-checkbox>
            </v-list-item-title>
          </v-list-item>
        </v-list>
        <v-sheet class="ma-3 float-right">
          <v-btn type="submit" prepend-icon="mdi-content-save-cog">Save</v-btn>
        </v-sheet>
      </v-form>
    </v-card>
  </v-dialog>
</template>