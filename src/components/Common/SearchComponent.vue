<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useUserStore, useDirectMessageStore } from "@/stores";
import { capitalize } from "@/helpers";
import type { User } from "@/types/User";

const searchTerm = ref("");
const userStore = useUserStore();
const directMessageStore = useDirectMessageStore();
const searchItemes = ref<any[]>([]);

watchEffect(async () => {
  const users = userStore.allUsers
  if (users) {
    const map2 = users.map(
      (res: { _uuid: string; firstName: string; lastName: string }) => {
        return {
          _id: res._uuid,
          name: capitalize(res.firstName + " " + res.lastName),
        };
      }
    );
    searchItemes.value.push(...map2);
  }
});

const onSelect = async () => {
  if (searchTerm.value) {
    const found = directMessageStore.users.find(
      (u) => u._uuid === searchTerm.value
    );

    if (found === undefined) {
      const response = await userStore.getUser(searchTerm.value);
      if (response?.status === 200 && response?.data) {
        response.data.forEach((user: User) => {
          if (user._uuid === searchTerm.value) {
            directMessageStore.users.push({
              _id: user._id,
              _uuid: user._uuid,
              _channelID: null,
              firstName: user.firstName,
              lastName: user.lastName,
              displayName: user.displayName,
              visible: true,
              email: user.email,
              image: user.image,
              messagesDistributed: true,
              connected: user.connected === "1" ? true : false,
              self: false,
              messages:
                directMessageStore.messagesPerUser.get(searchTerm.value) || [],
              createdAt: user.createdAt,
            });
            return;
          }
        });

        searchTerm.value = "";
      }
    } else {
      return;
    }
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
    :items="searchItemes"
    variant="underlined"
    hide-details
    hide-selected
    @update:model-value="onSelect"
  >
  </v-autocomplete>
</template>
