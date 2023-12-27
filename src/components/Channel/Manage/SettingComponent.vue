<script setup lang="ts">
import { ref, inject, reactive, onMounted } from "vue";
import { writeClipboard } from "@/helpers";
import type { Channels, ChannelSettings } from "@/types/Channel";
import type { UserSessionData } from "@/types/User";

const currentUser = inject<UserSessionData>("user");

const props = defineProps<{
  channel?: Channels | null;
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  archiveChannel: [value: { _channelID: string; name: string }];
  leaveChannel: [value: { _channelID: string; name: string }];
  "update:channelSettings": [
    value: { _channelID: string; _uuid: string; setting: ChannelSettings }
  ];
}>();

const isArchiveChannelDialog = ref(false);
const isLeaveChannelDialog = ref(false);
const channelSettings: ChannelSettings = reactive({
  muteNotifications: "none",
});
const isCopiedId = ref(false);
const isCopiedEmails = ref(false);
const isCopiedNames = ref(false);

const archiveChannel = () => {
  if (props.channel) {
    emit("archiveChannel", {
      _channelID: props.channel?._channelID,
      name: props.channel.channelName,
    });
    isArchiveChannelDialog.value = false;
  }
};

const leaveChannel = () => {
  if (props.channel) {
    isLeaveChannelDialog.value = false;
    emit("leaveChannel", {
      _channelID: props.channel?._channelID,
      name: props.channel.channelName,
    });
  }
};

const copyChannelId = () => {
  if (props.channel) writeClipboard(props.channel._channelID);
  isCopiedId.value = true;
};

const copyChannelNames = () => {
  const names = props.channel?.members?.map(({ displayName }) => {
    return displayName;
  });
  if (names) {
    writeClipboard(names.join(","));
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

const saveSettings = () => {
  if (props.channel && currentUser)
    emit("update:channelSettings", {
      _channelID: props.channel?._channelID,
      _uuid: currentUser?._uuid,
      setting: channelSettings,
    });
};

onMounted(() => {
  if (props.channel?.settings) {
    channelSettings.muteNotifications =
      props.channel.settings.muteNotifications;
  }
});
</script>

<template>
  <v-sheet class="pa-2">
    <v-switch v-model="channelSettings.muteNotifications" color="success" :label="$lang('channel.mute')"
      @update:model-value="saveSettings" true-value="all" false-value="none"></v-switch>
  </v-sheet>
  <v-divider class="my-2" color="blue" thickness="2"></v-divider>
  <v-btn block :prepend-icon="isCopiedNames ? 'mdi-check-all' : 'mdi-content-copy'" color="blue-grey-darken-1"
    @click="copyChannelNames" variant="tonal">{{ $lang("channel.copyNames") }}</v-btn>
  <v-divider class="my-2" color="orange"></v-divider>
  <v-btn block :prepend-icon="isCopiedEmails ? 'mdi-check-all' : 'mdi-content-copy'" color="blue-grey-darken-1"
    @click="copyChannelEmails" variant="tonal">
    {{ $lang("channel.copyAddresses") }}</v-btn>
  <v-divider class="my-2" color="orange"></v-divider>
  <!-- Archive Channel -->
  <v-btn v-if="currentUser?._uuid === channel?.createdBy" prepend-icon="mdi-archive" color="blue-lighten-1"
    @click="isArchiveChannelDialog = !isArchiveChannelDialog" block>
    {{ $lang("channel.archive") }}
    <v-dialog v-model="isArchiveChannelDialog" key="archive-channel">
      <v-card prepend-icon="mdi-archive" :title="$lang('channel.archive')"
        :text="$lang('channel.archive', ['archive channel'])" width="400" class="mx-auto">
        <v-card-actions>
          <v-btn color="red" prepend-icon="mdi-close" variant="plain" class="me-auto"
            @click.prevent="isArchiveChannelDialog = false">
            {{ $lang("chat.button.cancel") }}</v-btn>
          <v-btn @click="archiveChannel" prepend-icon="mdi-check-circle-outline" color="success" variant="plain"
            :loading="isLoading">{{ $lang("button.confirm") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-btn>
  <v-divider class="my-2" color="orange"></v-divider>
  <!-- Leave Channel -->
  <v-btn color="red-darken-1" prepend-icon="mdi-exit-run" @click="isLeaveChannelDialog = !isLeaveChannelDialog" block>
    {{ $lang("channel.leave") }}
    <v-dialog v-model:model-value="isLeaveChannelDialog" key="leave-channel">
      <v-card prepend-icon="mdi-exit-run" :title="$lang('channel.leave')"
        :text="$lang('text.confirm', ['leave channel'])" width="400" class="mx-auto">
        <v-card-actions>
          <v-btn color="red" variant="plain" prepend-icon="mdi-close" class="me-auto"
            @click.prevent="isLeaveChannelDialog = false">
            {{ $lang("chat.button.cancel") }}</v-btn>
          <v-btn @click="leaveChannel" prepend-icon="mdi-check-circle-outline" color="success" variant="plain">{{
            $lang("channel.button.leave") }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-btn>
  <v-divider class="my-2" color="orange"></v-divider>
  <v-sheet>
    {{ $lang("channel.id") }}: {{ channel?._channelID }}
    <v-btn density="compact" elevation="0" :icon="isCopiedId ? 'mdi-check-all' : 'mdi-content-copy'"
      @click="copyChannelId" class="ms-3" size="small">
    </v-btn>
  </v-sheet>
</template>
