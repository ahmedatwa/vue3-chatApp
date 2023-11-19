<script setup lang="ts">
import type { DBUser } from "@/types/User.ts";
import type { UserSessionData } from "@/types/Session.ts"
import { ref, computed, shallowRef, onMounted } from "vue"
import { reactive, watch } from "vue"
import type { Channels, ChannelForm, ChannelMembers, ChannelSettings } from "@/types/Channel.ts";
import DialogComponent from "@/components/DialogComponent.vue";
import { capitalize, writeClipboard } from "@/helpers";

// Channel
const channelForm: ChannelForm = reactive({
  channelName: "",
  channelTopic: "",
  channelDescription: "",
})

const dialog = shallowRef(false);
const channelTab = ref("about");
const channelSettings = ref<ChannelSettings>({
  channelNotifications: "all"
});
const isCopiedId = shallowRef(false);
const isCopiedEmails = shallowRef(false);
const isCopiedNames = shallowRef(false);
const selectedMembers = ref<ChannelMembers | null>(null);
const channelMemebers = ref<ChannelMembers[]>([])

// Props
const props = defineProps<{
  allUsers?: DBUser[];
  channel?: Channels | null;
  title?: string;
  create?: boolean;
  currentUser?: UserSessionData | undefined
  isLoading?: boolean;
  members?: boolean;
}>();

// emits
const emit = defineEmits<{
  "on:create:channel": [value: ChannelForm];
  "on:update:channel": [value: ChannelForm];
  "on:add:channel:members": [value: ChannelMembers];
  "on:leave:channel": [value: string];
  "on:archive:channel": [value: string]
  "on:remove:member": [value: string];
  "on:channel:settings": [value: { _channelID: string, _uuid: string, setting: ChannelSettings }]
}>();

// methods
const createChannel = () => {
  emit("on:create:channel", { ...channelForm });
  channelForm.channelName = ''
  channelForm.channelDescription = ""
  channelForm.channelTopic = ""
  if (props.currentUser) {
    channelMemebers.value.push({
      _uuid: props.currentUser._uuid,
      name: props.currentUser.displayName
    })
  }

};

const users = computed(() => {
  return props.allUsers?.map(({ _uuid, firstName, lastName }) => {
    return { _uuid: _uuid, name: capitalize(firstName + " " + lastName) };
  });
});

const dialogTitle = computed(() => {
  if (props.channel) {
    return "#" + props.channel.channelName;
  } else {
    return props.title;
  }
});

const archiveChannel = () => {
  if (props.channel)
    emit("on:archive:channel", props.channel?._channelID)
};

const leaveChannel = () => {
  if (props.channel)
    emit("on:leave:channel", props.channel?._channelID)
}
const copyChannelId = () => {
  if (props.channel)
    writeClipboard(props.channel._channelID)
  isCopiedId.value = true;
};

const copyChannelNames = () => {
  const names = props.allUsers?.map(({ firstName, lastName }) => {
    return firstName + " " + lastName;
  });
  if (names) {
    writeClipboard(names.join(","))
    isCopiedNames.value = true;
  }
};
const copyChannelEmails = () => {
  const emails = props.allUsers?.map(({ email }) => {
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
    channelMemebers.value = props.channel.members
    if (props.channel.settings) {
      channelSettings.value = props.channel.settings
    }

  }
})

watch(
  () => selectedMembers.value,
  (newMember) => {
    if (newMember) {
      if (channelMemebers.value.indexOf(newMember) < 0) {
        channelMemebers.value.push(newMember)
        selectedMembers.value = null
        emit("on:add:channel:members", newMember)
      }
    }
  }
)

watch(
  ()=> props.members,
  (members) => {
    if(members) {
      channelTab.value = "members"
    }
  })
const saveSettings = () => {
  if (props.channel && props.currentUser)
    emit("on:channel:settings", {
      _channelID: props.channel?._channelID,
      _uuid: props.currentUser?._uuid,
      setting: channelSettings.value,
    })
}


const isEditTopic = ref(false)
const isEditDesc = ref(false)
const updateChannel = (key: string) => {
  if(key === "topic") {
    isEditTopic.value = true
  } else {
    isEditDesc.value = true
  }
  emit("on:update:channel", channelForm)
}

