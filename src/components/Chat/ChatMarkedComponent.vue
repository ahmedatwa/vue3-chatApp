<script setup lang="ts">
import { shallowRef } from "vue"

const formatting = shallowRef<string[] | null>(null);
const isMarkDown = shallowRef(false);

defineProps<{
  formatting?: string[] | null;
  alignment?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:formatting": [value: string[] | null];
  "update:alignment": [value: string];
}>();


</script>

<template>
  <v-btn @click.stop="isMarkDown = !isMarkDown" icon density="compact">
    <v-icon icon="mdi-format-header-pound"></v-icon>
  </v-btn>
  <v-expand-transition>
    <v-sheet class="d-inline mb-2 ms-2" v-if="isMarkDown">
      <v-btn-toggle variant="outlined" density="comfortable" divided multiple v-model="formatting"
        @update:model-value="$emit('update:formatting', $event)">
        <v-btn icon="mdi-format-italic" value="italic"></v-btn>
        <v-btn icon="mdi-format-bold" value="bold"></v-btn>
        <v-btn icon="mdi-format-underline" value="underline"></v-btn>
      </v-btn-toggle>

      <v-btn-toggle :model-value="alignment" @update:model-value="$emit('update:alignment', $event)" variant="outlined"
        divided class="ms-3" density="comfortable">
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
