<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from "vue";
import { shallowRef, watchEffect, provide, computed } from "vue";
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
import type { Snackbar, UploadedFiles } from "@/types/Chat";
import type { User, UserSettings, DirectMessageChannels } from "@/types/User";
// vuetify
import { useTheme } from "vuetify";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import { _directMessageEmits, _directMessageListener } from "@/client";
import { capitalize, arrayUniqueBy } from "@/helpers";

// Stores
const userStore = useUserStore();
const sessionStore = useSessionStore();
const storageStore = useStorageStore();
const directMessageStore = useDirectMessageStore();
const channelStore = useChannelStore();

const newSnackbar = ref<Snackbar | null>(null);
const drawer = ref(true);
provide("drawer", drawer);
provide("user", sessionStore.userSessionData);
const activeComponent = shallowRef("");
const isAlert = ref(false);
const _theme = useTheme();

const updateProfile = (event: { displayName: string; image: File | null }) => {
  if (sessionStore.userSessionData?._uuid) {
    userStore.updateUserSettings(
      sessionStore.userSessionData?._uuid,
      null,
      event.displayName,
      event.image
    );
    const user = directMessageStore.users.find(
      (user) => user._uuid === sessionStore.userSessionData?._uuid
    );

    if (user) {
      if (event.displayName) {
        sessionStore.userSessionData.displayName = event.displayName;
        user.displayName = event.displayName;
      }

      if (event.image?.name) {
        sessionStore.userSessionData.image =
          import.meta.env.VITE_API_UPLOAD_URL + event.image.name;
        user.image = import.meta.env.VITE_API_UPLOAD_URL + event.image.name;
      }
    }
  }
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

//new userStore Notification
watch(
  () => userStore.newAlert,
  (NewA) => {
    isAlert.value = true;
    newSnackbar.value = NewA;
  }
);

onMounted(() => {
  if (sessionStore.userSessionData?.settings?.leftOff) {
    const $_ = storageStore.getLastSelectedElement;
    if ($_ && $_.current) {
      storageStore.lastSelectedElement = {
        _id: $_.current?._id,
        key: $_.current?.key,
      };

      if ($_.current.key === "user") {
        watchEffect(() => {
          if (directMessageStore.users) {
            const user = directMessageStore.users.find(
              (u: User) => u._uuid === $_.current?._id
            );
            if (user) {
              directMessageStore.selectedUser = {
                ...user,
                selected: true,
                newMessages: null,
              };
            }
          }
        });
      }
      if ($_.current?.key === "channel") {
        watchEffect(() => {
          if (channelStore.channels) {
            const channel = channelStore.channels.find(
              (el: Channels) => el._channelID === $_.current?._id
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

  if (sessionStore.userSessionData?.settings?.theme) {
    _theme.global.name.value = sessionStore.userSessionData?.settings?.theme;
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
  // _directMessageEmits
  for (const key in _directMessageEmits) {
    socket.off(_directMessageEmits[key as keyof typeof _directMessageEmits]);
  }
  // _directMessageListener
  for (const key in _directMessageListener) {
    socket.off(
      _directMessageListener[key as keyof typeof _directMessageListener]
    );
  }
});

// Sockets

socket.on("connect", () => {
  socket.on("session", async (session: User) => {
    const [directMessagesChannels, channels] = await Promise.all([
      directMessageStore.getUserDirectMessageChannels(session._uuid),
      channelStore.getChannels(session._uuid),
    ]);

    // User Channels
    const users = [];
    users.push({
      ...session,
      messages: [],
      messagesDistributed: false,
      connected: session.connected,
      self: (socket as any)._uuid === session._uuid,
      _channelID: null,
    });

    if (directMessagesChannels.length) {
      directMessagesChannels.map((res: DirectMessageChannels) => {
        const otherUser = session._uuid === res.from ? res.to : res.from;

        const found = directMessageStore.users.find(
          (user) => user._uuid === otherUser
        );

        if (found) {
          found._channelID = res._channelID;
        } else {
          userStore.allUsers.forEach((user) => {
            if (user._uuid === otherUser) {
              users.push({
                _id: user._id,
                _uuid: user._uuid,
                _channelID: res._channelID,
                firstName: user.firstName,
                lastName: user.lastName,
                displayName: user.displayName,
                email: user.email,
                image: user.image,
                visible: user.visible,
                settings: user.settings,
                messagesDistributed: false,
                self: user._uuid === (socket as any)._uuid,
                connected: user.connected,
                messages: [],
                pagination: null,
                createdAt: user.createdAt,
              });
            }
          });
        }
      });
      // Unique
      const unique = arrayUniqueBy(users, "_uuid");
      if (unique) {
        directMessageStore.users = unique;
      }
    } else {
      directMessageStore.users.push({
        ...session,
        messages: [],
        messagesDistributed: false,
        connected: session.connected,
        self: (socket as any)._uuid === session._uuid,
        _channelID: null,
      });
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
            pagination: {
              offset:
                channel.totalMessages > channelStore.paginationLimit
                  ? Math.ceil(
                      channel.totalMessages - channelStore.paginationLimit
                    )
                  : 0,
              limit: channelStore.paginationLimit,
              total: channel.totalMessages,
            },
            members: [],
            messages: [],
            totalMessages: channel.totalMessages,
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
  });
});

socket.on(
  _directMessageListener.status,
  (event: { _uuid: string; status: boolean }) => {
    const user = directMessageStore.users.find((u) => u._uuid === event._uuid);
    if (user) {
      user.connected = event.status;
    }
  }
);

// Header Component
const getUserDownloads = () => {
  userStore.getUserFilesDownloads(sessionStore.userSessionData?._uuid);
};
const DownloadFile = (file: UploadedFiles) => {
  if (sessionStore.userSessionData?._uuid) {
    userStore.downloadFiles(sessionStore.userSessionData?._uuid, file);
  }
};

const addSelectedChatUser = async (_uuid: string) => {
  const found = directMessageStore.users.find((u) => u._uuid === _uuid);
  if (found === undefined) {
    await userStore.updateUserStatus(_uuid, null, true);
    if (userStore.allUsers) {
      userStore.allUsers.forEach((user: User) => {
        if (user._uuid === _uuid) {
          directMessageStore.users.push({
            ...user,
          });
          return;
        }
      });
    }
  } else {
    found.visible = true;
    await userStore.updateUserStatus(_uuid, null, true);
  }
};

const goOffline = (value: boolean) => {
  const $status = value === true ? false : true;
  socket.emit(_directMessageEmits.status, { status: $status });
  directMessageStore.users.forEach((user) => {
    if (user._uuid === sessionStore.userSessionData?._uuid) {
      user.connected = $status;
      if (sessionStore.userSessionData) {
        sessionStore.userSessionData.connected = $status;
      }
      return;
    }
  });
};

const updateSettings = (setting: UserSettings) => {
  storageStore.setStorage("APPUSSTIG", {
    theme: setting.theme,
    muteConnectionNotif: setting.muteConnectionNotif,
  });
  _theme.global.name.value = setting.theme;

  if (sessionStore.userSessionData?._uuid) {
    userStore.updateUserSettings(
      sessionStore.userSessionData?._uuid,
      setting,
      null,
      null
    );
  }
};

// Channel Loading More
const loadMoreChannelMessages = (
  _channelID: string | number,
  offset: number,
  unshift: boolean
) => {
  channelStore.getChannelMessages(_channelID, offset, unshift);
};

const loadMoreMessages = (payload: {
  _channelID: string | number;
  limit: number;
  offset: number;
  unshift: boolean;
}) => {
  directMessageStore.getMessages(
    payload._channelID,
    payload.limit,
    payload.offset,
    payload.unshift
  );
};

const mappedUsers = computed(() => {
  return userStore.allUsers.map(({ _uuid, displayName, email, createdAt }) => {
    return {
      _uuid,
      displayName,
      email,
      createdAt,
    };
  });
});

// Drawer Component

const removeUser = async (user: User) => {
  const index = directMessageStore.users.findIndex(
    (u) => u._uuid === user._uuid
  );
  if (index) {
    directMessageStore.users.splice(index, 1);
    directMessageStore.selectedUser = null;
  }
  if (sessionStore.userSessionData) {
    userStore.updateUserStatus(user._uuid, true, false);
  }
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

  storageStore.setStorage("LSTSELECD", {
    current: { _id, key },
    prev: storageStore.lastSelectedElement,
  });
  storageStore.lastSelectedElement = { _id, key };
};
</script>
<template>
  <snackbar-component :alert="newSnackbar" v-model:model-value="isAlert">
  </snackbar-component>
  <div v-if="sessionStore.isLoggedIn">
    <drawer-component
      :_uuid="sessionStore.userSessionData?._uuid"
      :users="directMessageStore.filteredUsers"
      :channels="channelStore.filteredChannels"
      :selected-channel="channelStore.selectedChannel"
      :is-loading-channels="channelStore.isLoading.channels"
      :is-loading-users="directMessageStore.isLoading.users"
      :last-active-element="storageStore.lastSelectedElement?._id"
      @update:selected="onSelect"
      @create-channel="channelStore.createChannel"
      @remove-user="removeUser"
    ></drawer-component>

    <header-component
      :key="sessionStore.userSessionData?._uuid"
      :search-users="mappedUsers"
      :downloaded-files="userStore.downloadedFiles"
      @update:search-value="addSelectedChatUser"
      @logout="sessionStore.updateSession"
      @update:status="goOffline"
      @update:setting="updateSettings"
      @update:profile="updateProfile"
      @update:downloads="getUserDownloads"
      @update:download-file="DownloadFile"
    ></header-component>

    <v-main>
      <v-container>
        <channel-component
          v-for="channel in channelStore?.channels"
          :id="`channel-${channel._channelID}`"
          :key="channel._channelID"
          :channel="channel"
          :selected="storageStore.lastSelectedElement?._id === channel._channelID"
          :is-loading="channelStore.isLoading"
          :typing="channelStore.typing"
          :is-message-delete="channelStore.isMessageDelete"
          :search-users="mappedUsers"
          @load-more-messages="loadMoreChannelMessages"
          @send:thread-message="channelStore.sendMessageThread"
          @update-channel-settings="channelStore.updateChannelSettings"
          @update:channel-members="channelStore.updateChannelMembers"
          @update:send-message="channelStore.sendMessage"
          @update:typing="channelStore.channelTyping"
          @thread-typing="channelStore.channelTheadTyping"
          @edit-message="channelStore.editChannelMessage"
          @delete-message="channelStore.deleteChannelMessage"
          @archive-channel="channelStore.archiveChannel"
          @update-channel="channelStore.updateChannel"
          @leave-channel="channelStore.leaveChannel"
          @download-file="channelStore.downloadFile"
          @update:messageReaction="channelStore.updateMessageReaction"
        >
        </channel-component>
        <direct-message-component
          v-for="user in directMessageStore.users"
          :key="`direct-message-${user._uuid}`"
          :id="`direct-message-${user._uuid}`"
          :user="user"
          :selected="storageStore.lastSelectedElement?._id === user._uuid"
          :typing="directMessageStore.typing"
          :is-loading="directMessageStore.isLoading"
          :is-scroll="directMessageStore.isScroll"
          @update:messageReaction="directMessageStore.updateMessageReaction"
          @load-more-messages="loadMoreMessages"
          @update:send-message="directMessageStore.sendMessage"
          @send:thread-message="directMessageStore.sendThreadMessage"
          @edit-message="directMessageStore.editMessage"
          @delete-message="directMessageStore.deleteMessage"
          @update:typing="directMessageStore.userTyping"
          @update:thread-typing="directMessageStore.userTheadTyping"
          @update:delete-file="directMessageStore.deleteFiles"
          @update:downdload-file="DownloadFile"
        ></direct-message-component>
      </v-container>
    </v-main>
  </div>
</template>
