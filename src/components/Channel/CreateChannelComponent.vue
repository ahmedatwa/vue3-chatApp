<script setup lang="ts">
import { ref, computed, shallowRef, onMounted } from "vue"
import { reactive } from "vue"
import { ChannelMembersComponent } from "@/components/Channel"

import { writeClipboard } from "@/helpers";
import type { UserSessionData } from "@/types/User"
import type { Channels, ChannelForm, ChannelSettings } from "@/types/Channel";

// Channel
const channelForm: ChannelForm = reactive({
  channelName: "",
  channelTopic: "",
  channelDescription: "",
})

const isArchiveChannelDialog = ref(false)
const isLeaveChannelDialog = ref(false)
const dialog = shallowRef(false);
const channelTab = ref("about");
const channelSettings: ChannelSettings = reactive({
  muteNotifications: "none"
});
const isCopiedId = shallowRef(false);
const isCopiedEmails = shallowRef(false);
const isCopiedNames = shallowRef(false);
const isEditTopic = ref(false)
const isEditDesc = ref(false)

// Props
const props = defineProps<{
  channel?: Channels | null;
  title?: string;
  create?: boolean;
  currentUser?: UserSessionData | undefined
  isLoading?: boolean;
  members?: boolean;
}>();

// emits
const emit = defineEmits<{
  "on:createChannel": [value: ChannelForm];
  "on:updateChannel": [value: ChannelForm];
  "on:leaveChannel": [value: string];
  "on:archiveChannel": [value: string]
  "on:channelSettings": [value: { _channelID: string, _uuid: string, setting: ChannelSettings }]
}>();

// methods
const createChannel = () => {
  emit("on:createChannel", { ...channelForm });
  channelForm.channelName = ''
  channelForm.channelDescription = ""
  channelForm.channelTopic = ""
};

const dialogTitle = computed(() => {
  if (props.channel) {
    return "#" + props.channel.channelName;
  } else {
    return props.title;
  }
});

const archiveChannel = () => {
  if (props.channel)
    emit("on:archiveChannel", props.channel?._channelID)
};

const leaveChannel = () => {
  if (props.channel)
    emit("on:leaveChannel", props.channel?._channelID)
}
const copyChannelId = () => {
  if (props.channel)
    writeClipboard(props.channel._channelID)
  isCopiedId.value = true;
};

const copyChannelNames = () => {
  const names = props.channel?.members?.map(({ displayName }) => {
    return displayName;
  });
  if (names) {
    writeClipboard(names.join(","))
    isCopiedNames.value = true;
  }
};
const copyChannelEmails = () => {
  const emails = props.channel?.members?.map(({ email }) => {
    return email;
  });
  if (emails) writeClipboard(emails.join(","));
  isCopiedEmails.value = true;
};

onMounted(() => {
  if (props.channel) {
    channelForm.channelName = props.channel.channelName
    channelForm.channelTopic = props.channel.channelTopic
    channelForm.channelDescription = props.channel.channelDescription
    if (props.channel.settings) {
      channelSettings.muteNotifications = props.channel.settings.muteNotifications
    }
  }

  if (props.members) {
    channelTab.value = "members"
  }
})



const saveSettings = () => {
  if (props.channel && props.currentUser)
    emit("on:channelSettings", {
      _channelID: props.channel?._channelID,
      _uuid: props.currentUser?._uuid,
      setting: channelSettings,
    })
}


const updateChannel = (key: string) => {
  if (key === "topic") {
    isEditTopic.value = true
  } else {
    isEditDesc.value = true
  }
  emit("on:updateChannel", channelForm)
}




