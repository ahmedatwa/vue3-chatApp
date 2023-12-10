<script setup lang="ts">
import { computed } from "vue";
import type { Snackbar } from "@/types";

const props = defineProps<{
  isLoading: boolean;
  isError: boolean;
  error: Snackbar | null;
}>();

const emit = defineEmits<{
  "exit:app": [value: boolean];
  "restore:session": [value: boolean];
  "update:loading": [value: boolean];
  "update:error": [value: boolean];
}>();

const loadingValue = computed({
  get() {
    return props.isLoading;
  },
  set(value) {
    emit("update:loading", value);
  },
});

const errorValue = computed({
  get() {
    return props.isError;
  },
  set(value) {
    emit("update:error", value);
  },
});
</script>
<template>
  <v-overlay
    v-model="loadingValue"
    v-if="isLoading"
    class="align-center justify-center"
  >
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    ></v-progress-circular>
  </v-overlay>
  <v-overlay
    v-model="errorValue"
    contained
    v-if="error"
    class="align-center justify-center"
    persistent
  >
    <div class="my-4">
      <p class="font-weight-medium">
        <v-icon icon="mdi-alert-circle"></v-icon> {{ error.code }}:
      </p>
      <p class="font-weight-medium">{{ error.text }}</p>
    </div>
    <v-btn
      color="error"
      class="me-2"
      prepend-icon="mdi-exit-to-app"
      variant="tonal"
      @click="$emit('exit:app', true)"
    >
      {{ $lang("button.exit") }}</v-btn
    >
    <v-btn
      color="blue-darken-3"
      prepend-icon="mdi-restore-alert"
      variant="tonal"
      @click="$emit('restore:session', true)"
    >
      {{ $lang("button.restore") }}</v-btn
    >
  </v-overlay>
</template>
