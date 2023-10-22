import { defineStore } from "pinia";
import { ref, watch, computed, shallowRef } from "vue";
import socket from "@/client";
import { User } from "@/types";
import {
  filter,
  includes,
  forEach,
  isUndefined,
  sortBy,
  uniqBy,
  find,
  capitalize,
} from "lodash";
import { useMessageStore, useSessionStore, useRoomStore } from "@/stores";
import { useStorage } from "@vueuse/core";
import { instance } from "@/axios";


export const useUserStore = defineStore("userState", () => {
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const filterSearchInput = ref("");
  const isLoading = ref(false);
  const UnreadMessagesTotal = ref(1);
  const alert = ref("");
  const messagesPerUser = new Map();

  const settingState = useStorage(
    "APPUSSTIG",
    { theme: 'light', connectionNotif: false },
    localStorage,
    { mergeDefaults: true }
  );

  // Stores
  const messageStore = useMessageStore();
  const sessionStore = useSessionStore();
  const roomStore = useRoomStore();

  // Filter Users
  const filteredUsers = computed(() => {
    if (filterSearchInput) {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      return filter(users.value, (user) => {
        return includes(user.username, filterSearchInput.value);
      });
    }
  });

  // Global Settings
  const getSetting = (key: string): string | undefined => {
    const $setting = localStorage.getItem("APPUSSTIG");
    if ($setting) {
      let $_ = JSON.parse($setting);
      if ($_[key]) {
        return $_[key];
      }
    }
  };
  // socket connection established
  socket.on("connect", async () => {
    const [messages, sessions] = await Promise.all([
      instance.get(`/getmessages?uuid=${sessionStore.userSessionData?.uuid}`),
      sessionStore.getAllSessions(),
    ]);
    // Messages
    forEach(messages.data, (message) => {
      const $m = JSON.parse(`[${message.content}]`);
      forEach($m, (message) => {
        const otherUser =
          sessionStore.userSessionData?.uuid === message.from
            ? message.to
            : message.from;
        if (messagesPerUser.has(otherUser)) {
          messagesPerUser.get(otherUser).push(message);
        } else {
          messagesPerUser.set(otherUser, [message]);
        }
      });
    });
    // sessions
    forEach(sessions?.data, (user: User) => {
      users.value.push({
        _id: user._id,
        uuid: user.uuid,
        username: user.username,
        connected: user.connected,
        self: user.uuid === sessionStore.userSessionData?.uuid,
        image: user.image,
        selected: false,
        messages: messagesPerUser.get(user.uuid) || [],
      });
    });

    // put the current user first, and sort by username
    const sorted = sortBy(users.value, (o) => {
      if (o.self === true) return o.self;
    });
    users.value = uniqBy(sorted, "uuid");

    //get Last Selected User for default selection
    const uuid = localStorage.getItem("LTSEDUSER");
    if (uuid) {
      await instance
        .get(`/getlastselecteduser?uuid=${uuid}`)
        .then((response) => {
          selectedUser.value = {
            ...response.data,
            selected: true,
            messages: messagesPerUser.get(response.data.uuid) || [],
          };
        });
    }

    // Get Rooms
    roomStore.getRooms();
  });

  // fired when socket disconnected
  socket.on("disconnect", (): void => {
    forEach(users.value, async (user) => {
      if (user.self) {
        user.connected = false;
        return;
      }
    });
  });

  // upon user connection notify existing users
  socket.on("user_connected", (user) => {
    forEach(users.value, (u) => {
      if (u.uuid === user.uuid) {
        u.connected = true;
        if (getSetting("connectionNotif")) {
          alert.value = `${capitalize(user.username)} got connected.`;
        }
        return;
      }
    });

    const newUser = find(users.value, {
      uuid: user.uuid,
    });

    if (isUndefined(newUser)) {
      users.value.push({
        uuid: user.uuid,
        username: user.username,
        image: user.image,
        self: user.socketId === sessionStore.userSessionData?.uuid,
        connected: true,
        messages: messagesPerUser.get(user.uuid) || [],
      });
    }
  });

  socket.on("user_disconnected", (uuid) => {
    forEach(users.value, async (user) => {
      if (user.uuid === uuid) {
        user.connected = false;
        if (getSetting("connectionNotif")) {
          alert.value = `${capitalize(user.username)} got disconnected.`;
        }
        return;
      }
    });
  });

  socket.on("client_new_message", ({ from, to, content, file, createdAt }) => {
    // reset typing
    messageStore.typing = null;
    const fromSelf = (socket as any).uuid === from;
    forEach(users.value, (user) => {
      if (user.uuid === (fromSelf ? to : from)) {
        user.messages.push({
          from: from,
          to: to,
          content: content,
          file: file,
          seen: false,
          fromSelf,
          createdAt: createdAt,
        });
        // console.log(user.uuid === from)
        if (user.uuid === from) {
          user.newMessages = { total: UnreadMessagesTotal.value++, lastMessage: content};
        }
        return;
      }
    });
  });

  // User Selected
  const onSelectUser = async (user: User) => {
    selectedUser.value = {
      ...user,
      selected: true,
      newMessages: null,
      messages: user.messages,
    };
  };

  /**
   * remove new messages flag on select
   * Save Last Selected User
   */
  watch(
    () => messageStore.createdRoom,
    () => {
      const state = useStorage("LTSEDUSER", selectedUser.value?.uuid);
      state.value = selectedUser.value?.uuid;
      forEach(users.value, (user) => {
        if (selectedUser.value?.uuid === user.uuid) {
          user.newMessages = null;
        }
      });
    }
  );

  return {
    users,
    selectedUser,
    filterSearchInput,
    filteredUsers,
    isLoading,
    alert,
    settingState,
    onSelectUser,
  };
});
