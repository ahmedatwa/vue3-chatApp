<script setup lang="ts">
import type { Snackbar } from "@/types";

defineProps<{
  alert: Snackbar | null;
  modelValue: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>
<template>
  <v-sheet class="d-flex flex-column" v-if="alert">
    <v-snackbar closable :timeout="alert.timeout ? alert.timeout : 4000" :color="alert?.type ? alert?.type : 'info'"
      :model-value="modelValue" location="top end" multi-line variant="elevated" transition="scroll-y-transition"
      @update:model-value="$emit('update:modelValue', $event)">
      <v-sheet v-if="alert.title" color="transparent">
        <h4 class="font-weight-bold">
          <!-- <v-icon :icon="alert.type === 'error' ? 'mdi-alert-octagon' : 'mdi-alert-circle-check-outline'"></v-icon> -->
          {{ alert.title }}
        </h4>
      </v-sheet>
      <v-sheet color="transparent" class="d-inline">
          <v-icon :icon="alert.type === 'error' ? 'mdi-alert-octagon' : 'mdi-alert-circle-check-outline'"></v-icon>
          <span v-if="alert.code" class="me-2">{{ alert.code }}: </span>
          {{ alert?.text }}
      </v-sheet>
      <template v-slot:actions>
        <v-btn color="blue-grey-darken-3" variant="text" @click="$emit('update:modelValue', false)">{{
          $lang("chat.button.close") }}
        </v-btn>
      </template>
    </v-snackbar>
  </v-sheet>
</template>
