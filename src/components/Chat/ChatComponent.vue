<script setup lang="ts">
import { DrawerComponent, HeaderComponent } from "@/components/Common";
import { MessageComponent } from "@/components/Message";
import { ChannelComponent } from "@/components/Channel";
import SnackbarComponent from "@/components/SnackbarComponent.vue";
import { ref, onUnmounted, onMounted, watch } from "vue";
import { shallowRef, watchEffect, provide } from "vue";
import { useUserStore, useSessionStore, useMessageStore } from "@/stores";
import { useChannelStore, useLoginStore, useStorageStore } from "@/stores";
import { Channels } from "@/types/Channel.ts";
import { Settings, Snackbar } from "@/types";
import { User } from "@/types/User.ts";
import { useTheme } from "vuetify";
import socket, { _channelEmits, _channelListener } from "@/client";

// Stores
const userStore = useUserStore();
const userLoginStore = useLoginStore();
const sessionStore = useSessionStore();
const messageStore = useMessageStore();
const channelStore = useChannelStore();
const storageStore = useStorageStore();

const newSnackbar = ref<Snackbar | null>(null);
const drawer = ref(true);
provide("drawer", drawer);
const activeComponent = shallowRef("");
const lastSelectedElement = ref<string | number | null>(null);

const _theme = useTheme();

provide("settings", storageStore.appSettings);
provide("user", sessionStore.userSessionData);

const goOffline = ($status: boolean) => {
  userStore.users.forEach((user) => {
    if (user._uuid === sessionStore.userSessionData?._uuid) {
      user.connected = $status === true ? false : true;
      if (sessionStore.userSessionData) {
        sessionStore.userSessionData.connected =
          $status === true ? false : true;
      }
      return;
    }
  });
};

const doLogout = async (_uuid: string, sessionID: string) => {
  sessionStore.updateSession({
    _uuid: _uuid,
    sessionID: sessionID,
    connected: false,
  });
};

const onSelect = (
  _id: string | number,
  key: string,
  value: User | Channels
) => {
  if (key === "user") {
    userStore.onSelectUser({ ...(value as User) });
  } else {
    channelStore.onSelectChannel({ ...(value as Channels) });
  }
  activeComponent.value = key;
  storageStore.setLastSelected({ _id, comp: key });
};

const onSearch = (name: string) => {
  userStore.filterSearchInput = name;
  channelStore.filterSearchInput = name;
};

const onTyping = (input: string) => {
  socket.timeout(500).emit("user_typing", {
    input: input.length,
    to: userStore.selectedUser?._uuid,
  });
};

const UpdateSeen = (__seen: boolean) => {};
const updateNewMessageCount = () => {};

socket.on("client_user_typing", ({ input, from, username }) => {
  if (input > 1) {
    messageStore.typing = {
      from: from,
      name: username,
      isTyping: true,
    };
  } else {
    messageStore.typing = null;
  }
});

// ----------- Channels ---------- //
// const newChannelMessage = (payload: {
//   content: string;
//   files?: FileList | null;
// }) => {
//   channelStore.sendMessage(payload);
// };

// const onDeleteChannelMessage = (payload: {
//     _messageId: string | number;
//     deletedContent: string;
//     deletedAt: string;
//     softDelete: boolean;
//   }) => {
//   channelStore.deleteChannelMessage(payload);
// };

// const onEditChannelMessage = (payload: {
//   _messageId: string | number;
//   editContent: string;
//   content: string;
//   updatedAt: string;
// }) => {
//   channelStore.editChannelMessage(payload);
// };

// const onReplyChannelMessage = (payload: {
//     _messageId: string | number;
//     editContent: string;
//     content: string;
//     updatedAt: string;
//   }) => {
//   channelStore.replyChannelMessage(payload);
// };

// ----------- Channels End ---------- //

// update veutify theme
const updateSettings = (setting: Settings) => {
  storageStore.setAppSettings({
    theme: setting.theme,
    connectionNotif: setting.connectionNotif,
  });
  _theme.global.name.value = setting.theme;
};

// Alerts
const clearNotification = (value: boolean) => {
  if (value === true) newSnackbar.value = null;
};

// Watchers
//new userStore socket Notification
watch(
  () => userStore.newNotification,
  (NewA) => {
    newSnackbar.value = NewA;
  }
);

