<script setup lang="ts">
import { computed, onMounted, ref, inject } from "vue"
import { capitalize } from "@/helpers";
import type { UserSessionData } from "@/types/User"
import type { ChannelMembers, Channels } from "@/types/Channel";
import { useUserStore } from "@/stores";

const userStore = useUserStore()
const selectedMembers = ref<ChannelMembers | null>(null);
const channelMemebers = ref<ChannelMembers[] | undefined>([])
const isError = ref(false)
const currentUser = inject<UserSessionData>("user")

const props = defineProps<{
  channel?: Channels | null;
}>()

const emit = defineEmits<{
  "on:removeMember": [value: string];
  "on:addMembers": [value: ChannelMembers[]];

}>()

onMounted(() => {
  if (props.channel) {
    channelMemebers.value = props.channel.members
  }
})

const allUsers = computed(() => {
  if (userStore.allUsers) {
    return userStore.allUsers?.map(({ _uuid, firstName, lastName, email }) => {
      return {
        _uuid: _uuid,
        displayName: capitalize(firstName + " " + lastName),
        email: email,
      };
    });
  }
});


const addMemebers = () => {
  if (selectedMembers.value) {
    isError.value = false
    if (channelMemebers.value) {
      const found = channelMemebers.value.find((user) => {
        return user._uuid === selectedMembers.value?._uuid
      })

      if (!found) {
        channelMemebers.value.push(selectedMembers.value)
        selectedMembers.value = null
      } else {
        isError.value = true
        selectedMembers.value = null
      }

    }
  }

}

const saveMembers = () => {
  if (channelMemebers.value)
    emit("on:addMembers", channelMemebers.value)
}

const removeMember = (index: number, _uuid: string) => {
  channelMemebers.value?.splice(index, 1)
  emit("on:removeMember", _uuid)
}

const isDidabled = computed(() => {
  return selectedMembers.value === null
})
</script>

<template>
  <v-combobox placeholder="Search Users" :items="allUsers" item-title="displayName" prepend-inner-icon="mdi-magnify"
    id="add-channel-users" density="comfortable" variant="solo" v-model="selectedMembers" label="Select" autofocus
    :error-messages="isError ? $lang('channel.error.memberExists') : ''">
    <template #append>
      <v-btn icon="mdi-plus-circle" variant="plain" color="indigo" @click.prevent="addMemebers"
        :disabled="isDidabled"></v-btn>
    </template>
  </v-combobox>
  <div rounded="rounded" class="mx-auto members-list p-2 rounded" height="20" width="auto">
    <ul>
      <v-slide-x-transition tag="ul" group>
        <li v-for="(member, index) in channelMemebers" :key="member._uuid">
          <v-btn color="red" :disabled="member._uuid === currentUser?._uuid" icon="mdi-close" variant="text"
            @click="removeMember(index, member._uuid)" :key="member._uuid"></v-btn> {{ member.displayName }}
        </li>
      </v-slide-x-transition>
    </ul>
  </div>
  <v-btn color="indigo" @click.prevent="saveMembers" prepend-icon="mdi-content-save-check" block>{{ $lang('button.save')
  }}</v-btn>
</template>