<script setup lang="ts">

defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

</script>
<template>
  <v-text-field label="Search..." prepend-inner-icon="mdi-magnify" :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)" variant="underlined"></v-text-field>
</template>
