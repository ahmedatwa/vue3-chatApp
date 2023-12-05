<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore, useDirectMessageStore } from "@/stores";
import { capitalize } from "@/helpers";
import type { User } from "@/types/User";

const searchTerm = ref("");
const userStore = useUserStore();
const directMessageStore = useDirectMessageStore();

const searchItemes = ref<any[]>([]);

onMounted(async () => {
  const [users] = await Promise.all([userStore.getAllUsers()]);
  if (users?.data) {
    const map2 = users?.data.map(
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
              userName: user.userName,
              firstName: user.firstName,
              lastName: user.lastName,
              displayName: capitalize(user.firstName + " " + user.lastName),
              email: user.email,
              image: user.image,
              messagesDistributed: false,
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
