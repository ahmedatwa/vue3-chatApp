<script setup lang="ts">
import {
  UserListComponent,
  MessageComponent,
  HeaderComponent,
  SnackbarComponent,
  ChannelComponent,
} from "@/components";
import { ref, onUnmounted, onMounted, watch, shallowRef } from "vue";
import {
  useUserStore,
  useSessionStore,
  useMessageStore,
  useChannelStore,
  useLoginStore,
  useStorageStore,
} from "@/stores";
import socket from "@/client";
import { capitalize, forEach, find, isUndefined } from "lodash";
import {
  User,
  UserSessionData,
  Channels,
  Settings,
  Snackbar,
  ChannelMessages,
} from "@/types";
import { useTheme } from "vuetify";
import { watchEffect } from "vue";

const userStore = useUserStore();
const userLoginStore = useLoginStore();
const sessionStore = useSessionStore();
const messageStore = useMessageStore();
const channelStore = useChannelStore();
const storageStore = useStorageStore();

const newSnackbar = ref<Snackbar | null>(null);
const drawer = ref(true);
const activeComponent = shallowRef("");
const lastSelectedElement = ref<string | number | null>(null);
const _theme = useTheme();

interface Props {
  session?: UserSessionData;
}
const props = defineProps<Props>();

const goOffline = ($status: boolean) => {
  forEach(userStore.users, (user) => {
    if (user._uuid === props.session?._uuid) {
      user.connected = $status === true ? false : true;
      if (props.session) {
        props.session.connected = $status === true ? false : true;
      }
      return;
    }
  });
};

const doLogout = async (_uuid: string, sessionId: string) => {
  await sessionStore.updateSession({
    _uuid: _uuid,
    sessionId: sessionId,
    connected: false,
  });
  if (sessionStore?.responseResult === 200) sessionStore.isLoggedIn = false;
  localStorage.clear();
  location.reload();
};

const onSelect = (_id: string, key: string, value: User | Channels) => {
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
  channelStore.filterSearchInput = name
};

const newMessage = async (payload: {
  _threadId: string | null;
  text: string;
  file?: File;
}) => {
  if (payload.file) {
    messageStore.uploadedFile = payload.file;
  }
  messageStore.sendMessage(payload._threadId, payload.text);
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
      username: username,
      isTyping: true,
    };
  } else {
    messageStore.typing = null;
  }
});

// ----------- Channels ---------- //
const newChannelMessage = async (payload: { text: string; file?: File }) => {
  if (payload.file) {
    channelStore.uploadedFile = payload.file;
  }
  channelStore.sendMessage(payload.text);
};

const onAlterChannelMessage = (key: string, message: ChannelMessages) => {
  channelStore.alterChannelMessage(key, message);
};

socket.on("client_create_channel", (room) => {
  console.log(room);
});

socket.on("client_join_channel", ({ username, roomName }) => {
  newSnackbar.value = {
    type: "success",
    text: `${capitalize(username)} has joined room ${capitalize(roomName)}`,
  };
});

socket.on("client_add_users_to_channel", ({ username, roomName, to }) => {
  console.log(channelStore.selectedChannel);
  if (to === sessionStore.userSessionData?._uuid)
    newSnackbar.value = {
      type: "success",
      text: `${capitalize(username)} has created room ${capitalize(roomName)}`,
    };
});

const onChannelTyping = (input: string) => {
  socket.timeout(500).emit("room_typing", {
    _roomId: channelStore.selectedChannel?._roomId,
    input: input.length,
  });
};

socket.on("client_room_typing", ({ input, from, username }) => {
  if (input > 1) {
    channelStore.typing = {
      from: from,
      username: username,
      isTyping: true,
    };
  } else {
    channelStore.typing = null;
  }
});
// ----------- Channels End ---------- //

// update veutify theme
const updateSettings = (setting: Settings) => {
  storageStore.setAppSettings({
    theme: setting.theme,
    connectionNotif: setting.connectionNotif,
  });
  _theme.global.name.value = setting.theme;
};

