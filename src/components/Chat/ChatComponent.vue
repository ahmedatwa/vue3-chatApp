<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from "vue";
import { shallowRef, watchEffect, provide } from "vue";
// stores
import { useUserStore, useStorageStore, useSessionStore } from "@/stores";
import { useChannelStore, useDirectMessageStore } from "@/stores";
// components
import { DrawerComponent, HeaderComponent } from "@/components/Common";
import { DirectMessageComponent } from "@/components/DirectMessage";
import { ChannelComponent } from "@/components/Channel";
// types
import SnackbarComponent from "@/components/SnackbarComponent.vue";
import type { Channels } from "@/types/Channel";
import type { Snackbar } from "@/types";
import type { User, UserAppSettings } from "@/types/User";
// vuetify
import { useTheme } from "vuetify";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import { capitalize } from "@/helpers";

// Stores
const userStore = useUserStore();
const sessionStore = useSessionStore();
const storageStore = useStorageStore();
const directMessageStore = useDirectMessageStore();
const channelStore = useChannelStore();

const newSnackbar = ref<Snackbar | null>(null);
const drawer = ref(true);
provide("drawer", drawer);
const activeComponent = shallowRef("");
const lastSelectedElement = ref<string | number | null>(null);
const isAlert = ref(false);
const _theme = useTheme();

provide("user", sessionStore.userSessionData);

