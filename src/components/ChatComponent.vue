<script setup lang="ts">
import { UserListComponent, MessageComponent, HeaderComponent, NotificationComponent } from "@/components";
import { ref, onUnmounted, onMounted } from "vue";
import { useUserStore, useSessionStore, useMessageStore, useRoomStore } from "@/stores";
import socket from "@/client";
import { forEach } from "lodash";
import { User, UserSessionData, Room, Settings } from "@/types";
import { useTheme } from "vuetify";


const userStore = useUserStore();
const sessionStore = useSessionStore();
const messageStore = useMessageStore();
const roomStore = useRoomStore();

const drawer = ref(true);
const _theme = useTheme();

interface Props {
  session?: UserSessionData;
}
const props = defineProps<Props>();



const goOffline = ($status: boolean) => {
  forEach(userStore.users, (user) => {
    if (user.uuid === props.session?.uuid) {
      user.connected = $status === true ? false : true;
      props.session.connected = $status === true ? false : true;
      return;
    }
  });
};

const doLogout = async (uuid: string, sessionId: string) => {
  await sessionStore.updateSession({
    uuid: uuid,
    sessionId: sessionId,
    connected: false,
  });
  if (sessionStore?.responseResult === 200)
    sessionStore.isLoggedIn = false
  localStorage.clear();
  location.reload();
};

const onSelectUser = (user: User) => {
  userStore.onSelectUser(user);
};

const filterUsers = (name: string) => {
  userStore.filterSearchInput = name;
};

const newMessage = async (payload: { text: string, file?: File }) => {
  if (payload.file) {
    messageStore.uploadedFile = payload.file;
  }
  messageStore.sendMessage(payload.text);
};

// const uploadFile = (file: File) => {
//   upload(file, messageStore.createdRoom, sessionStore.userSessionData?.uuid)
// }
const onTyping = (input: string) => {
  socket.timeout(500).emit("typing", {
    input: input.length,
    to: userStore.selectedUser?.uuid,
  });
};

const UpdateSeen = (__seen: boolean) => {

}

const updateNewMessageCount = () => {

}
socket.on("user_typing", ({ input, from, username }) => {
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

const joinRoom = (room: Room) => {

  socket.emit("on-join-room", {
    uuid: sessionStore.userSessionData?.uuid,
    _roomId: room.roomId,
    name: room.name,
    createdBy: room.createdBy
  })

}

socket.on('joined-room', (room: Room) => {
  console.log(room);

})
const updateDrawer = (val: boolean) => {
  drawer.value = val
}

const createRoom = (name: string) => {
  roomStore.createRoom(name)

}


onUnmounted(() => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("users");
  socket.off("user_connected");
  socket.off("user_disconnected");
  socket.off("server_new_message");
  socket.off("client_new_message");
  socket.off("session");
  socket.off("typing");
  socket.off("user_typing");
});


const updateSettings = (setting: Settings) => {
  userStore.settingState.connectionNotif = setting.connectionNotif
  userStore.settingState.theme = setting.theme
  _theme.global.name.value = setting.theme

}
// Notifications
const clearNotification = (value: boolean) => {
  if (value === true)
    userStore.alert = '';
}

onMounted(() => {
  _theme.global.name.value = userStore.settingState.theme

})

</script>
<template>
  <NotificationComponent :text="userStore.alert" color="info" @update:modelValue="clearNotification">
  </NotificationComponent>
  <div v-if="sessionStore.isLoggedIn">
    <UserListComponent :users="userStore.filteredUsers" :selectedUserID="userStore.selectedUser?.uuid" :drawer="drawer"
      :loading="userStore.isLoading" :rooms="roomStore.rooms" @update:selected="onSelectUser" @update:filter="filterUsers"
      @join:room="joinRoom" @create:room="createRoom">
    </UserListComponent>
    <HeaderComponent :key="props.session?.uuid" :connected="props.session?.connected" :username="props.session?.username"
      :sessionId="props.session?.sessionId" :image="props.session?.image" :uuid="props.session?.uuid" @logout="doLogout"
      @update:status="goOffline" @toggle:drawer="updateDrawer" @update:setting="updateSettings"></HeaderComponent>
    <v-main>
      <v-container>
        <section v-if="sessionStore.isLoggedIn">
          <message-component v-if="userStore.selectedUser" :selectedUser="userStore.selectedUser"
            :key="userStore.selectedUser.uuid" :room="messageStore.createdRoom" :typing="messageStore.typing"
            :username="sessionStore.userSessionData?.username" @submit:form="newMessage" @update:typing="onTyping"
            @update:new-messages-count="updateNewMessageCount" @update:seen="UpdateSeen" />
        </section>
      </v-container>
    </v-main>
  </div>
</template>