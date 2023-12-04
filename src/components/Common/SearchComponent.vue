<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores";

const searchTerm = ref("");
const userStore = useUserStore();

const searchItemes = ref<any[]>([]);

onMounted(() => {
  let users = [];
  
  if (userStore.allUsers) {
    users = userStore.allUsers?.map(({ _uuid, displayName, email }) => {
      return {
        _uuid: _uuid,
        name: displayName,
        email: email,
      };
    });
    searchItemes.value.push(...users);
  }

  // channels
  //let channels = []
  const response = userStore.getAllChannels()
  console.log(response);
  

});
</script>
<template>
  <v-combobox
    label="Search..."
    item-title="name"
    prepend-inner-icon="mdi-magnify"
    v-model="searchTerm"
    :items="searchItemes"
    variant="underlined"
    class="mt-5"
  ></v-combobox>
</template>