const removeMember = (index: number, _uuid: string) => {
  channelMemebers.value.splice(index, 1)
  emit("on:remove:member", _uuid)
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
        <v-tab key="about" value="about" v-if="!members">{{ $lang("tab.about") }}</v-tab>
        <v-tab key="members" value="members" v-if="channel?.createdBy === currentUser?._uuid && members">
          {{ $lang("tab.members") }}</v-tab>
        <v-tab key="settings" value="settings" v-if="channel?.createdBy === currentUser?._uuid && !create && !members">
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
                  <v-btn icon variant="text" :key="`topic-${isEditTopic}`" :disabled="channelForm.channelTopic.length < 3">
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
                  <v-btn icon variant="text" :key="`desc-${isEditDesc}`" :disabled="channelForm.channelDescription.length < 3">
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
          <v-combobox placeholder="Search Users" :items="users" item-title="name" prepend-inner-icon="mdi-magnify"
            id="add-channel-users" density="comfortable" variant="solo" v-model="selectedMembers" label="Select"
            clearable>
          </v-combobox>
          <div rounded="rounded" class="mx-auto members-list p-2 rounded" height="20" width="auto">
            <ul>
              <v-slide-x-transition tag="ul" group>
                <li v-for="(member, index) in channelMemebers" :key="member._uuid">
                  <v-btn color="red" :disabled="member._uuid === currentUser?._uuid" icon="mdi-close" variant="text"
                    @click="removeMember(index, member._uuid)" :key="index"></v-btn> {{ member.name }}
                </li>
              </v-slide-x-transition>
            </ul>
          </div>
        </v-window-item>
        <v-window-item value="settings" key="settings">
          <v-sheet elevation="2" rounded :border="true" class="pa-2">
            <v-radio-group v-model="channelSettings.channelNotifications">
              <p>{{ $lang("channel.channelNotifications") }} <v-btn icon="mdi-content-save-cog" density="compact"
                  @click="saveSettings" variant="text" color="indigo"></v-btn></p>
              <v-radio :label="$lang('channel.allNotifications')" value="all"></v-radio>
              <v-radio :label="$lang('channel.muteChannel')" value="none"></v-radio>
            </v-radio-group>
          </v-sheet>
          <v-divider class="my-2" color="blue" thickness="4"></v-divider>
          <v-btn block :prepend-icon="isCopiedNames ? 'mdi-check-all' : 'mdi-content-copy'" color="blue-grey-darken-1"
            @click="copyChannelNames" variant="tonal">{{ $lang("channel.copyMemberNames") }}</v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <v-btn block :prepend-icon="isCopiedEmails ? 'mdi-check-all' : 'mdi-content-copy'
            " color="blue-grey-darken-1" @click="copyChannelEmails" variant="tonal">
            {{ $lang("channel.copyMemberAddresses") }}</v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <v-btn prepend-icon="mdi-archive" color="blue-lighten-1" block>
            {{ $lang("channel.archiveChannel") }}
            <dialog-component icon="mdi-alert-circle" :title-text="$lang('channel.archiveChannel')"
              title-icon="mdi-archive" key="archive-channel">
              <template #main>
                <v-sheet>{{ $lang('textConfirm', ['archive channel']) }}</v-sheet>
              </template>
              <template #buttons>
                <v-btn @click="archiveChannel" prepend-icon="mdi-check-circle-outline" color="#EF5350"
                  :loading="isLoading" block>{{ $lang("button.confirm") }}</v-btn>
              </template>
            </dialog-component>
          </v-btn>
          <v-divider class="my-2" color="orange"></v-divider>
          <v-btn color="red-darken-1" prepend-icon="mdi-exit-run" block>
            {{ $lang("channel.leaveChannel") }}
            <dialog-component icon="mdi-alert-circle" :title-text="$lang('textConfirm')"
              :title="$lang('channel.leaveChannel')" key="leave-channel">
              <template v-slot:prepend-button>
                <v-btn @click="leaveChannel" prepend-icon="mdi-check-circle-outline" color="indigo" variant="tonal"
                  block>{{
                    $lang("button.confirm") }}</v-btn>
              </template>
            </dialog-component>
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