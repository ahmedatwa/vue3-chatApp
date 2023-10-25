<script setup lang="ts">
defineProps({
  term: {
    type: String,
    required: false,
    default: "",
  },
});
const emit = defineEmits<{
  "update:term": [value: string];
}>();

const onInput = (event: Event) => {
  emit("update:term", (event.target as HTMLInputElement).value);
};
</script>
<template>
  <v-text-field
    label="Search..."
    prepend-inner-icon="mdi-magnify"
    :value="term"
    variant="solo"
    @input="onInput"
  ></v-text-field>
</template>
