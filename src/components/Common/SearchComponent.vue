<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { SearchUsers } from "@/types/Chat"

const searchTerm = ref("");

defineProps<{
  searchUsers: SearchUsers[];
}>();

const emit = defineEmits<{
  "update:searchValue": [value: string];
}>()

const onSelect = (e: string) => {
  emit('update:searchValue', e)
  nextTick(() => {
    searchTerm.value = ""
  })
}
</script>
<template>
  <v-autocomplete :label="$lang('header.searchLabel')" item-title="displayName" item-value="_uuid"
    prepend-inner-icon="mdi-magnify" v-model="searchTerm" :items="searchUsers" variant="underlined" hide-details
    hide-selected @update:model-value="onSelect">
  </v-autocomplete>
</template>
