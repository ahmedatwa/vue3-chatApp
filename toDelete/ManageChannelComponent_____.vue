<script setup lang="ts">
import { ref } from "vue";
import { DBUser } from "@/types/User.ts";
import { Channels } from "@/types/Channel.ts";

const channelTopic = ref("");

const dialog = ref(false);
const tab = ref(null);
const isLoading = ref(false);
const isAlert = ref(false);
//const selectedParticipants = ref<string[]>([]);
const tabs = ref([
{id: 1, value:"about", name: 'About'},
{id: 2, value:"members", name: 'Members'},
{id: 3, value:"settings", name: 'Settings'}
])

// Props
defineProps<{
    allUsers?: DBUser[] | undefined;
    channel: Channels | null
}>();

const emit = defineEmits<{
    "create:room": [value: string];
    "invite:channel:users": [value: string[]];
    "update:input:value": [value: string];
}>();


// const createRoom = () => {
//   isLoading.value = true;
//   emit("create:room", snakeCase(channelForm.value.name));
//   roomName.value = "";
//   isAlertVisible.value = true;
//   isLoading.value = false;
//   dialog.value = false;
// };

// const inviteUsers = async () => {
//   isLoading.value = true;
//   emit("invite:channel:users", selectedParticipants.value);
//   isAlertVisible.value = true;
//   isLoading.value = false;
//   dialog.value = false;
// };

// watch(dialog, (newVal) => {
//   if (newVal === false) {
//     roomName.value = "";
//     isAlertVisible.value = false;
//   }
// });

// watchEffect(() => {
//   if (props.participants) {
//     selectedParticipants.value = props.participants;
//   }
// });

// const test = computed(() => {
//   const participants: {_uuid: string, username: string, image: string}[] = [];
//   for (const key in props.participants) {
//     props.allUsers?.find((e) => {
//       if(props.participants)
//       if(e._uuid === props.participants[key]) {
//         participants.push(e);
//       }
//     })
//   }
//  return participants
// })
</script>
<template>
  <!-- Room Form -->
  <v-dialog v-model="dialog" width="auto" activator="parent">
    <v-card width="450" class="ma-4">
      <v-card-title>
        {{ channel?.name }}
        <v-icon
          class="float-right"
          @click="dialog = false"
          icon="mdi-close-circle-outline"
        ></v-icon>
      </v-card-title>
      <v-alert
        text="Changes Saved."
        type="success"
        variant="tonal"
        v-if="isAlert"
      ></v-alert>
      <v-tabs v-model="tab" color="deep-purple-accent-4" align-tabs="center">
        <v-tab v-for="t in tabs" :key="t.id" :value="t.value">{{ t.name }}</v-tab>
      </v-tabs>
      <v-window v-model="tab" class="ma-4">
        <v-window-item value="about">
          <v-form @submit.prevent="" class="ma-2" name="create-room">
            <v-text-field
              label="Channel Name"
              :value="channelName"
              disabled
              prepend-inner-icon="mdi-forum"
            >
            </v-text-field>
            <v-text-field
              label="Channel Topic"
              v-model="channelTopic"
              clearable
              prepend-inner-icon="mdi-information-outline"
              :loading="isLoading"
            >
            </v-text-field>
            <v-text-field
              label="Channel Managed By"
              disabled
              prepend-inner-icon="mdi-account-switch"
            >
            </v-text-field>
            <v-text-field
              label="Channel Created By"
              disabled
              prepend-inner-icon="mdi-account-key"
            >
            </v-text-field>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn color="error" variant="tonal" prepend-icon="mdi-exit-run"
                >Leave Channel</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-window-item>
        <v-window-item value="memebers"></v-window-item>
        <v-window-item value="settings"></v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>