</script>
<template>
  <!-- Room Form -->
  <v-dialog v-model="dialog" width="auto" activator="parent" :key="channel?._id">
    <v-card width="450" class="ma-4" style="overflow: initial; z-index: initial" :loading="isLoading">
      <v-card-title>
        {{ dialogTitle }}
        <v-icon class="float-right" @click="dialog = false" icon="mdi-close-circle-outline" color="error"></v-icon>
      </v-card-title>
      <v-divider :thickness="3" color="error" class="mb-3"></v-divider>
      <v-tabs v-model="channelTab" color="deep-purple-accent-4" align-tabs="center">
        <v-tab key="about" value="about">{{ $lang("tab.about") }}</v-tab>
        <v-tab key="members" value="members" v-if="channel?.createdBy === currentUser?._uuid">
          {{ $lang("tab.members") }}</v-tab>
        <v-tab key="settings" value="settings" v-if="channel?.createdBy === currentUser?._uuid && !create">
          {{ $lang("tab.settings") }}</v-tab>
      </v-tabs>
      <v-window v-model="channelTab" class="ma-4">
        <!-- About -->
        <v-window-item value="about" key="about">
          <v-form class="ma-2" name="create-room">
            <v-text-field :label="$lang('input.channelName')" v-model="channelForm.channelName"
              :hint="$lang('help.channelName')" clearable prepend-inner-icon="mdi-forum" :disabled="!create">
            </v-text-field>
            <v-text-field :label="$lang('input.channelTopic')" v-model="channelForm.channelTopic" clearable
              prepend-inner-icon="mdi-information-outline">
              <template v-slot:append v-if="!create">
                <v-slide-x-reverse-transition mode="out-in">
                  <v-btn icon variant="text" :key="`topic-${isEditTopic}`"
                    :disabled="channelForm.channelTopic.length < 3">
                    <v-icon color="primary" :icon="isEditTopic ? 'mdi-check-all' : 'mdi-content-save-all'"
                      @click="updateChannel('topic')"></v-icon>
                  </v-btn>
                </v-slide-x-reverse-transition>
              </template>
            </v-text-field>
            <v-textarea :label="$lang('input.channelDescription')" v-model="channelForm.channelDescription" clearable
              prepend-inner-icon="mdi-information-outline" auto-grow>
              <template v-slot:append v-if="!create">
                <v-slide-x-reverse-transition mode="out-in">
                  <v-btn icon variant="text" :key="`desc-${isEditDesc}`"
                    :disabled="channelForm.channelDescription.length < 3">
                    <v-icon color="primary" :icon="isEditDesc ? 'mdi-check-all' : 'mdi-content-save-all'"
                      @click="updateChannel('desc')"></v-icon>
                  </v-btn>
                </v-slide-x-reverse-transition>
              </template>
            </v-textarea>
            <div v-if="create">
              <v-divider></v-divider>
              <v-btn block prepend-icon="mdi-database-plus" color="indigo" @click.prevent="createChannel"
                :disabled="channelForm.channelName.length < 3"> Create Channel</v-btn>
            </div>
          </v-form>
          <v-sheet v-if="!create">
            <v-text-field :label="$lang('channel.managedBy')" disabled prepend-inner-icon="mdi-account-switch"
              :model-value="currentUser?.displayName">
            </v-text-field>
            <v-text-field :label="$lang('channel.createdBy')" prepend-inner-icon="mdi-account-key" disabled
              :model-value="currentUser?.displayName"></v-text-field>
          </v-sheet>
        </v-window-item>
        <!-- Members -->
        <v-window-item value="members" key="members">
          <channel-members-component :channel="channel"></channel-members-component>
        </v-window-item>
        <v-window-item value="settings" key="settings">
          <v-sheet class="pa-2">
            <v-switch v-model="channelSettings.muteNotifications" color="success" :label="$lang('channel.muteChannel')"
              @update:model-value="saveSettings" true-value="none" false-value="all"></v-switch>
          </v-sheet>
          <v-divider class="my-2" color="blue" thickness="2"></v-divider>
          <v-btn block :prepend-icon="isCopiedNames ? 'mdi-check-all' : 'mdi-content-copy'" color="blue-grey-darken-1"
            @click="copyChannelNames" variant="tonal">{{ $lang("channel.copyMemberNames") }}</v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <v-btn block :prepend-icon="isCopiedEmails ? 'mdi-check-all' : 'mdi-content-copy'
            " color="blue-grey-darken-1" @click="copyChannelEmails" variant="tonal">
            {{ $lang("channel.copyMemberAddresses") }}</v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <!-- Archive Channel -->
          <v-btn prepend-icon="mdi-archive" color="blue-lighten-1"
            @click="isArchiveChannelDialog = !isArchiveChannelDialog" block>
            {{ $lang("channel.archiveChannel") }}
            <v-dialog v-model="isArchiveChannelDialog" key="archive-channel">
              <v-card prepend-icon="mdi-archive" :title="$lang('channel.archiveChannel')"
                :text="$lang('text.confirm', ['archive channel'])" width="400" class="mx-auto">
                <v-card-actions>
                  <v-btn color="red" prepend-icon="mdi-close" class="me-auto">{{ $lang('button.cancel') }}</v-btn>
                  <v-btn @click="archiveChannel" prepend-icon="mdi-check-circle-outline" color="indigo"
                    :loading="isLoading">{{ $lang("button.confirm") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <!-- Leave Channel -->
          <v-btn color="red-darken-1" prepend-icon="mdi-exit-run" @click="isLeaveChannelDialog = !isLeaveChannelDialog"
            block>
            {{ $lang("channel.leaveChannel") }}
            <v-dialog v-model:model-value="isLeaveChannelDialog" key="leave-channel">
              <v-card prepend-icon="mdi-exit-run" :title="$lang('channel.leaveChannel')"
                :text="$lang('text.confirm', ['leave channel'])" width="400" class="mx-auto">
                <v-card-actions>
                  <v-btn color="red" prepend-icon="mdi-close" class="me-auto">{{ $lang('button.cancel') }}</v-btn>
                  <v-btn @click="leaveChannel" prepend-icon="mdi-check-circle-outline" color="indigo" block>{{
                    $lang("button.confirm") }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <v-sheet>
            {{ $lang("channel.ChannelID") }}: {{ channel?._channelID }}
            <v-btn density="compact" elevation="0" :icon="isCopiedId ? 'mdi-check-all' : 'mdi-content-copy'"
              @click="copyChannelId" class="ms-3" size="small">
            </v-btn>
          </v-sheet>
        </v-window-item>
      </v-window>
    </v-card>
  </v-dialog>
</template>
<style scoped>
.members-list {
  overflow-y: scroll;
  border: 1px #eee solid;
  max-height: 300px;
  padding: 1px;
}
</style>