const goOffline = ($status: boolean) => {
  directMessageStore.users.forEach((user) => {
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

const onSelect = (
  _id: string | number,
  key: string,
  value: User | Channels
) => {
  if (key === "user") {
    directMessageStore.onSelectUser({ ...(value as User) });
  } else {
    channelStore.onSelectChannel({ ...(value as Channels) });
  }
  activeComponent.value = key;
  storageStore.setStorage("LSTSELECD", { _id, comp: key });
};

// update veutify theme
const updateSettings = (setting: UserAppSettings) => {
  storageStore.setStorage("APPUSSTIG", {
    theme: setting.theme,
    muteConnectionNotif: setting.muteConnectionNotif,
  });
  _theme.global.name.value = setting.theme;
};

// Watchers
//new userStore socket Notification
watch(
  () => directMessageStore.newAlert,
  (NewA) => {
    isAlert.value = true;
    newSnackbar.value = NewA;
  }
);

//new channelStore socket Notification
watch(
  () => channelStore.newAlert,
  (NewA) => {
    isAlert.value = true;
    newSnackbar.value = NewA;
  }
);

onMounted(() => {
  const userSettings = storageStore.userStorageSettings;
  if (userSettings !== null && userSettings.leftOff) {
    const $_ = storageStore.getLastSelectedElement;
    console.log($_);

    if ($_) {
      lastSelectedElement.value = $_._id;
      activeComponent.value = $_.comp;
      if ($_.comp === "user") {
        watchEffect(() => {
          if (directMessageStore.users) {
            const user = directMessageStore.users.find(
              (el: User) => el._uuid === $_._id
            );
            if (user) {
              directMessageStore.selectedUser = {
                ...user,
                selected: true,
                newMessages: null,
                messages:
                  directMessageStore.messagesPerUser.get(user._uuid) || [],
              };
            }
          }
        });
      }
      if ($_.comp === "channel") {
        watchEffect(() => {
          if (channelStore.channels) {
            const channel = channelStore.channels.find(
              (el: Channels) => el._channelID === $_._id
            );
            if (channel) {
              channelStore.selectedChannel = {
                ...channel,
                selected: true,
                newMessages: null,
                messagesDistributed: false,
                membersDistributed: false,
              };
            }
          }
        });
      }
    }
  }
});

watchEffect(() => {
  if (storageStore.userStorageSettings?.theme) {
    _theme.global.name.value = storageStore.userStorageSettings.theme;
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

// Sockets
socket.on("connect", async () => {
  socket.on(
    "session",
    async (session: {
      _id: number;
      _uuid: string;
      sessionID: string;
      userName: string;
      _channelID: string;
      connected: boolean;
    }) => {
      // Direct
      if(sessionStore.userSessionData) {
        directMessageStore.users.push({...sessionStore.userSessionData})
      }
      
      
      const [messages, channels] = await Promise.all([
        directMessageStore.getMessages(session._uuid),
        channelStore.getChannels(session._uuid),
      ]);

      if (messages?.data) {
        messages?.data.forEach(async (message: any) => {
          const { from, to } = message;
          const otherUser: string = session._uuid === from ? to : from;

          if (directMessageStore.otherUsers.indexOf(otherUser)) {
            directMessageStore.otherUsers.push(otherUser);
          }

          if (directMessageStore.messagesPerUser.has(otherUser)) {
            directMessageStore.messagesPerUser.get(otherUser).push(message);
          } else {
            directMessageStore.messagesPerUser.set(otherUser, [message]);
          }
        });

        if (directMessageStore.otherUsers.length) {
          const users = await userStore.getUser(directMessageStore.otherUsers);

          if (users.data) {
            users.data.forEach((user: User) => {
              const found = directMessageStore.users.find(
                (u) => u._uuid === user._uuid
              );

              if (found === undefined) {
                directMessageStore.users.push({
                  _id: user._id,
                  _uuid: user._uuid,
                  userName: user.userName,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  displayName: capitalize(user.firstName + " " + user.lastName),
                  email: user.email,
                  image: user.image,
                  messagesDistributed: false,
                  self: user._uuid === session._uuid,
                  selected: false,
                  connected: user.connected,
                  messages:
                    directMessageStore.messagesPerUser.get(user._uuid) || [],
                  createdAt: user.createdAt,
                });
              }
            });
          }
        }
      }
      // channels
      if (channels?.data) {
        channels.data.forEach((channel: Channels) => {
          const found = channelStore.channels.find(
            (c) => c._channelID === channel._channelID
          );
          if (found === undefined) {
            channelStore?.channels.push({
              _id: channel._id,
              _channelID: channel._channelID,
              channelName: capitalize(channel.channelName),
              channelTopic: channel.channelTopic,
              channelDescription: channel.channelDescription,
              messagesDistributed: false,
              membersDistributed: false,
              pagination: null,
              members: [],
              messages: [],
              settings: channel.settings,
              createdBy: channel.createdBy,
              createdAt: channel.createdAt,
            });
          }
        });

        // emit Channel Ids to Server
        const mapChannels = channels.data.map(
          (channel: Channels) => channel._channelID
        );

        if (mapChannels) {
          socket.emit("channels", mapChannels);
        }
      }
    }
  );
});

// Channel Loading More
const loadMoreMessages = (
  _channelID: string | number,
  limit: number,
  offset: number,
  unshift: boolean
) => {
  channelStore.getChannelMessages(_channelID, limit, offset, unshift);
};
</script>
<template>
  <snackbar-component :alert="newSnackbar" v-model:model-value="isAlert">
  </snackbar-component>
  <div v-if="sessionStore.isLoggedIn">
    <drawer-component
      :_uuid="sessionStore.userSessionData?._uuid!"
      :users="directMessageStore.filteredUsers"
      :channels="channelStore.filteredChannels"
      :selected-channel="channelStore.selectedChannel"
      :is-loading-channels="channelStore.isLoading.channels"
      :is-loading-users="directMessageStore.isLoading.users"
      :last-active-element="lastSelectedElement"
      @update:selected="onSelect"
      @create-channel="channelStore.createChannel($event)"
    ></drawer-component>

    <header-component
      :key="sessionStore.userSessionData?._uuid"
      :user-settings="storageStore.userStorageSettings"
      @logout="sessionStore.updateSession"
      @update:status="goOffline"
      @update:setting="updateSettings"
    ></header-component>

    <v-main>
      <v-container>
        <channel-component
          v-if="activeComponent === 'channel'"
          id="channel"
          :key="channelStore.selectedChannel?._channelID"
          :current-channel="channelStore?.selectedChannel"
          :is-loading="channelStore.isLoading"
          :typing="channelStore.typing"
          :is-message-delete="channelStore.isMessageDelete"
          @load-more-messages="loadMoreMessages"
          @send-thread-message="channelStore.sendMessageThread"
          @update-channel-settings="channelStore.updateChannelSettings"
          @update:channel-members="channelStore.updateChannelMembers"
          @send-message="channelStore.sendMessage"
          @channel-typing="channelStore.channelTyping"
          @thread-typing="channelStore.channelTheadTyping"
          @edit-message="channelStore.editChannelMessage"
          @delete-message="channelStore.deleteChannelMessage"
          @archive-channel="channelStore.archiveChannel"
          @update-channel="channelStore.updateChannel"
          @leave-channel="channelStore.leaveChannel"
          @download-file="channelStore.downloadFile"
        >
        </channel-component>
        <direct-message-component
          v-if="activeComponent === 'user'"
          id="direct-message"
          :key="directMessageStore.selectedUser?._uuid"
          :selected-user="directMessageStore.selectedUser"
          :typing="directMessageStore.typing"
          :is-loading="directMessageStore.isLoading"
          @send-message="directMessageStore.sendMessage"
          @user-typing="directMessageStore.userTyping"
        ></direct-message-component>
      </v-container>
    </v-main>
  </div>
</template>
