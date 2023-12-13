<script setup lang="ts">
import { shallowRef } from "vue";
import { useUserStore, useDirectMessageStore } from "@/stores";
import type { User, SearchUsers } from "@/types/User";

const searchTerm = shallowRef("");
const userStore = useUserStore();
const directMessageStore = useDirectMessageStore();

defineProps<{
  searchUsers: SearchUsers[];
}>();


const onSelect = async () => {
  if (searchTerm.value) {
    const found = directMessageStore.users.find(
      (u) => u._uuid === searchTerm.value
    );

    if (found === undefined) {
      await userStore.updateUserSettings(searchTerm.value, null, true);
      if (userStore.allUsers) {
        userStore.allUsers.forEach((user: User) => {
          if (user._uuid === searchTerm.value) {
            directMessageStore.users.push({
              ...user,
            });
            return;
          }
        });
      }
    } else {
      found.visible = true;
      await userStore.updateUserSettings(searchTerm.value, null, true);
    }
    searchTerm.value = "";
  }
};
</script>
<template>
  <v-autocomplete
    :label="$lang('header.searchLabel')"
    item-title="displayName"
    item-value="_uuid"
    prepend-inner-icon="mdi-magnify"
    v-model="searchTerm"
    :items="searchUsers"
    variant="underlined"
    hide-details
    hide-selected
    @update:model-value="onSelect"
  >
  </v-autocomplete>
</template>
