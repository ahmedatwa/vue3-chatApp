import { defineStore } from "pinia";
import { ref, computed, shallowRef} from "vue";
import { inject, reactive} from "vue";
import { useSessionStore, useStorageStore } from "@/stores";
import { instance, directMessageApi } from "@/axios";
import { capitalize, createDateTime, esc } from "@/helpers";

// types
import { Snackbar, UploadedFiles } from "@/types";
import type { User, UserTyping } from "@/types/User";
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
    isLoading.messages = true;
    // save Files
    if (message.files?.length) {
      await uploadFiles(message.files);
    }
    // save sent Message
    await instance
      .post(directMessageApi.__sendMessage, {
        content: esc(message.content),
        editContent: "",
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        to: selectedUser.value?._uuid,
        toName: selectedUser.value?.displayName,
        files: uploadedFiles.value,
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if(selectedUser.value?.messages)
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
      })
      .finally(() => {
        isLoading.messages = false;
      });
  };

  const getMessages = async (_uuid: string) => {
    isLoading.users = true;
    try {
      return instance.get(directMessageApi.__getUserDirectMessages, {
        params: {
          _uuid,
        },
      });
    } catch (error: any) {
      newAlert.value = {
        title: $lang?.getLine("channel.error.send"),
        text: error.code + " " + error.message,
        type: "error",
        timeout: -1,
        location: "",
      };
    }finally {
      isLoading.users = false;
    }
    
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
  //   //     sessionStore.userSessionData?._uuid === content.from
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
      messages: messagesPerUser.value.get(user._uuid) || []
    };
  };

  //swatch(
    // () => selectedUser.value?.messagesDistributed,
    // async (messagesDistributed) => {
    //   if (selectedChannel.value && !messagesDistributed) {
    //     await getTotalChannelMessages(selectedChannel.value._channelID);

    //     if (messagesTotal.value) {
    //       const offset = Math.ceil(messagesTotal.value - paginationLimit.value);
    //       await getChannelMessages(
    //         selectedChannel.value?._channelID,
    //         paginationLimit.value,
    //         offset,
    //         false
    //       );
    //     }
    //   }
    // }
  //);


  // Sockets
  const userTyping = (input: string) => {
    socket.timeout(500).emit("user_typing", {
      input: input,
      to: selectedUser.value?._uuid,
      displayName: selectedUser.value?.displayName
    });
  };

  socket.on(_directMessageListener.typing, (event: UserTyping) => {
    if (event.input.length > 0) {
      typing.value.messages = {
        from: event.from,
        displayName: event.displayName,
        input: '',
        isTyping: true
      };
    }
  });

  // new Message
  socket.on(_directMessageListener.newMessage, (newMessage) => {
    //reset typing
    typing.value.messages = null;
    const fromSelf = (socket as any)._uuid === newMessage.from;
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
            //total: UnreadMessagesTotal.value++,
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

    const newUser = users.value.find((u) => u._uuid === user._uuid);
    console.log(newUser);
    
    if (newUser !== undefined) {
      users.value.push({
        _id: user._id,
        _uuid: user._uuid,
        userName: user.userName,
        firstName: capitalize(user.firstName),
        lastName: capitalize(user.lastName),
        displayName: capitalize(user.firstName + " " + user.lastName),
        image: user.image,
        email: user.email,
        self: user.socketId === sessionStore.userSessionData?._uuid,
        connected: true,
        messages: messagesPerUser.value.get(user._uuid) || [],
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
    sendMessage,
    userTyping,
    getMessages,
    onSelectUser,
  };
});
