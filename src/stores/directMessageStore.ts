import { defineStore } from "pinia";
import { ref, computed, shallowRef } from "vue";
import { inject, reactive, watchEffect } from "vue";
import { useSessionStore, useUserStore } from "@/stores";
import { instance, _directMessageApi } from "@/axios";
import { createDateTime, getRandom } from "@/helpers";
// types
import type {
  Snackbar,
  UploadedFiles,
  MessageReactions,
} from "@/types/Chat.d.ts";
import type { SendThreadPayload, Typing, TenorGifs } from "@/types/Chat.d.ts";
import type { User } from "@/types/User.d.ts";
import type {
  NewDirectMessage,
  NewDirectThreadMessage,
} from "@/types/Sockets.d.ts";
import { langKey } from "@/types/Symbols";
import socket, { _directMessageEmits, _directMessageListener } from "@/client";
import { sanitize } from "@/composables/useDOMPurify";

export const useDirectMessageStore = defineStore("directMessageStore", () => {
  // Stores
  const sessionStore = useSessionStore();
  const userStore = useUserStore();

  const users = ref<User[]>([]);
  const $lang = inject(langKey);
  const selectedUser = shallowRef<User | null>(null);
  const filterSearchInput = ref("");
  const uploadedFiles = ref<UploadedFiles[] | null>(null);
  const newAlert = ref<Snackbar | null>(null);
  const paginationLimit = ref(10);

  const typing = ref<Record<"messages" | "thread", Typing | null>>({
    messages: null,
    thread: null,
  });
  const isLoading = reactive({
    thread: false,
    messages: false,
    users: false,
  });

  const isScroll = shallowRef<{ start: boolean; end: boolean } | null>(null);

  // Filter Users
  const filteredUsers = computed(() => {
    return users.value
      .filter((u) => {
        return u.visible !== false;
      })
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
    files?: File[] | TenorGifs | null;
  }) => {
    isScroll.value = null;
    if (selectedUser.value?._channelID === null) {
      await addChannelsMember(getRandom(30));
    }

    if (message.files) {
      await uploadFiles(message.files);
    }

    // Avoid empty DB Records
    if (uploadedFiles.value === null && message.content.length < 1) {
      return;
    }

    await instance
      .post(_directMessageApi.sendMessage, {
        content: sanitize(message.content),
        from: sessionStore.userSessionData?._uuid,
        to: selectedUser.value?._uuid,
        _channelID: selectedUser.value?._channelID,
        files: uploadedFiles.value?.map((file) => file._id) || null,
        createdAt: createDateTime(),
      })
      .then(async (response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedUser.value?.messages) {
            selectedUser.value?.messages.push({
              ...response.data,
              files: uploadedFiles.value || null,
              thread: [],
            });

            // update server
            socket.emit(_directMessageEmits.newMessage, {
              ...response.data,
            });
            isScroll.value = {
              start: false,
              end: true,
            };
            uploadedFiles.value = null;
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

  const sendThreadMessage = async (message: SendThreadPayload) => {
    if (message.files) {
      await uploadFiles(message.files);
    }
    // Avoid empty DB Records
    if (uploadedFiles.value === null && message.content.length < 1) {
      return;
    }

    await instance
      .post(_directMessageApi.sendThreadMessage, {
        _messageID: message._messageID,
        content: sanitize(message.content),
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
              _channelID: message._channelID,
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
      .post(_directMessageApi.addDirectMessagesMembers, {
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
        _directMessageApi.getUserDirectMessageChannels,
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

  const getMessages = async (
    _channelID: string | number,
    limit: number,
    offset: number,
    unshift: boolean
  ) => {
    isLoading.messages = true;
    isScroll.value = null;
    return instance
      .get(_directMessageApi.getUserDirectMessages, {
        params: {
          _channelID,
          limit: limit ? limit : paginationLimit.value,
          offset: offset > 0 ? offset : 0,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedUser.value) {
            if (unshift) {
              selectedUser.value.messages?.unshift(...response.data);
              isScroll.value = {
                start: true,
                end: false,
              };
            } else {
              selectedUser.value?.messages?.push(...response.data);
              isScroll.value = {
                start: false,
                end: true,
              };
            }

            const user = users.value.find((u) => u._channelID === _channelID);
            if (user) {
              user.messagesDistributed = true;
            }
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

  const getTotalMessages = async (_channelID: string) => {
    try {
      const response = await instance.get(
        _directMessageApi.getUserTotalMessages,
        {
          params: {
            _channelID,
          },
        }
      );
      return response.data as number;
    } catch (error: any) {
      newAlert.value = {
        title: error.code,
        text: error.message,
        type: "error",
      };
    }
  };

  const editMessage = async (message: {
    _messageID: string | number;
    editContent: string;
    content: string;
    updatedAt: string;
  }) => {
    if (selectedUser.value?.messages) {
      isLoading.messages = true;
      await instance
        .post(_directMessageApi.updateMessage, {
          _id: message._messageID,
          content: sanitize(message.content),
          editContent: sanitize(message.editContent),
          updatedAt: message.updatedAt,
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
    }
  };

  const deleteMessage = async (_messageID: string | number) => {
    if (selectedUser.value?.messages) {
      isLoading.messages = true;
      await instance
        .post(_directMessageApi.deleteMessage, { _id: _messageID })
        .then((response) => {
          if (response.statusText === "OK" && response.status === 200) {
            if (selectedUser.value?.messages) {
              selectedUser?.value?.messages.forEach((message, index) => {
                if (message._id === _messageID) {
                  selectedUser.value?.messages?.splice(index, 1);
                  return;
                }
              });
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
    }
  };

  const uploadFiles = async (
    files: File[] | TenorGifs,
    _messageID?: string | number
  ) => {
    uploadedFiles.value = [];
    isLoading.messages = true;
    let formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("files[]", file));
    } else {
      for (const key in files as TenorGifs) {
        const element = files[key as keyof typeof files];
        formData.append(key, element as string);
      }
    }

    formData.append("_channelID", selectedUser.value?._channelID as string);
    formData.append("_uuid", sessionStore.userSessionData?._uuid as string);

    await instance
      .post(_directMessageApi.upload, formData)
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

  const deleteFiles = async (file: {
    fileID: string | number;
    messageID: string | number;
  }) => {
    await instance
      .post(_directMessageApi.deleteFile, {
        ...file,
      })
      .then((response) => {
        if (response.status === 200) {
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: "",
          text: error.code + " " + error.message,
          type: "error",
        };
      });
  };

  // User Selected
  const onSelectUser = async (user: User) => {
    selectedUser.value = {
      ...user,
      selected: true,
      newMessages: null,
      messages: user.messages || [],
    };
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
          const totalMessages = await getTotalMessages(
            selectedUser.value._channelID
          );
          if (totalMessages) {
            const offset =
              totalMessages > paginationLimit.value
                ? Math.ceil(totalMessages - paginationLimit.value)
                : 0;
            user.pagination = {
              total: totalMessages,
              limit: paginationLimit.value,
              offset,
            };
            await getMessages(
              selectedUser.value?._channelID,
              paginationLimit.value,
              offset,
              false
            );
          }
        }
      }
    }
  });

  const updateMessageReaction = (reaction: MessageReactions) => {
    const total = shallowRef(1);
    instance
      .post(_directMessageApi.updateMessageReaction, {
        ...reaction,
      })
      .then((response) => {
        if (response.status === 200) {
          const message = selectedUser.value?.messages?.find(
            (m) => m._id === reaction._messageID
          );
          if (message?.reactions) {
            if (message.reactions?.length > 0) {
              const reactionIndex = message.reactions?.findIndex(
                (o) => o._uuid === reaction._uuid
              );
              if (reactionIndex > -1) {
                message.reactions?.splice(reactionIndex, 1);
              }
            } else {
              message.reactions?.push({
                ...response.data,
                total: total.value++,
              });
            }
          } else {
            message?.reactions?.push({
              ...response.data,
              total: total.value++,
            });
          }
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      });
  };
  // Sockets
  const UnreadMessagesTotal = reactive({ count: 0 });

  const userTyping = (input: number) => {
    socket.timeout(500).emit(_directMessageEmits.typing, {
      input: input,
      to: selectedUser.value?._uuid,
      displayName: selectedUser.value?.displayName,
    });
  };

  // Thread Typing
  const userTheadTyping = (input: number) => {
    socket.timeout(500).emit(_directMessageEmits.threadTyping, {
      _channelID: selectedUser.value?._channelID,
      to: selectedUser.value?._uuid,
      displayName: sessionStore.userSessionData?.displayName,
      input: input,
    });
  };

  socket.on(_directMessageListener.typing, (event: Typing) => {
    if (event.input > 0 && event.from === selectedUser.value?._uuid) {
      typing.value.messages = {
        from: event.from,
        displayName: event.displayName,
        input: event.input,
      };
    } else {
      typing.value.messages = null;
    }
  });

  socket.on(_directMessageListener.threadTyping, (event: Typing) => {
    if (event.input > 0) {
      typing.value.thread = {
        from: event.from,
        displayName: event.displayName,
        input: event.input,
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
      if (!newUser) {
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
              settings: user.settings,
              messagesDistributed: true,
              connected: user.connected === "1" ? true : false,
              self: false,
              visible: user.visible,
              pagination: null,
              messages: [{ ...newMessage, fromSelf }],
              newMessages: {
                total: UnreadMessagesTotal.count + 1,
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
              files: newMessage.file,
              seen: false,
              fromSelf,
              createdAt: newMessage.createdAt,
            });

            if (user._uuid === newMessage.from) {
              user.newMessages = {
                total: UnreadMessagesTotal.count + 1,
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
      isScroll.value = {
        start: false,
        end: true,
      };
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

  socket.on(_directMessageListener.connected, async (user) => {
    await userStore.updateUser(user._uuid, { key: "connected", value: true });
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

  socket.on(_directMessageListener.disconnect, async (_uuid) => {
    await userStore.updateUser(_uuid, { key: "connected", value: false });
    users.value.forEach((user: User) => {
      if (user._uuid === _uuid) {
        user.connected = false;
        newAlert.value = {
          title: user.displayName,
          text: "is Offline.",
          type: "success",
        };
      }
    });
  });

  // Disconnection
  socket.on(_directMessageListener.userDisconnected, async (_uuid) => {
    await userStore.updateUser(_uuid, { key: "connected", value: false });
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
    paginationLimit,
    isScroll,
    updateMessageReaction,
    getUserDirectMessageChannels,
    sendMessage,
    sendThreadMessage,
    editMessage,
    deleteMessage,
    userTyping,
    userTheadTyping,
    getMessages,
    onSelectUser,
    deleteFiles,
    //
    uploadedFiles,
  };
});
