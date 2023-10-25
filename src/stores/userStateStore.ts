import { defineStore } from "pinia";
import { ref, watch, computed } from "vue";
import socket from "@/client";
import { User, Snackbar } from "@/types";
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
import { useMessageStore, useSessionStore, useChannelStore } from "@/stores";
import { useStorage } from "@vueuse/core";
import { instance } from "@/axios";


export const useUserStore = defineStore("userState", () => {
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const filterSearchInput = ref("");
  const isLoading = ref(false);
  const UnreadMessagesTotal = ref(1);
  const newNotification = ref<Snackbar| null>(null)
  const messagesPerUser = new Map();

  const settingState = useStorage(
    "APPUSSTIG",
    { theme: 'light', connectionNotif: true },
    localStorage,
    { mergeDefaults: true }
  );

  // Stores
  const messageStore = useMessageStore();
  const sessionStore = useSessionStore();
  const channelStore = useChannelStore();

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
      instance.get(`/getmessages?_uuid=${sessionStore.userSessionData?._uuid}`),
      sessionStore.getAllSessions(),
    ]);
    // Messages
    forEach(messages.data, (message) => {
      const $m = JSON.parse(`[${message.content}]`);
      forEach($m, (message) => {
        const otherUser =
          sessionStore.userSessionData?._uuid === message.from
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
        _uuid: user._uuid,
        username: user.username,
        connected: user.connected,
        self: user._uuid === sessionStore.userSessionData?._uuid,
        image: user.image,
        selected: false,
        messages: messagesPerUser.get(user._uuid) || [],
      });
    });

    // put the current user first, and sort by username
    const sorted = sortBy(users.value, (o) => {
      if (o.self === true) return o.self;
    });
    users.value = uniqBy(sorted, "_uuid");

    //get Last Selected User for default selection
    const _uuid = localStorage.getItem("LSTSECD");
    if (_uuid) {
      await instance
        .get(`/getlastselecteduser?_uuid=${_uuid}`)
        .then((response) => {
          selectedUser.value = {
            ...response.data,
            selected: true,
            messages: messagesPerUser.get(response.data._uuid) || [],
          };
        });
    }

    // Get Rooms
    channelStore.getChannels();
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
      if (u._uuid === user._uuid) {
        u.connected = true;
        if (getSetting("connectionNotif")) {
          newNotification.value = {title: capitalize(user.username), text: "got connected.", type: 'success'};
        }
        return;
      }
    });

    const newUser = find(users.value, {
      _uuid: user._uuid,
    });

    if (isUndefined(newUser)) {
      users.value.push({
        _uuid: user._uuid,
        username: user.username,
        image: user.image,
        self: user.socketId === sessionStore.userSessionData?._uuid,
        connected: true,
        messages: messagesPerUser.get(user._uuid) || [],
      });
    }
  });

  socket.on("user_disconnected", (_uuid) => {
    forEach(users.value, async (user) => {
      if (user._uuid === _uuid) {
        user.connected = false;
        if (getSetting("connectionNotif")) {
          newNotification.value = {title: capitalize(user.username), text: "got disconnected.", type: 'error'};
        }
        return;
      }
    });
  });

  socket.on("client_user_new_message", ({ from, to, content, file, createdAt }) => {
    // reset typing
    messageStore.typing = null;
    const fromSelf = (socket as any)._uuid === from;
    forEach(users.value, (user) => {
      if (user._uuid === (fromSelf ? to : from)) {
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
        if (user._uuid === from) {
          user.newMessages = { total: UnreadMessagesTotal.value++, lastMessage: content};
          newNotification.value = {title: capitalize(user.username), text: content}
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
      messages: [...user.messages],
    };
  };

  /**
   * remove new messages flag on select
   * Save Last Selected User
   */
  watch(
    () => messageStore.createdRoom,
    () => {
      const state = useStorage("LSTSECD", selectedUser.value?._uuid);
      state.value = selectedUser.value?._uuid;
      forEach(users.value, (user) => {
        if (selectedUser.value?._uuid === user._uuid) {
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
    newNotification,
    settingState,
    onSelectUser,
  };
});
