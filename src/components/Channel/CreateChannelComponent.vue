<script setup lang="ts">
import { ref, computed, shallowRef } from "vue";
import { onMounted, inject, reactive } from "vue";
import { MembersComponent, SettingComponent } from "@/components/Channel";
import type { UserSessionData } from "@/types/User";
import type { ChannelMembers, ChannelSettings } from "@/types/Channel";
import type { Channels, ChannelForm } from "@/types/Channel";

const currentUser = inject<UserSessionData>("user");
// Channel
const channelForm: ChannelForm = reactive({
  channelName: "",
  channelTopic: "",
  channelDescription: "",
});

const dialog = shallowRef(false);
const channelTab = ref("about");
const isEditTopic = ref(false);
const isEditDesc = ref(false);

// Props
const props = defineProps<{
  channel?: Channels | null;
  title?: string;
  create?: boolean;
  isLoading?: boolean;
  members?: boolean;
}>();

// emits
const emit = defineEmits<{
  createChannel: [value: ChannelForm];
  updateChannel: [value: ChannelForm];
  "update:channelMembers": [
    { add: ChannelMembers[]; remove: ChannelMembers[] }
  ];  // Settings
  archiveChannel: [value: { _channelID: string; name: string }];
  leaveChannel: [value: { _channelID: string; name: string }];
  "update:channelSettings": [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
}>();

// methods
const createChannel = () => {
  emit("createChannel", { ...channelForm });
  channelForm.channelName = "";
  channelForm.channelDescription = "";
  channelForm.channelTopic = "";
};

const dialogTitle = computed(() => {
  if (props.channel) {
    return "#" + props.channel.channelName;
  } else {
    return props.title;
  }
});

onMounted(() => {
  if (props.channel) {
    channelForm.channelName = props.channel.channelName;
    channelForm.channelTopic = props.channel.channelTopic;
    channelForm.channelDescription = props.channel.channelDescription;
  }

  if (props.members) {
    channelTab.value = "members";
  }
});

const updateChannel = (key: string) => {
  if (key === "topic") {
    isEditTopic.value = true;
  } else {
    isEditDesc.value = true;
  }
  emit("updateChannel", channelForm);
};
</script>
<template>
  <v-dialog v-model="dialog" width="auto" activator="parent" :key="channel?._id">
    <v-card width="450" class="ma-4" style="overflow: initial; z-index: initial" :loading="isLoading">
      <v-card-title>
        {{ dialogTitle }}
        <v-icon class="float-right" @click="dialog = false" icon="mdi-close-circle-outline" color="error"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="error" class="mb-3"></v-divider>
      <v-tabs v-model="channelTab" color="deep-purple-accent-4" align-tabs="center">
        <v-tab key="about" value="about">{{ $lang("channel.tab.about") }}</v-tab>
        <v-tab key="members" value="members" v-if="channel?.createdBy === currentUser?._uuid">
          {{ $lang("channel.tab.members") }}</v-tab>
        <v-tab key="settings" value="settings" v-if="!create">
          {{ $lang("channel.tab.settings") }}</v-tab>
      </v-tabs>
      <v-window v-model="channelTab" class="ma-4">
        <!-- About -->
        <v-window-item value="about" key="about">
          <v-form class="ma-2" name="create-room">
            <v-text-field :label="$lang('channel.input.name')" v-model="channelForm.channelName"
              :hint="$lang('help.name')" clearable prepend-inner-icon="mdi-forum" :disabled="!create">
            </v-text-field>
            <v-text-field :label="$lang('channel.input.topic')" v-model="channelForm.channelTopic" clearable
              prepend-inner-icon="mdi-information-outline">
              <template v-slot:append v-if="!create">
                <v-slide-x-reverse-transition mode="out-in">
                  <v-btn icon variant="text" :key="`topic-${isEditTopic}`"
                    :disabled="channelForm.channelTopic.length < 3">
                    <v-icon color="primary" :icon="isEditTopic ? 'mdi-check-all' : 'mdi-content-save-all'
                      " @click="updateChannel('topic')"></v-icon>
                  </v-btn>
                </v-slide-x-reverse-transition>
              </template>
            </v-text-field>
            <v-textarea :label="$lang('channel.input.description')" v-model="channelForm.channelDescription" clearable
              prepend-inner-icon="mdi-information-outline" auto-grow>
              <template v-slot:append v-if="!create">
                <v-slide-x-reverse-transition mode="out-in">
                  <v-btn icon variant="text" :key="`desc-${isEditDesc}`"
                    :disabled="channelForm.channelDescription.length < 3">
                    <v-icon color="primary" :icon="isEditDesc ? 'mdi-check-all' : 'mdi-content-save-all'
                      " @click="updateChannel('desc')"></v-icon>
                  </v-btn>
                </v-slide-x-reverse-transition>
              </template>
            </v-textarea>
            <div v-if="create">
              <v-divider></v-divider>
              <v-btn block prepend-icon="mdi-database-plus" color="indigo" @click.prevent="createChannel"
                :disabled="channelForm.channelName.length < 3" :loading="isLoading">
                {{ $lang("channel.channel.create") }}</v-btn>
            </div>
          </v-form>
          <v-sheet v-if="!create">
            <v-text-field :label="$lang('channel.managed')" disabled prepend-inner-icon="mdi-account-switch"
              :model-value="currentUser?.displayName">
            </v-text-field>
            <v-text-field :label="$lang('channel.created')" prepend-inner-icon="mdi-account-key" disabled
              :model-value="currentUser?.displayName"></v-text-field>
          </v-sheet>
        </v-window-item>
        <!-- Members -->
        <v-window-item value="members" key="members">
          <members-component :channel="channel" :is-loading="isLoading"
            @update:channel-members="$emit('update:channelMembers', $event)"></members-component>
        </v-window-item>
        <!-- Settings -->
        <v-window-item value="settings" key="settings">
          <setting-component :channel="channel" :is-loading="isLoading" @archive-channel="$emit('archiveChannel', $event)"
            @leave-channel="$emit('leaveChannel', $event)"
            @update:channel-settings="$emit('update:channelSettings', $event)"></setting-component>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>
