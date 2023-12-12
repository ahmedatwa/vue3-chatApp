<script setup lang="ts">
import { shallowRef, watchEffect } from "vue";
import { useUserStore, useDirectMessageStore } from "@/stores";
import type { User } from "@/types/User";

const searchTerm = shallowRef("");
const userStore = useUserStore();
const directMessageStore = useDirectMessageStore();
const searchUsers = shallowRef<{ _id: string; name: string }[]>([]);

const props = defineProps<{
  allUsers: User[];
}>();

watchEffect(async () => {
  if (props.allUsers.length > 1) {
    searchUsers.value = props.allUsers.map(({ _uuid, displayName }) => {
      return {
        _id: _uuid,
        name: displayName,
      };
    });
  }
});

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
    item-title="name"
    item-value="_id"
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
