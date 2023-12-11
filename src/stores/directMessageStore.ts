import { defineStore } from "pinia";
import { ref, computed, shallowRef,  } from "vue";
import { inject, reactive, watchEffect } from "vue";
import { useSessionStore, useUserStore } from "@/stores";
import { instance, __directMessageApi } from "@/axios";
import { createDateTime, esc, getRandom } from "@/helpers";
// types
import type { Snackbar, UploadedFiles } from "@/types";
import type { User, UserTyping, SendThreadPayload } from "@/types/User";
import type { NewDirectMessage, NewDirectThreadMessage } from "@/types/Sockets";
import { langKey } from "@/types/Symbols";
import socket, { _directMessageEmits, _directMessageListener } from "@/client";

export const useDirectMessageStore = defineStore("directMessageStore", () => {
  const users = ref<User[]>([]);

  const $lang = inject(langKey);
  const selectedUser = shallowRef<User | null>(null);
  const filterSearchInput = ref("");
  const newAlert = ref<Snackbar | null>(null);

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
      .post(__directMessageApi.sendMessage, {
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

  const sendThreadMessage = async (message: SendThreadPayload) => {
    if (message.files?.length) {
      await uploadFiles(message.files);
    }

    await instance
      .post(__directMessageApi.sendThreadMessage, {
        _messageID: message._messageID,
        content: esc(message.content),
        from: sessionStore.userSessionData?._uuid,
        to: selectedUser.value?._uuid,
        files: uploadedFiles.value,
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedUser.value?.messages) {
            const _message = selectedUser.value?.messages.find(
              (o) => o._id === message._messageID
            );
            if (_message) {
              _message.thread?.push(response.data);
            }
            // update socket
            socket.emit(_directMessageEmits.newThreadMessage, {
              ...response.data,
              _channelID: message._channelID
            });
          }
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
      .post(__directMessageApi.addDirectMessagesMembers, {
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
        __directMessageApi.getUserDirectMessageChannels,
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
      .get(__directMessageApi.getUserDirectMessages, {
        params: {
          _channelID,
        },
      })
      .then((response) => {
        if (response.data) {
          const found = users.value.find((u) => u._channelID === _channelID);
          if (found) {
            found.messagesDistributed = true;
          }
          if (selectedUser.value) {
            selectedUser.value?.messages?.push(...response.data);
            selectedUser.value?.messagesDistributed == true;
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

  const editMessage = async (message: {
    _messageID: string | number;
    editContent: string;
    content: string;
    updatedAt: string;
  }) => {
    if (selectedUser.value?.messages) {
      //isMessageEdit.value = true;
      await instance
        .post(__directMessageApi.updateMessage, {
          ...message,
        })
        .catch((error) => {
          newAlert.value = {
            title: error.code,
            text: error.message,
            type: "error",
          };
        })
        .finally(() => {
         // isMessageEdit.value = false;
        });
      // socket event
      // socket.emit(_directMessageEmits.editMessage, {
      //   channel: selectedChannel.value,
      // });
    }
  };

  const deleteMessage = async (_messageID: string | number) => {
    if (selectedUser.value?.messages) {
      //isMessageDelete.value = true;
      await instance
        .post(__directMessageApi.deleteMessage, { _messageID })
        .then((response) => {
          if (response.statusText === "OK" && response.status === 200) {
            // if (selectedChannel.value?.messages) {
            //   selectedChannel?.value?.messages.forEach((message, index) => {
            //     if (message._id === _messageID) {
            //       selectedChannel.value?.messages?.splice(index, 1);
            //       return;
            //     }
            //   });
            // }
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
         // isMessageDelete.value = false;
        });
    }
  };

  const uploadFiles = async (files: File[]) => {
    uploadedFiles.value = [];
    isLoading.messages = true;
    let formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    formData.append("_uuid", sessionStore.userSessionData?._uuid as string);
    await instance
      .post(__directMessageApi.upload, formData)
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
  const UnreadMessagesTotal = reactive({ count: 0 });

  const userTyping = (input: string) => {
    socket.timeout(500).emit("user_typing", {
      input: input,
      to: selectedUser.value?._uuid,
      displayName: selectedUser.value?.displayName,
    });
  };

  // Thread Typing
  const userTheadTyping = (input: string) => {
    socket.timeout(500).emit(_directMessageEmits.threadTyping, {
      _channelID: selectedUser.value?._channelID,
      to: selectedUser.value?._uuid,
      displayName: sessionStore.userSessionData?.displayName,
      input: input,
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

  socket.on(_directMessageListener.threadTyping, (event: UserTyping) => {
    if (event.input.length > 0) {
      typing.value.thread = {
        from: event.from,
        displayName: event.displayName,
        input: "",
        isTyping: true
      };
    } else {
      typing.value.thread = null;
    }
  });
  // new Message
  socket.on(
    _directMessageListener.newMessage,
    async (newMessage: NewDirectMessage) => {
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
              _channelID: newMessage._channelID,
              email: user.email,
              image: user.image,
              messagesDistributed: true,
              connected: user.connected === "1" ? true : false,
              self: false,
              visible: false,
              messages: [{ ...newMessage, fromSelf }],
              newMessages: {
                total: UnreadMessagesTotal.count++,
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
                total: UnreadMessagesTotal.count++,
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

  // new thread message event
  socket.on(
    _directMessageListener.newThreadMessage,
    (event: NewDirectThreadMessage) => {
      //reset typing
      typing.value.thread = null;
      const _user = users.value?.find((u) => {
        return u._channelID === event._channelID;
      });

      if (_user) {
        const messageFound = _user.messages?.find((m) => {
          return m._id === event._messageID;
        });

        if (messageFound) {
          messageFound.thread?.push({ ...event });
        }

        // Check for user settings
        if (_user.settings?.muteConnectionNotif === "0") {
          _user.newMessages = {
            total: UnreadMessagesTotal.count + 1,
            lastMessage: event.content,
            // from: event.displayname,
          };

          newAlert.value = {
            title: _user.displayName,
            text: event.content,
            type: "success",
          };
        }
      }
    }
  );

  socket.on(_directMessageListener.disconnect, (user) => {
    users.value.forEach((u) => {
      if (u._uuid === user._uuid) {
        u.connected = true;
        if (
          sessionStore.userSessionData?.settings?.muteConnectionNotif === "0"
        ) {
          newAlert.value = {
            title: user.displayName,
            text: "is online.",
            type: "success",
          };
        }
        return;
      }
    });
  });

  socket.on(_directMessageListener.disconnect, () => {
    users.value.forEach(async (user) => {
      if (user.self) {
        user.connected = false;
        newAlert.value = {
          title: user.displayName,
          text: "is Offline.",
          type: "success",
        };
        return;
      }
    });
  });

  // Disconnection
  socket.on(_directMessageListener.userDisconnected, (_uuid) => {
    users.value.forEach((user) => {
      if (user._uuid === _uuid) {
        user.connected = false;
        if (
          sessionStore.userSessionData?.settings?.muteConnectionNotif === "0"
        ) {
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
    sendThreadMessage,
    editMessage,
    deleteMessage,
    userTyping,
    userTheadTyping,
    getMessages,
    onSelectUser,
  };
});