//new channelStore socket Notification
watch(
  () => channelStore.newNotification,
  (NewA) => {
    newSnackbar.value = NewA;
  }
);

onMounted(() => {
  if (storageStore.appSettings?.theme) {
    _theme.global.name.value = storageStore.appSettings.theme;
  }
  const $_ = storageStore.getLastSelected();
  if ($_) {
    lastSelectedElement.value = $_._id;
    activeComponent.value = $_.comp;
    if ($_.comp === "user") {
      watchEffect(() => {
        if (userStore.users) {
          const user = userStore.users.find((element) => {
            return element._uuid === $_._id;
          });
          if (user) {
            userStore.selectedUser = {
              ...user,
              selected: true,
              newMessages: null,
            };
          }
        }
      });
    } else {
      watchEffect(() => {
        if (channelStore.channels) {
          const channel = channelStore.channels.find((element) => {
            return element._channelID === $_._id;
          });
          if (channel) {
            channelStore.selectedChannel = {
              ...channel,
              selected: true,
              newMessages: null,
            };
          }
        }
      });
    }
  }
});

onUnmounted(() => {
  // Channel Emits
  for (const key in _channelEmits) {
    socket.off(_channelEmits[key as keyof typeof _channelEmits]);
  }
  // Channel Listeners
  for (const key in _channelListener) {
    socket.off(_channelListener[key as keyof typeof _channelListener]);
  }
});



</script>
<template>
  <snackbar-component
    :alert="newSnackbar"
    @update:modelValue="clearNotification"
  >
  </snackbar-component>
  <div v-if="sessionStore.isLoggedIn">
    <drawer-component
      :_uuid="sessionStore.userSessionData?._uuid!"
      :users="userStore.filteredUsers"
      :channels="channelStore.filteredChannels"
      :selected-channel="channelStore.selectedChannel"
      :channels-loading="channelStore.channelsLoading"
      :is-user-loading="userStore.isLoading"
      :last-active-element="lastSelectedElement"
      @on:leave:channel="channelStore.leaveChannel"
      @update:selected="onSelect"
      @user:created:channel="channelStore.createChannel($event)"
    ></drawer-component>

    <header-component
      :key="sessionStore.userSessionData?._uuid"
      @logout="doLogout"
      @update:status="goOffline"
      @update:setting="updateSettings"
      @update:search="onSearch"
    ></header-component>

    <v-main>
      <v-container>
        <section id="channel" v-if="activeComponent === 'channel'">
          <channel-component
            :key="channelStore.selectedChannel?._channelID"
            :currentChannel="channelStore?.selectedChannel"
            :is-loading="channelStore.isLoading"
            :is-messages-loading="channelStore.isMessagesLoading"
            :typing="channelStore.typing"
            :all-users="userLoginStore.users"
            :is-message-delete="channelStore.isMessageDelete"
            :messages-paginate="channelStore.messagesPagination"
            @delete-message="channelStore.deleteChannelMessage"
            @load:more-messages="channelStore.getChannelMessages($event, true)"
            @send:messageThread="channelStore.sendMessageThread"
            @update:channel:settings="channelStore.updateChannelSettings"
            @add:channel:members="channelStore.addChannelMembers"
            @update:channel:users="channelStore.addChannelMembers"
            @send:message="channelStore.sendMessage"
            @update:typing="channelStore.onChannelTyping"
            @edit-message="channelStore.editChannelMessage"
            @delete:message="channelStore.deleteChannelMessage"
            @archive:channel="channelStore.archiveChannel"
            @update:channel="channelStore.updateChannel"
            @leave:channel="channelStore.leaveChannel"
            @download:file="channelStore.downloadFile"
            @remove:channel:member="channelStore.removeChannelMembers"
          >
          </channel-component>
        </section>
        <section id="message" v-if="activeComponent === 'user'">
          <message-component
            ref="user"
            :selected-user="userStore.selectedUser"
            :key="userStore.selectedUser?._uuid"
            :room="messageStore.createdRoom"
            :typing="messageStore.typing"
            :is-loading="sessionStore.isLoading"
            :current-user="sessionStore.userSessionData!"
            @update:typing="onTyping"
            @update:new-messages-count="updateNewMessageCount"
            @update:seen="UpdateSeen"
          ></message-component>
        </section>
      </v-container>
    </v-main>
  </div>
</template>
