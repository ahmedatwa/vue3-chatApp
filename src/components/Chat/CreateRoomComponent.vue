<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";
import { snakeCase, capitalize } from "lodash";
import { DBUser } from "@/types";

const roomName = ref("");
const dialog = ref(false);
const isLoading = ref(false);
const isAlertVisible = ref(false);
const selectedParticipants = ref<string[]>([]);

const props = defineProps<{
  allUsers?: DBUser[] | undefined;
  participants?: string[];
  channelName?: string | null;
  currentUser?: string | undefined;
  icon: string;
  color: string;
  title: string;
  subTitle?: string;
}>();

const emit = defineEmits<{
  "create:room": [value: string];
  "invite:channel:users": [value: string[]];
  "update:input:value": [value: string];
}>();

const createRoom = () => {
  isLoading.value = true;
  emit("create:room", snakeCase(roomName.value));
  roomName.value = "";
  isAlertVisible.value = true;
  isLoading.value = false;
};

const inviteUsers = async () => {
  isLoading.value = true;
  emit("invite:channel:users", selectedParticipants.value);
  isAlertVisible.value = true;
  isLoading.value = false;
};

watch(dialog, (newVal) => {
  if (newVal === false) {
    roomName.value = "";
    isAlertVisible.value = false;
  }
});

watchEffect(() => {
  if (props.participants) {
    selectedParticipants.value = props.participants;
  }
});
</script>
<template>
  <v-tooltip :text="title" location="top">
    <template v-slot:activator="{ props }">
      <v-btn
        :color="color"
        variant="text"
        :icon="icon"
        @click="dialog = true"
        v-bind="props"
      ></v-btn>
    </template>
  </v-tooltip>
  <!-- Room Form -->
  <v-dialog v-model="dialog" width="auto">
    <v-card width="350" class="ma-4">
      <v-card-title>
        {{ title }}
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
        v-if="isAlertVisible"
      ></v-alert>
      <v-form @submit.prevent="createRoom" class="ma-2" name="create-room">
        <v-text-field
          label="Channel Name"
          v-model="roomName"
          hint="only '_|#|&' allowed"
          v-if="!channelName"
          clearable
          prepend-inner-icon="mdi-forum"
          :loading="isLoading"
        >
      </v-text-field>
        <slot name="create-room" :inputValue="roomName"></slot>
      </v-form>
      <v-list-subheader v-if="subTitle">{{ subTitle }}</v-list-subheader>
      <v-form @submit.prevent="inviteUsers" class="ma-2" name="invite-users">
        <v-virtual-scroll :height="250" :items="allUsers" v-if="allUsers">
          <template v-slot:default="{ item }">
            <v-list-item>
              <v-checkbox
                :label="capitalize(item.username)"
                :value="item._uuid"
                v-model="selectedParticipants"
                hide-details="auto"
              ></v-checkbox>
            </v-list-item>
          </template>
        </v-virtual-scroll>
        <slot name="invite-user"></slot>
      </v-form>
    </v-card>
  </v-dialog>
</template>