onMounted(() => {
  if (storageStore.getAppSettings("theme")) {
    _theme.global.name.value = storageStore.getAppSettings("theme") as string;
  }
  const $_ = storageStore.getLastSelected();
  if ($_) {
    lastSelectedElement.value = $_._id;
    activeComponent.value = $_.comp;
    if ($_.comp === "user") {
      watchEffect(() => {
        if (userStore.users) {
          const user = find(userStore.users, ["_uuid", $_._id]);
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
          const channel = find(channelStore.channels, ["_roomId", $_._id]);
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

const updateDrawer = (val: boolean) => {
  drawer.value = val;
};

// Alerts
const clearNotification = (value: boolean) => {
  if (value === true) newSnackbar.value = null;
};

watch(
  () => userStore.newNotification,
  (NewA) => {
    newSnackbar.value = NewA;
  }
);

watch(
  () => channelStore.newNotification,
  (NewA) => {
    newSnackbar.value = NewA;
  }
);
// User Sockets
socket.on("user_connected", (user) => {  
    forEach(userStore.users, (u) => {
      if (u._uuid === user._uuid) {
        u.connected = true;
        if (storageStore.getAppSettings("connectionNotif")) {
          userStore.newNotification = {
            title: capitalize(user.username),
            text: "got connected.",
            type: "success",
          };
        }
        return;
      }
    });

    const newUser = find(userStore.users, {
      _uuid: user._uuid,
    });

    if (isUndefined(newUser)) {
      userStore.users.push({
        _uuid: user._uuid,
        username: user.username,
        image: user.image,
        self: user.socketId === sessionStore.userSessionData?._uuid,
        connected: true,
        messages: userStore.messagesPerUser.get(user._uuid) || [],
      });
    }
  });

socket.on("user_disconnected", (_uuid) => {
  forEach(userStore.users, async (user) => {
    if (user._uuid === _uuid) {
      user.connected = false;
      if (storageStore.getAppSettings("connectionNotif")) {
        userStore.newNotification = {
          title: capitalize(user.username),
          text: "got disconnected.",
          type: "error",
        };
      }
      return;
    }
  });
});

onUnmounted(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("users");
  socket.off("user_connected");
  socket.off("user_disconnected");
  socket.off("new_message");
  socket.off("client_new_message");
  socket.off("session");
  socket.off("user_typing");
  socket.off("client_user_typing");
  socket.off("room_typing");
  socket.off("client_room_typing");
  socket.off("new_room_message");
  socket.off("client_new_room_message");
});
</script>
<template>
  <snackbar-component
    :alert="newSnackbar"
    @update:modelValue="clearNotification"
  >
  </snackbar-component>
  <div v-if="sessionStore.isLoggedIn">
    <user-list-component
      :drawer="drawer"
      :users="userStore.filteredUsers"
      :channels="channelStore.filteredChannels"
      :selected-channel="channelStore.selectedChannel"
      :is-room-loading="channelStore.isLoading"
      :is-user-loading="userStore.isLoading"
      :_uuid="props.session?._uuid"
      :last-selected-element="lastSelectedElement"
      @on:delete:channel="channelStore.deleteChannel($event)"
      @update:selected="onSelect"
      @user:created:room="channelStore.createChannel($event)"
    ></user-list-component>

    <header-component
      :key="props.session?._uuid"
      :connected="props.session?.connected"
      :username="props.session?.username"
      :sessionId="props.session?.sessionId"
      :image="props.session?.image"
      :uuid="props.session?._uuid"
      @logout="doLogout"
      @update:status="goOffline"
      @toggle:drawer="updateDrawer"
      @update:setting="updateSettings"
      @update:search="onSearch"
    ></header-component>
    <v-main>
      <v-container>
        <section id="channel" v-if="activeComponent === 'room'">
          <channel-component
            :key="channelStore.selectedChannel?._roomId"
            :uuid="sessionStore.userSessionData?._uuid"
            :currentChannel="channelStore.selectedChannel"
            :username="sessionStore.userSessionData?.username"
            :is-loading="channelStore.isLoading"
            :typing="channelStore.typing"
            :all-users="userLoginStore.users"
            @update:channel:users="channelStore.addChannelUsers"
            @submit:form="newChannelMessage"
            @update:typing="onChannelTyping"
            @alter:message="onAlterChannelMessage"
          >
          </channel-component>
        </section>
        <section id="message" v-if="activeComponent === 'user'">
          <message-component
            :selected-user="userStore.selectedUser"
            :key="userStore.selectedUser?._uuid"
            :room="messageStore.createdRoom"
            :typing="messageStore.typing"
            :is-loading="sessionStore.isLoading"
            :username="sessionStore.userSessionData?.username"
            @submit:form="newMessage"
            @update:typing="onTyping"
            @update:new-messages-count="updateNewMessageCount"
            @update:seen="UpdateSeen"
          ></message-component>
        </section>
      </v-container>
    </v-main>
  </div>
</template>
