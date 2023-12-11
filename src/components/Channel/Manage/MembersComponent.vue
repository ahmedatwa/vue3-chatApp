<script setup lang="ts">
import { onMounted, ref, inject } from "vue";
import type { UserSessionData, User } from "@/types/User";
import type { ChannelMembers, Channels } from "@/types/Channel";
import { capitalize} from "@/helpers"

import { useUserStore } from "@/stores";

const userStore = useUserStore();
const selectedMembers = ref<ChannelMembers | null>(null);
const removedMembers = ref<ChannelMembers[]>([]);
const channelMemebers = ref<ChannelMembers[]>([]);
const currentUser = inject<UserSessionData>("user");
const isSaveDisabled = ref(true);
const isError = ref(false);
const saveType = ref({
  isAdd: false,
  isRemove: false,
});
const allUsers = ref<ChannelMembers[]>([]);
const isLoading = ref(false)

// props
const props = defineProps<{
  channel?: Channels | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  "update:channelMembers": [
    { add: ChannelMembers[]; remove: ChannelMembers[] }
  ];
}>();

onMounted(async () => {
  if (props.channel?.members) {
    channelMemebers.value = props.channel.members;
  }
  isLoading.value = true
  await userStore.getAllUsers().then((response) => {
    if (response?.status === 200) {      
      allUsers.value = response.data?.map((user: User) => {
        return {
          _uuid: user._uuid,
          displayName: capitalize(user.firstName + ' ' + user.lastName),
          email: user.email,
        };
      });
      isLoading.value = false
      return allUsers.value
    }
  });
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

const removeMember = (index: number, member: ChannelMembers) => {
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
  <v-combobox
    placeholder="Search Users"
    :items="allUsers"
    item-title="displayName"
    prepend-inner-icon="mdi-magnify"
    id="add-channel-users"
    density="comfortable"
    variant="solo"
    v-model="selectedMembers"
    label="Select"
    autofocus
    :loading="isLoading"
    :error-messages="isError ? $lang('channel.error.memberExists') : ''"
  >
    <template #append>
      <v-btn
        icon="mdi-plus-circle"
        variant="plain"
        color="indigo"
        @click.prevent="addMemebers"
        :disabled="selectedMembers === null"
      ></v-btn>
    </template>
  </v-combobox>
  <div
    rounded="rounded"
    class="mx-auto members-list p-2 rounded"
    height="20"
    width="auto"
  >
    <ul>
      <v-slide-x-transition tag="li" group>
        <li v-for="(member, index) in channelMemebers" :key="member._uuid">
          <v-btn
            color="red"
            :disabled="member._uuid === currentUser?._uuid"
            icon="mdi-close"
            variant="text"
            @click="removeMember(index, member)"
            :key="member._uuid"
          ></v-btn>
          {{ member.displayName }}
        </li>
      </v-slide-x-transition>
    </ul>
  </div>
  <v-btn
    color="indigo"
    @click.prevent="save"
    :disabled="isSaveDisabled"
    :loading="isLoading"
    prepend-icon="mdi-content-save-check"
    block
    >{{ $lang("chat.button.save") }}</v-btn
  >
</template>
