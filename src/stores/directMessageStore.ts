import { defineStore } from "pinia";
import { ref, computed, shallowRef, watchEffect, inject } from "vue";
import { useUserStore, useStorageStore } from "@/stores";
import { instance, directMessageApi } from "@/axios";
import { capitalize, createDateTime, esc } from "@/helpers";

// types
import { Snackbar, UploadedFiles } from "@/types";
import type { User, TypingEvent } from "@/types/User";
import { langKey } from "@/types/Symbols";
import socket, { _directMessageEmits, _directMessageListener } from "@/client";

export const useDirectMessageStore = defineStore("directMessageStore", () => {
  const users = ref<User[]>([]);
  const $lang = inject(langKey);
  const selectedUser = shallowRef<User | null>(null);
  const filterSearchInput = ref("");
  const newAlert = ref<Snackbar | null>(null);
  const typing = ref<TypingEvent | null>(null);
  const uploadedFiles = ref<UploadedFiles[]>([]);

  const messagesPerUser = new Map();

  const isLoading = shallowRef<{ users: boolean; messages: boolean }>({
    users: false,
    messages: false,
  });

  const UnreadMessagesTotal = shallowRef(1);

  // Stores
  const userStore = useUserStore();
  const storageStore = useStorageStore();

  // Filter Users
  const filteredUsers = computed(() => {
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

  const sendMessage = async (message: {
    content: string;
    files?: File[] | null;
  }) => {
    isLoading.value.messages = true;
    // save Files
    if (message.files?.length) {
      await uploadFiles(message.files);
    }
    // save sent Message
    await instance
      .post(directMessageApi.__addMessage, {
        _channelID: selectedUser.value?._channelID,
        content: esc(message.content),
        editContent: "",
        createdAt: createDateTime(),
        from: userStore.userSessionData?._uuid,
        fromName: userStore.userSessionData?.displayName,
        to: selectedUser.value?._uuid,
        toName: selectedUser.value?.displayName,
        files: uploadedFiles.value,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
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
          title: $lang?.getLine("error.sendMessage"),
          text: error.code + " " + error.message,
          type: "error",
          timeout: -1,
          location: "",
        };
      })
      .finally(() => {
        isLoading.value.messages = false;
      });
  };

  const getMessages = async (_uuid: string) => {
    //isLoading.value.messages = true;
    return instance.get(directMessageApi.__getMessages, {
      params: {
        _uuid: _uuid,
      },
    });
  };
  // .then((response) => {
  //   if (response.data) {
  //     console.log(response.data);

  // selectedUser.value?.messages.push(...response.data)
  // const user = users.value.find((u) => u._uuid === from);
  // if(user) {
  //   user.messagesDistributed = true
  // }

  // response?.data.forEach((message: DBUserMessages) => {
  //   // message.content.forEach((content: UserMessages) => {
  //   //   const otherUser =
  //   //     userStore.userSessionData?._uuid === content.from
  //   //       ? content.to
  //   //       : content.from;
  //   //   if (messagesPerUser.has(otherUser)) {
  //   //     messagesPerUser.get(otherUser).push(content);
  //   //   } else {
  //   //     messagesPerUser.set(otherUser, [content]);
  //   //   }
  //   // });
  // });

  //}
  // })
  // .catch((error) => {
  //   newAlert.value = {
  //     title: error.code,
  //     text: error.message,
  //     type: "error",
  //   };
  // })
  // .finally(() => {
  //   isLoading.value.messages = false;
  // });
  //};

  const uploadFiles = async (files: File[]) => {
    uploadedFiles.value = [];
    isLoading.value.messages = true;
    let formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    //formData.append("_roomID", selectedUser.value?._roomID as string);
    formData.append("_uuid", userStore.userSessionData?._uuid as string);
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
        isLoading.value.messages = false;
      });
  };

  // User Selected
  const onSelectUser = async (user: User) => {
    // const _roomID = await instance.get("/getUserMessagesRoom", { params: { _uuid: user._uuid}})

    //console.log(_roomID);

    selectedUser.value = {
      ...user,
      selected: true,
      newMessages: null,
      //messages: [...user.messages] || [],
    };
  };

  // watchEffect(async () => {
  //   if (selectedUser.value?.messagesDistributed === false && userStore.userSessionData) {
  //     await getMessages(userStore.userSessionData?._uuid, selectedUser.value._uuid);
  //   }
  // });
  // Sockets
  const onTyping = (input: string) => {
    socket.timeout(500).emit("user_typing", {
      input: input.length,
      to: selectedUser.value?._uuid,
    });
  };

  socket.on(_directMessageListener.typing, ({ input, from, username }) => {
    if (input > 1) {
      typing.value = {
        from: from,
        name: username,
        isTyping: true,
      };
    }
  });

  // new Message
  socket.on(_directMessageListener.newMessage, (newMessage) => {
    //reset typing
    typing.value = null;
    const fromSelf = (socket as any)._uuid === newMessage.from;
    users.value.forEach((user) => {
      if (user._uuid === (fromSelf ? newMessage.to : newMessage.from)) {
        user.messages.push({
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
  });

  socket.on("user_connected", (user) => {
    // users.value.forEach((u) => {
    //   if (u._uuid === user._uuid) {
    //     u.connected = true;
    if (selectedUser.value?.settings?.muteNotification) {
      newAlert.value = {
        title: user.displayName,
        text: "is online.",
        type: "success",
      };
    }
    //     return;
    //   }
    // });

    const newUser = users.value.find((u) => u._uuid === user._uuid);

    if (!newUser) {
      users.value.push({
        _id: user._id,
        _uuid: user._uuid,
        _channelID: user._channelID,
        sessionID: user.sessionID,
        userName: user.userName,
        firstName: capitalize(user.firstName),
        lastName: capitalize(user.lastName),
        displayName: capitalize(user.firstName + " " + user.lastName),
        image: user.image,
        email: user.email,
        self: user.socketId === userStore.userSessionData?._uuid,
        connected: true,
        messages: messagesPerUser.get(user._uuid) || [],
        settings: null,
        createdAt: user.createdAt,
      });

      if (selectedUser.value?.settings?.muteNotification === false) {
        newAlert.value = {
          title: user.displayName,
          text: "is online.",
          type: "success",
        };
      }
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

  // Start
  const channelMembers = ref<string[]>([]);

  const getUserChannelMembers = async (_channelID: string) => {
    await instance
      .get("/getUserChannelMembers", {
        params: { _channelID },
      })
      .then((response) => {
        if (response.data) {
          channelMembers.value = response.data;
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        //loading false
      });
  };

  const getUserMember = (_uuid: string) => {
    instance.get("/getUser", {
      params: {
        _uuid
      }
    }).then((response) => {

    }).catch((error) => {
      console.log(error)
    }).finally(() => {
      //loading
    })
  }

  return {
    // Start
    channelMembers,
    getUserChannelMembers,
    getUserMember,
    // 
    users,
    selectedUser,
    filterSearchInput,
    newAlert,
    typing,
    isLoading,
    filteredUsers,
    sendMessage,
    onTyping,
    getMessages,
    onSelectUser,
  };
});
