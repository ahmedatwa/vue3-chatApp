<script setup lang="ts">
import type { Snackbar } from "@/types/Chat";

defineProps<{
  isLoading: boolean;
  isError?: boolean;
  error: Snackbar | null;
}>();

const emit = defineEmits<{
  "exit:app": [value: boolean];
  "restore:session": [value: boolean];
}>();

</script>
<template>
  <v-overlay :model-value="isLoading" v-if="isLoading" class="align-center justify-center">
    <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
  </v-overlay>
  <v-overlay contained :model-value="error.isSnackbar" v-if="error" class="align-center justify-center" persistent>
    <div class="my-4">
      <p class="font-weight-medium d-inline">
        <v-icon icon="mdi-alert-circle" class=""></v-icon>
      <p class="d-inline" v-if="error.title"> {{ error.title }}</p>
      {{ error.code }}
      </p>
      <p class="font-weight-medium">{{ error.text }}</p>
    </div>
    <v-btn color="error" class="me-2" prepend-icon="mdi-exit-to-app" variant="tonal" @click="$emit('exit:app', true)">
      {{ $lang("chat.button.exit") }}</v-btn>
    <v-btn color="blue-darken-3" prepend-icon="mdi-restore-alert" variant="tonal" @click="$emit('restore:session', true)">
      {{ $lang("chat.button.restore") }}</v-btn>
  </v-overlay>
</template>
