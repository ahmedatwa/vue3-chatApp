import { defineStore } from "pinia";
import { ref, computed, shallowRef, watchEffect } from "vue";
import { inject, reactive } from "vue";
import { useSessionStore, useStorageStore } from "@/stores";
import { useUserStore } from "@/stores";
import { instance, directMessageApi } from "@/axios";
import { createDateTime, esc } from "@/helpers";

// types
import type { Snackbar, UploadedFiles } from "@/types";
import type { User, UserTyping, UserMessages } from "@/types/User";
import { langKey } from "@/types/Symbols";
import socket, { _directMessageEmits, _directMessageListener } from "@/client";
import { nanoid } from "nanoid";

export const useDirectMessageStore = defineStore("directMessageStore", () => {
  const users = ref<User[]>([]);

  const $lang = inject(langKey);
  const selectedUser = shallowRef<User | null>(null);
  const filterSearchInput = ref("");
  const newAlert = ref<Snackbar | null>(null);
  const getRandom = (len: number = 36) => {
    return nanoid(len);
  };

  const typing = ref<Record<"messages" | "thread", UserTyping | null>>({
    messages: null,
    thread: null,
  });

  const uploadedFiles = ref<UploadedFiles[]>([]);

  const isLoading = reactive({
    thread: false,
    messages: false,
    users: false,
  });

  const messagesPerUser = ref(new Map());
  const otherUsers = ref<string[]>([]);

  // Stores
  const sessionStore = useSessionStore();
  const storageStore = useStorageStore();
  const userStore = useUserStore();

  // Filter Users
  const filteredUsers = computed(() => {
    return users.value
      .filter((user: User) => {
        return user.displayName
          .toLowerCase()
          .includes(filterSearchInput.value.toLowerCase());
      })
      .sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.displayName < b.displayName) return -1;
        return a.displayName > b.displayName ? 1 : 0;
      });
  });

  const sendMessage = async (message: {
    content: string;
    files?: File[] | null;
  }) => {
    if (selectedUser.value?._channelID === null) {
      await addChannelsMember(getRandom(30));
    }

    if (message.files?.length) {
      await uploadFiles(message.files);
    }

    await instance
      .post(directMessageApi.__sendMessage, {
        content: esc(message.content),
        editContent: "",
        from: sessionStore.userSessionData?._uuid,
        to: selectedUser.value?._uuid,
        _channelID: selectedUser.value?._channelID,
        files: uploadedFiles.value,
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedUser.value?.messages)
            selectedUser.value?.messages.push({
              ...response.data,
              thread: [],
            });
          // update server
          socket.emit(_directMessageEmits.newMessage, {
            ...response.data,
          });
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: $lang?.getLine("channel.error.send"),
          text: error.code + " " + error.message,
          type: "error",
          timeout: -1,
          location: "",
        };
      });
  };

  const addChannelsMember = async (_channelID: string) => {
    await instance
      .post(directMessageApi.__addDirectMessagesMembers, {
        _channelID,
        from: sessionStore.userSessionData?._uuid,
        to: selectedUser.value?._uuid,
      })
      .then((response) => {
        if (response.data) {
          const user = users.value.find(
            (u) => u._uuid === selectedUser.value?._uuid
          );
          if (user) {
            user._channelID = _channelID;
          }
          if (selectedUser.value) {
            selectedUser.value._channelID = _channelID;
          }
        }
      });
  };

  const getUserDirectMessageChannels = async (_uuid: string) => {
    try {
      isLoading.users = true;
      const response = await instance.get(
        directMessageApi.__getUserDirectMessageChannels,
        {
          params: {
            _uuid,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      newAlert.value = {
        title: $lang?.getLine("channel.error.send"),
        text: error.code + " " + error.message,
        type: "error",
        timeout: -1,
        location: "",
      };
    } finally {
      isLoading.users = false;
    }
  };

  const getMessages = async (_channelID: string) => {
    isLoading.messages = true;
    return instance
      .get(directMessageApi.__getUserDirectMessages, {
        params: {
          _channelID,
        },
      })
      .then((response) => {
        if (response.data) {
          const found = users.value.find(u => u._channelID === _channelID)
          if (found) {
            found.messages?.push(...response.data)
            found.messagesDistributed = true
          }
          if(selectedUser.value) {
            selectedUser.value?.messages?.push(...response.data);
            selectedUser.value?.messagesDistributed == true  
          }
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.messages = false;
      });
  };

  const uploadFiles = async (files: File[]) => {
    uploadedFiles.value = [];
    isLoading.messages = true;
    let formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    formData.append("_uuid", sessionStore.userSessionData?._uuid as string);
    await instance
      .post(directMessageApi.__upload, formData)
      .then((response) => {
        if (response.status === 200 && response.statusText === "OK") {
          uploadedFiles.value?.push(...response.data);
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: $lang?.getLine("error.upload"),
          text: error.code + " " + error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.messages = false;
      });
  };

  // User Selected
  const onSelectUser = async (user: User) => {
    selectedUser.value = {
      ...user,
      selected: true,
      newMessages: null,
      messages: user.messages || [],
      //     ? user.messages
      //     : messagesPerUser.value.get(user._uuid),
      // };
    };
  };

  const removeUser = (_uuid: string) => {
    const index = users.value.findIndex((u) => u._uuid === _uuid);
    if (index) {
      users.value.splice(index, 1);
      selectedUser.value = null;
    }
  };

  watchEffect(async () => {
    if (selectedUser.value?.selected) {
      const user = users.value.find(
        (u) => u._uuid === selectedUser.value?._uuid
      );
      if (user) {
        if (
          !user.messagesDistributed &&
          selectedUser.value?._channelID !== null
        ) {
          await getMessages(selectedUser.value?._channelID);
        }
      }
    }
  });
  // Sockets
  const userTyping = (input: string) => {
    socket.timeout(500).emit("user_typing", {
      input: input,
      to: selectedUser.value?._uuid,
      displayName: selectedUser.value?.displayName,
    });
  };

  socket.on(_directMessageListener.typing, (event: UserTyping) => {
    if (event.input.length > 0 && event.from === selectedUser.value?._uuid) {
      typing.value.messages = {
        from: event.from,
        displayName: event.displayName,
        input: "",
        isTyping: true,
      };
    }
  });

  // new Message
  const UnreadMessagesTotal = ref(1);
  socket.on(
    _directMessageListener.newMessage,
    async (newMessage: UserMessages) => {
      //reset typing
      typing.value.messages = null;
      const fromSelf = (socket as any)._uuid === newMessage.from;
      // Push new User
      const newUser = users.value.find((u) => u._uuid === newMessage.from);
      if (newUser === undefined) {
        const response = await userStore.getUser(newMessage.from);
        if (response?.data) {
          response.data.forEach((user: User) => {
            users.value.push({
              _id: user._id,
              _uuid: user._uuid,
              firstName: user.firstName,
              lastName: user.lastName,
              displayName: user.displayName,
              _channelID: user._channelID,
              email: user.email,
              image: user.image,
              messagesDistributed: false,
              connected: user.connected === "1" ? true : false,
              self: false,
              visible: false,
              messages: [{ ...newMessage, fromSelf }],
              newMessages: {
                total: UnreadMessagesTotal.value++,
                lastMessage: newMessage.content,
              },
              createdAt: user.createdAt,
            });
          });
        }
      } else {
        users.value.forEach((user) => {
          if (user._uuid === (fromSelf ? newMessage.to : newMessage.from)) {
            user.messages?.push({
              _id: newMessage._id,
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
              newAlert.value = {
                title: user.displayName,
                text: newMessage.content,
                type: "info",
              };
            }
            return;
          }
        });
      }
    }
  );

  socket.on("user_connected", (user) => {
    users.value.forEach((u) => {
      if (u._uuid === user._uuid) {
        u.connected = true;
        // if (selectedUser.value?.settings?.muteNotification) {
        //   newAlert.value = {
        //     title: user.displayName,
        //     text: "is online.",
        //     type: "success",
        //   };
        // }
        return;
      }
    });

    //const newUser = users.value.find((u) => u._uuid === user._uuid);
    // if (newUser === undefined) {
    //   users.value.push({
    //     _id: user._id,
    //     _uuid: user._uuid,
    //     userName: user.userName,
    //     firstName: capitalize(user.firstName),
    //     lastName: capitalize(user.lastName),
    //     displayName: capitalize(user.firstName + " " + user.lastName),
    //     image: user.image,
    //     email: user.email,
    //     self: user.socketId === sessionStore.userSessionData?._uuid,
    //     connected: true,
    //     messages: messagesPerUser.value.get(user._uuid) || [],
    //     settings: null,
    //     createdAt: user.createdAt,
    //   });

    if (selectedUser.value?.settings?.muteConnectionNotif === false) {
      newAlert.value = {
        title: user.displayName,
        text: "is online.",
        type: "success",
      };
      // }
    }
  });

  socket.on("disconnect", (): void => {
    users.value.forEach(async (user) => {
      if (user.self) {
        user.connected = false;
        return;
      }
    });
  });

  // Disconnection
  socket.on(_directMessageListener.userDisconnected, (_uuid) => {
    users.value.forEach((user) => {
      if (user._uuid === _uuid) {
        user.connected = false;
        if (storageStore.userStorageSettings?.muteConnectionNotif) {
          newAlert.value = {
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
    newAlert,
    typing,
    isLoading,
    filteredUsers,
    messagesPerUser,
    otherUsers,
    getUserDirectMessageChannels,
    removeUser,
    sendMessage,
    userTyping,
    getMessages,
    onSelectUser,
  };
});
