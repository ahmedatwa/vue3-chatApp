<script setup lang="ts">
defineProps<{
  term?: string;
}>();

const emit = defineEmits<{
  "update:term": [value: string];
}>();

</script>
<template>
  <v-text-field
    label="Search..."
    clearable
    prepend-inner-icon="mdi-magnify"
    :value="term"
    variant="underlined"
    @input="$emit('update:term', ($event.target as HTMLInputElement).value)"
  ></v-text-field>
</template>
