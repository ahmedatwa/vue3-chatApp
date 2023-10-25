<script setup lang="ts">
import { UserListComponent, MessageComponent, HeaderComponent, SnackbarComponent, ChannelComponent } from "@/components";
import { ref, onUnmounted, onMounted, watch, shallowRef } from "vue";
import { useUserStore, useSessionStore, useMessageStore, useChannelStore, useLoginStore } from "@/stores";
import socket from "@/client";
import { capitalize, forEach, remove, findKey, set, merge, toNumber } from "lodash";
import { User, UserSessionData, Room, Settings, Snackbar, RoomMessages } from "@/types";
import { useTheme } from "vuetify";
import { useNow, useDateFormat } from "@vueuse/core";


const userStore = useUserStore();
const userLoginStore = useLoginStore();
const sessionStore = useSessionStore();
const messageStore = useMessageStore();
const channelStore = useChannelStore();

const newSnackbar = ref<Snackbar | null>(null);
const drawer = ref(true);
const activeComponent = shallowRef("");
const _theme = useTheme();
const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");

interface Props {
  session?: UserSessionData;
}
const props = defineProps<Props>();

const goOffline = ($status: boolean) => {
  forEach(userStore.users, (user) => {
    if (user._uuid === props.session?._uuid) {
      user.connected = $status === true ? false : true;
      props.session.connected = $status === true ? false : true;
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

const onSelect = (_id: string, value: User | Room) => {
  if (_id === "user") {
    userStore.onSelectUser({ ...(value as User) });
    activeComponent.value = "user";
  } else {
    channelStore.onSelectChannel({ ...(value as Room) });
    activeComponent.value = "room";
  }
};

const filter = (name: string) => {
  userStore.filterSearchInput = name;
  channelStore.filterSearchInput = name
};

const newMessage = async (payload: { text: string; file?: File }) => {
  if (payload.file) {
    messageStore.uploadedFile = payload.file;
  }
  messageStore.sendMessage(payload.text);
};

const onTyping = (input: string) => {
  socket.timeout(500).emit("user_typing", {
    input: input.length,
    to: userStore.selectedUser?._uuid,
  });
};

const UpdateSeen = (__seen: boolean) => { };
const updateNewMessageCount = () => { };

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

// Channels

// Created Room
const newChannelMessage = async (payload: { text: string; file?: File }) => {
  if (payload.file) {
    channelStore.uploadedFile = payload.file;
  }
  channelStore.sendMessage(payload.text);
};

const deleteMessage = (message: RoomMessages) => {
  if (channelStore.selectedChannel?.messages) {
    remove(channelStore.selectedChannel?.messages, (m) => {
      return m._id === message._id
    });
    socket.emit("delete_room_message", message);
  }
};

const editUserMessage = (message: RoomMessages) => {
  const key = findKey(channelStore.selectedChannel?.messages, ($message: RoomMessages) => {
    return $message._id === message._id
  })
  if (channelStore.selectedChannel?.messages && key) {
    set(channelStore.selectedChannel?.messages, `messages[${key}].content`, message.content);
    merge(channelStore.selectedChannel?.messages[toNumber(key)], { updatedAt: formattedDate.value });
    socket.emit("edit_room_message", { channel: channelStore.selectedChannel });

  }
};

socket.on("client_create_room", (room) => {
  console.log(room);
});

socket.on("client_join_room", ({ username, roomName }) => {
  newSnackbar.value = {
    type: "success",
    text: `${capitalize(username)} has joined room ${capitalize(roomName)}`,
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

// update veutify theme
const updateSettings = (setting: Settings) => {
  userStore.settingState.connectionNotif = setting.connectionNotif;
  userStore.settingState.theme = setting.theme;
  _theme.global.name.value = setting.theme;
};

onMounted(() => {
  _theme.global.name.value = userStore.settingState.theme;
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
// Sockets

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
  <snackbar-component :alert="newSnackbar" @update:modelValue="clearNotification">
  </snackbar-component>
  <div v-if="sessionStore.isLoggedIn">
    <user-list-component :users="userStore.filteredUsers" :selectedUserID="userStore.selectedUser?._uuid"
      :room-id="channelStore.selectedChannel?._roomId" :drawer="drawer" :is-user-loading="userStore.isLoading"
      :is-room-loading="channelStore.isLoading" :channels="channelStore.filteredChannels" @update:selected="onSelect"
      @update:filter="filter" @create:room="channelStore.createChannel($event)" :allUsers="userLoginStore.users"
      :_uuid="props.session?._uuid"></user-list-component>
    <header-component :key="props.session?._uuid" :connected="props.session?.connected"
      :username="props.session?.username" :sessionId="props.session?.sessionId" :image="props.session?.image"
      :uuid="props.session?._uuid" @logout="doLogout" @update:status="goOffline" @toggle:drawer="updateDrawer"
      @update:setting="updateSettings"></header-component>
    <v-main>
      <v-container>
        <section id="channel" v-if="activeComponent === 'room'">
          <channel-component :key="channelStore.selectedChannel?._roomId" :uuid="sessionStore.userSessionData?._uuid"
            :room="channelStore.selectedChannel" :username="sessionStore.userSessionData?.username"
            @submit:form="newChannelMessage" @update:typing="onChannelTyping" :isLoading="channelStore.isLoading"
            :typing="channelStore.typing" @delete:message="deleteMessage" @edit:message="editUserMessage">
          </channel-component>
        </section>
        <section id="message" v-if="activeComponent === 'user'">
          <message-component :selectedUser="userStore.selectedUser" :key="userStore.selectedUser?._uuid"
            :room="messageStore.createdRoom" :typing="messageStore.typing" :is-loading="messageStore.isLoading"
            :username="sessionStore.userSessionData?.username" @submit:form="newMessage" @update:typing="onTyping"
            @update:new-messages-count="updateNewMessageCount" @update:seen="UpdateSeen"></message-component>
        </section>
      </v-container>
    </v-main>
  </div>
</template>
