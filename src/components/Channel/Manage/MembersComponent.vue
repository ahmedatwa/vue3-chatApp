<script setup lang="ts">
import { onMounted, ref, inject } from "vue";
// types
import type { SearchUsers } from "@/types/Chat"
import type { UserSessionData } from "@/types/User";
import type { Channels } from "@/types/Channel";

const selectedMembers = ref<SearchUsers | null>(null);
const removedMembers = ref<SearchUsers[]>([]);
const channelMemebers = ref<SearchUsers[]>([]);
const currentUser = inject<UserSessionData>("user");
const isSaveDisabled = ref(true);
const isError = ref(false);
const saveType = ref({
  isAdd: false,
  isRemove: false,
});

const isLoading = ref(false)

// props
const props = defineProps<{
  channel?: Channels | null;
  searchUsers?: SearchUsers[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:channelMembers": [
    { add: SearchUsers[]; remove: SearchUsers[] }
  ];
}>();

onMounted(() => {
  if (props.channel?.members) {
    props.channel.members.forEach((member) => {
      channelMemebers.value.push({
        _uuid: member._uuid,
        displayName: member.displayName,
        email: member.email,
        createdAt: member.createdAt
      })
    })
  }

});

const addMemebers = () => {
  if (selectedMembers.value) {
    isError.value = false;
    const found = channelMemebers.value?.find((user) => {
      return user._uuid === selectedMembers.value?._uuid;
    });

    if (!found) {
      channelMemebers.value?.push(selectedMembers.value);
      selectedMembers.value = null;
      isSaveDisabled.value = false;
      saveType.value.isAdd = true;
    } else {
      isError.value = true;
      selectedMembers.value = null;
    }
  }
};

const save = () => {
  emit("update:channelMembers", {
    add: channelMemebers.value,
    remove: removedMembers.value,
  });
  removedMembers.value = [];
};

const removeMember = (index: number, member: SearchUsers) => {
  const found = removedMembers.value.find((m) => m._uuid === member._uuid);
  if (!found) {
    removedMembers.value.push({ ...member });
  }

  channelMemebers.value?.splice(index, 1);
  isSaveDisabled.value = false;
  saveType.value.isRemove = true;
};
</script>

<template>
  <v-card width="auto">
    <v-combobox placeholder="Search Users" :items="searchUsers" item-title="displayName" prepend-inner-icon="mdi-magnify"
      id="add-channel-users" density="comfortable" variant="solo" v-model="selectedMembers" label="Select" autofocus
      :loading="isLoading" :error-messages="isError ? $lang('channel.error.memberExists') : ''" clearable>
      <template #append>
        <v-btn icon="mdi-plus-circle" variant="text" color="indigo" @click.prevent="addMemebers"
          :disabled="selectedMembers === null"></v-btn>
      </template>
    </v-combobox>
    <v-list>
      <v-slide-x-transition tag="v-list" group>
        <v-list-item v-for="(member, index) in channelMemebers" :key="member._uuid">
          <template #prepend>
            <v-btn color="red" :disabled="member._uuid === currentUser?._uuid" icon="mdi-close" variant="text"
              @click="removeMember(index, member)" :key="member._uuid"></v-btn>
          </template>
          <v-list-item-title>{{ member.displayName }}</v-list-item-title>
        </v-list-item>
      </v-slide-x-transition>
    </v-list> 
      <v-btn color="indigo" @click.prevent="save" :disabled="isSaveDisabled" :loading="isLoading"
        prepend-icon="mdi-content-save-check" class="mt-4" block>{{ $lang("chat.button.save") }}</v-btn>
  </v-card>
</template>
