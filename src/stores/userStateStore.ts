import { defineStore } from "pinia";
import { ref, computed, watch, shallowRef, watchEffect } from "vue";
import socket from "@/client";
import { User, Snackbar } from "@/types";
import {
  filter,
  includes,
  forEach,
  sortBy,
  uniqBy,
  toLower,
  capitalize,
} from "lodash";
import {
  useMessageStore,
  useSessionStore,
  useChannelStore,
  useStorageStore,
} from "@/stores";
import { instance } from "@/axios";

export const useUserStore = defineStore("userState", () => {
  const users = shallowRef<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const filterSearchInput = ref("");
  const isLoading = ref(false);
  const UnreadMessagesTotal = ref(1);
  const newNotification = ref<Snackbar | null>(null);
  const messagesPerUser = new Map();

  // Stores
  const messageStore = useMessageStore();
  const sessionStore = useSessionStore();
  const channelStore = useChannelStore();
  const storageStore = useStorageStore();

  // Filter Users
  const filteredUsers = computed(() => {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      return filter(users.value, (user) => {
        return includes(user.username, toLower(filterSearchInput.value));
      });
  });

  // socket connection established
  socket.on("connect", async () => {
    const [sessions, messages, channels] = await Promise.all([
      sessionStore.getAllSessions(),
      messageStore.getMessages(sessionStore.userSessionData?._uuid!),
      channelStore.getChannels(sessionStore.userSessionData?._uuid!),
    ]);

    // Get Rooms
    channelStore.channels = channels?.data;
    // const sortedChannels = sortBy(channelStore.channels, (channel) => {
    //   return channel.name
    // });
    // console.log(sortedChannels);
    
    // Messages
    forEach(messages?.data, (thread) => {
      forEach(thread.content, (message) => {
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
    // const _uuid = localStorage.getItem("LSTSECD");
    const seletcted = storageStore.getLastSelected();
    if (seletcted) {
      await instance
        .get(`/getlastselecteduser?_uuid=${seletcted._id}`)
        .then((response) => {
          selectedUser.value = {
            ...response.data,
            selected: true,
            messages: messagesPerUser.get(response.data._uuid) || [],
          };
        });
    }
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

  socket.on(
    "client_user_new_message",
    ({ from, to, content, file, createdAt }) => {
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
            user.newMessages = {
              total: UnreadMessagesTotal.value++,
              lastMessage: content,
            };
            newNotification.value = {
              title: capitalize(user.username),
              text: content,
            };
          }
          return;
        }
      });
    }
  );

  // User Selected
  const onSelectUser = async (user: User) => {
    selectedUser.value = {
      ...user,
      selected: true,
      newMessages: null,
      messages: [...user.messages],
    };
  };

    // const Search = computed(() => {
    //   if(filterSearchInput.value) {
    //   isLoading.value = true;
    //   setTimeout(() => {
    //     isLoading.value = false;
    //   }, 500);
    //   return filter(users.value, (user) => {
    //     return includes(user.username, toLower(filterSearchInput.value));
    //   });
    //   // });
    // } else {
    //  return  users.value;
    // }
    
  //});
  /**
   * remove new messages flag on select
   * Save Last Selected User
   */
  // watch(
  //   () => messageStore.createdRoom,
  //   () => {
  //     const state = useStorage("LSTSELECD", selectedUser.value?._uuid);
  //     state.value = selectedUser.value?._uuid;
  //     forEach(users.value, (user) => {
  //       if (selectedUser.value?._uuid === user._uuid) {
  //         user.newMessages = null;
  //       }
  //     });
  //   }
  // );

  return {
    users,
    selectedUser,
    filterSearchInput,
    filteredUsers,
    isLoading,
    newNotification,
    messagesPerUser,
    onSelectUser,
  };
});
