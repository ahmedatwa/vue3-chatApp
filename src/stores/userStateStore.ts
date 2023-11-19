import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";
import { useMessageStore, useSessionStore } from "@/stores";
import { useChannelStore, useStorageStore } from "@/stores";
import { capitalize, isUndefined, arrayUniqueBy } from "@/helpers";
// types
import { Snackbar } from "@/types";
import { Channels } from "@/types/Channel.ts";
import { User, userMessages, DBUserMessages } from "@/types/User.ts";
import socket from "@/client";

export const useUserStore = defineStore("userState", () => {
  const users = ref<User[]>([]);
  const selectedUser = shallowRef<User | null>(null);
  const filterSearchInput = ref("");
  //const searchableKeys = ref<string[]>(["firstName", "lastName", "userName"]);
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
    return users.value
      .filter((user: User) => {
        return user.userName
          .toLowerCase()
          .includes(filterSearchInput.value.toLowerCase());
      })
      .sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.userName < b.userName) return -1;
        return a.userName > b.userName ? 1 : 0;
      });
  });

  // socket connection established
  socket.on("connect", async () => {
    const [sessions, messages, channels] = await Promise.all([
      sessionStore.getAllSessions(),
      messageStore.getMessages(sessionStore.userSessionData?._uuid!),
      channelStore.getChannels(sessionStore.userSessionData?._uuid!),
    ]);

    // channels
    if (channels?.data) {
      const socketChanneles = [] as string[]
      channels.data.forEach(async (channel: Channels) => {
        socketChanneles.push(channel._channelID)
        channelStore.channels.push({
          _id: channel._id,
          _channelID: channel._channelID,
          channelName: capitalize(channel.channelName, false),
          channelTopic: channel.channelTopic,
          channelDescription: channel.channelDescription,
          messagesDistributed: false,
          messages: [],
          membersDistributed: false,
          members: [],
          newMessages: null,
          settings: channel.settings,
          createdBy: channel.createdBy,
          createdAt: channel.createdAt,
        });
      });

      // Send Channel Ids to Server
      if (socketChanneles) {
        socket.emit("channels", socketChanneles);
      }
    }

    // Messages
    if (messages?.data) {
      messages?.data.forEach((message: DBUserMessages) => {
        message.content.forEach((content: userMessages) => {
          const otherUser =
            sessionStore.userSessionData?._uuid === content.from
              ? content.to
              : content.from;
          if (messagesPerUser.has(otherUser)) {
            messagesPerUser.get(otherUser).push(content);
          } else {
            messagesPerUser.set(otherUser, [content]);
          }
        });
      });
    }

    // sessions
    if (sessions?.data) {
      // unique array
      const unique = arrayUniqueBy(sessions.data, "_id");
      if (unique)
        unique.forEach((user: User) => {
          users.value.push({
            _id: user._id,
            _uuid: user._uuid,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: capitalize(user.firstName + " " + user.lastName),
            connected: user.connected,
            self: user._uuid === sessionStore.userSessionData?._uuid,
            image: user.image,
            email: user.email,
            selected: false,
            messages: messagesPerUser.get(user._uuid) || [],
          });
        });
    }
  });

  // fired when socket disconnected
  socket.on("disconnect", (): void => {
    users.value.forEach(async (user) => {
      if (user.self) {
        user.connected = false;
        return;
      }
    });
  });

  // notify existing users
  socket.on("client_user_new_message", (newMessage) => {
    // reset typing
    messageStore.typing = null;
    const fromSelf = (socket as any)._uuid === newMessage.from;
    users.value.forEach((user) => {
      if (user._uuid === (fromSelf ? newMessage.to : newMessage.from)) {
        user.messages.push({
          from: newMessage.from,
          to: newMessage.to,
          content: newMessage.content,
          file: newMessage.file,
          seen: false,
          fromSelf,
          createdAt: newMessage.createdAt,
        });

        if (user._uuid === newMessage.from) {
          user.newMessages = {
            total: UnreadMessagesTotal.value++,
            lastMessage: newMessage.content,
          };
          newNotification.value = {
            title: user.displayName,
            text: newMessage.content,
            type: "info",
          };
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

  socket.on("user_connected", (user) => {
    users.value.forEach((u) => {
      if (u._uuid === user._uuid) {
        u.connected = true;
        if (storageStore.appSettings?.connectionNotif) {
          newNotification.value = {
            title: u.displayName,
            text: "is online.",
            type: "success",
          };
        }
        return;
      }
    });

    const newUser = users.value.find((u) => u._uuid === user._uuid);

    if (isUndefined(newUser)) {
      users.value.push({
        _uuid: user._uuid,
        userName: user.userName,
        firstName: capitalize(user.firstName),
        lastName: capitalize(user.lastName),
        displayName: capitalize(user.firstName + " " + user.lastName),
        image: user.image,
        email: user.email,
        self: user.socketId === sessionStore.userSessionData?._uuid,
        connected: true,
        messages: messagesPerUser.get(user._uuid) || [],
      });

      if (storageStore.appSettings?.connectionNotif) {
        newNotification.value = {
          title: user.displayName,
          text: "is online.",
          type: "success",
        };
      }
    }
  });

  socket.on("user_disconnected", (_uuid) => {
    users.value.forEach(async (user) => {
      if (user._uuid === _uuid) {
        user.connected = false;
        if (storageStore.appSettings?.connectionNotif) {
          newNotification.value = {
            title: user.displayName,
            text: "is offline.",
            type: "error",
          };
        }
        return;
      }
    });
  });

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
