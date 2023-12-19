<script setup lang="ts">
defineProps<{
  isMarkdown?: boolean;
  formatting: string[];
  alignment: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:formatting": [value: string[]];
  "update:alignment": [value: string];
}>();
</script>

<template>
  <!-- <v-sheet class="d-inline ms-4">
    <v-icon
      icon="mdi-format-header-pound"
      @click="isActive = !isActive"
    ></v-icon>
  </v-sheet> -->
  <v-expand-transition>
    <v-sheet class="d-inline mb-2 ms-2" v-if="isMarkdown">
      <v-btn-toggle
        :model-value="formatting"
        @update:model-value="$emit('update:formatting', $event)"
        multiple
        variant="outlined"
        divided
        density="comfortable"
      >
        <v-btn icon="mdi-format-italic" value="italic"></v-btn>
        <v-btn icon="mdi-format-bold" value="bold"></v-btn>
        <v-btn icon="mdi-format-underline" value="underline"></v-btn>
      </v-btn-toggle>

      <v-btn-toggle
        :model-value="alignment"
        @update:model-value="$emit('update:alignment', $event)"
        variant="outlined"
        divided
        class="ms-3"
        density="comfortable"
      >
        <v-btn icon="mdi-format-align-center" value="center"></v-btn>
        <v-btn icon="mdi-format-align-left" value="left"></v-btn>
        <v-btn icon="mdi-format-align-right" value="right"></v-btn>
      </v-btn-toggle>
    </v-sheet>
  </v-expand-transition>
</template>
<style scoped>
.markdown {
  position: absolute;
  float: right;
}
</style>
