<script setup lang="ts">
import { ref, onUnmounted, onMounted, watch } from "vue";
import { shallowRef, watchEffect, provide } from "vue";
// stores
import { useUserStore, useStorageStore } from "@/stores";
import { useChannelStore, useDirectMessageStore } from "@/stores";
// components
import { DrawerComponent, HeaderComponent } from "@/components/Common";
import { DirectMessageComponent } from "@/components/DirectMessage";
import { ChannelComponent } from "@/components/Channel";
// types
import SnackbarComponent from "@/components/SnackbarComponent.vue";
import type { Channels } from "@/types/Channel";
import type { Snackbar, UserAppSettings } from "@/types";
import type { User } from "@/types/User";
// vuetify
import { useTheme } from "vuetify";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import { capitalize } from "@/helpers";

// Stores
const userStore = useUserStore();
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

provide("user", userStore.userSessionData);

const goOffline = ($status: boolean) => {
  directMessageStore.users.forEach((user) => {
    if (user._uuid === userStore.userSessionData?._uuid) {
      user.connected = $status === true ? false : true;
      if (userStore.userSessionData) {
        userStore.userSessionData.connected = $status === true ? false : true;
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

const onSearch = (name: string) => {
  directMessageStore.filterSearchInput = name;
  channelStore.filterSearchInput = name;
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
  //const $_ = storageStore.getLastSelectedElement;
  //if ($_) {
  // lastSelectedElement.value = $_._id;
  // activeComponent.value = $_.comp;
  //   if ($_.comp === "user") {
  //     watchEffect(() => {
  //       if (directMessageStore.users) {
  //         const user = directMessageStore.users.find((element) => {
  //           return element._uuid === $_._id;
  //         });
  //         if (user) {
  //           directMessageStore.selectedUser = {
  //             ...user,
  //             selected: true,
  //             newMessages: null,
  //           };
  //         }
  //       }
  //     });
  // }
  //   if ($_.comp === "channel") {
  //     if (channelStore.channels) {
  //       const channel = channelStore.channels.find((element: Channels) => (element._channelID === $_._id))
  //       channelStore.channels.forEach((ch) => {
  //         if (ch._channelID === $_._id) {
  //         }
  //       })
  //       console.log(channel);
  //       nextTick(() => {
  //         if (channel) {
  //           channelStore.selectedChannel = {
  //             ...channel,
  //             selected: true,
  //             newMessages: null,
  //             messagesDistributed: false,
  //             membersDistributed: false,
  //             messagesLimit: channelStore.limit,
  //           };
  //         }
  //       });
  //     }
  //   }
  //}
});

watchEffect(() => {
  if (!lastSelectedElement.value && !activeComponent.value.length) {
    const $_ = storageStore.getLastSelectedElement;
    if ($_) {
      const channel = channelStore.channels.find(
        (element: Channels) => element._channelID === $_._id
      );
      if (channel) {
        lastSelectedElement.value = $_._id;
        activeComponent.value = $_.comp;
        channelStore.selectedChannel = {
          ...channel,
          selected: true,
          newMessages: null,
          messagesDistributed: false,
          membersDistributed: false,
        };
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
    // const userChannelMembers = await directMessageStore.getUserChannelMembers(session._channelID);

    // const mapMembers = directMessageStore.channelMembers.map((m) => {
    //   const member =  directMessageStore.getUserMember(m._uuid);
    //   return member 

    // })
    // console.log(directMessageStore.channelMembers);
    

    // directMessageStore.users.push({
    //     _id
    //     connected: session.connected;
    //     self: user._uuid === session._uuid;
    //     sessionID: session.sessionID;
         
    //   })



    
    // channels
    const channels = await userStore.getUserChannels(session._uuid);

    if (channels?.data) {
      channels.data.forEach((channel: Channels) => {
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
      });

      // emit Channel Ids to Server
      const mapChannels = channels.data.map(
        (channel: Channels) => channel._channelID
      );

      if (mapChannels) {
        socket.emit("channels", mapChannels);
      }
    }

    // Direct
     

    //const messages = await directMessageStore.getMessages(session._uuid)
  }
);
//socket connection established
// socket.on("connect",  async(socket: any): void => {
// console.log(socket)
// if (userStore.userSessionData) {
//   const [users] = await Promise.all([
//     userStore.getUserSessions(),
//     // directMessageStore.getMessages(userStore.userSessionData?._uuid),
//     // userStore.getUserChannels(userStore.userSessionData?._uuid),
//   ]);

// Users
//   if (users?.data) {
//     // unique array
//     users?.data.forEach((user: User) => {
//       directMessageStore.users.push({
//         _id: user._id,
//         _uuid: user._uuid,
//         sessionID: user.sessionID,
//         userName: user.userName,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         displayName: capitalize(user.firstName + " " + user.lastName),
//         connected: user.connected,
//         self: user._uuid === userStore.userSessionData?._uuid,
//         image: user.image,
//         email: user.email,
//         selected: false,
//         messagesDistributed: false,
//         messages: [],
//         settings: null,
//         createdAt: user.createdAt
//       });
//     });
// }

// Messages
// if (messages?.data) {
//   const messagesPerUser = new Map();
//   messages?.data.forEach((message: DBUserMessages) => {
//     message.content.forEach((content: UserMessages) => {
//       const otherUser =
//         userStore.userSessionData?._uuid === content.from
//           ? content.to
//           : content.from;
//       if (messagesPerUser.has(otherUser)) {
//         messagesPerUser.get(otherUser).push(content);
//       } else {
//         messagesPerUser.set(otherUser, [content]);
//       }
//     });
//   });
// }

// channels

// }
// });

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
  <div v-if="userStore.isLoggedIn">
    <drawer-component
      :_uuid="userStore.userSessionData?._uuid!"
      :users="directMessageStore.users"
      :channels="channelStore.filteredChannels"
      :selected-channel="channelStore.selectedChannel"
      :is-loading-channels="channelStore.isLoading.channels"
      :is-loading-users="directMessageStore.isLoading.users"
      :last-active-element="lastSelectedElement"
      @on:leave:channel="channelStore.leaveChannel"
      @update:selected="onSelect"
      @user:created:channel="channelStore.createChannel($event)"
    ></drawer-component>

    <header-component
      :key="userStore.userSessionData?._uuid"
      :user-settings="storageStore.userStorageSettings"
      @logout="userStore.updateSession"
      @update:status="goOffline"
      @update:setting="updateSettings"
      @update:search="onSearch"
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
          @new-message-thread="channelStore.sendMessageThread"
          @update-channel-settings="channelStore.updateChannelSettings"
          @add-channel-members="channelStore.addChannelMembers"
          @update-channel-users="channelStore.addChannelMembers"
          @send-message="channelStore.sendMessage"
          @channel-typing="channelStore.channelTyping"
          @thread-typing="channelStore.channelTheadTyping"
          @edit-message="channelStore.editChannelMessage"
          @delete-message="channelStore.deleteChannelMessage"
          @archive-channel="channelStore.archiveChannel"
          @update-channel="channelStore.updateChannel"
          @leave-channel="channelStore.leaveChannel"
          @download-file="channelStore.downloadFile"
          @remove-channel-member="channelStore.removeChannelMembers"
        >
        </channel-component>
        <direct-message-component
          v-if="activeComponent === 'user'"
          id="direct-message"
          :key="directMessageStore.selectedUser?._uuid"
          :selected-user="directMessageStore.selectedUser"
          :typing="directMessageStore.typing"
          :is-loading-users="userStore.isLoading"
          @send-message="directMessageStore.sendMessage"
          @update:typing="directMessageStore.onTyping"
        ></direct-message-component>
      </v-container>
    </v-main>
  </div>
</template>
