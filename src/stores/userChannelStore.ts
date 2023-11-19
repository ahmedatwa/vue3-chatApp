import { defineStore } from "pinia";
import { ref, computed, shallowRef, inject, watch, reactive } from "vue";
import { instance, channelApi } from "@/axios";
import { useSessionStore } from "@/stores";
import { customAlphabet } from "nanoid";
import { esc, remove, createDateTime, capitalize } from "@/helpers";
// types
import type { Snackbar, TypingEvent } from "@/types";
import type { Channels } from "@/types/Channel.ts";
import type { ChannelMembers, ChannelSettings } from "@/types/Channel.ts";
import type {
  ChannelForm,
  UploadedFiles,
  SendMessageThreadPayload,
} from "@/types/Channel.ts";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import { langKey } from "@/types/Symbols.ts";

export const useChannelStore = defineStore("channelStore", () => {
  const sessionStore = useSessionStore();
  const $lang = inject(langKey);

  const isLoading = ref(false);
  const isMessagesLoading = ref(false);
  const channelsLoading = ref(false);
  const isMessageEdit = ref(false);
  const isMessageDelete = ref(false);
  const channels = ref<Channels[]>([]);
  const uploadedFiles = ref<UploadedFiles[]>([]);
  const typing = shallowRef<TypingEvent | null>(null);
  const newNotification = shallowRef<Snackbar | null>(null);
  const selectedChannel = ref<Channels | null>(null);
  const filterSearchInput = ref("");
  const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);
  const messagesPagination: {
    limit: number;
    offset: number;
    total: number;
    end: boolean;
  } = reactive({ limit: 10, offset: 0, total: 0, end: false });
  //const messagesLimit = ref(10);
  //const messagesOffset = ref<number | undefined>(0);
  //const messagesTotal = ref(0);
  //const isNewMessage = ref(false);
  // Filter Channels
  const filteredChannels = computed(() => {
    channelsLoading.value = true;
    setTimeout(() => {
      channelsLoading.value = false;
    }, 500);
    return channels.value
      .filter((channel) => {
        return channel.channelName
          .toLowerCase()
          .includes(filterSearchInput.value.toLowerCase());
      })
      .sort((a, b) => {
        return (
          new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
        );
      });
  });

  const sendMessage = async (message: {
    content: string;
    files?: File[] | null;
  }) => {
    isLoading.value = true;
    // save Files
    if (message.files?.length) {
      await uploadFiles(message.files);
    }
    // save sent Message
    await instance
      .post(channelApi.__addChannelMessage, {
        _channelID: selectedChannel.value?._channelID as string,
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        content: esc(message.content),
        files: uploadedFiles.value,
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          selectedChannel.value?.messages.push(response.data);
          // update server
          socket.emit(_channelEmits.newMessage, {
            ...response.data,
          });
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: $lang?.getLine("error.sendMessage"),
          text: error.code + " " + error.message,
          type: "error",
          timeout: -1,
          location: "",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const sendMessageThread = async (payload: SendMessageThreadPayload) => {
    isLoading.value = true;
    // save Files
    if (payload.files?.length) {
      await uploadFiles(payload.files);
    }
    await instance
      .post(channelApi.__addChannelMessageThread, {
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        ...payload,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          selectedChannel.value?.messages.find((message) => {
            if (message._id === payload._messageID) {
              message.thread?.push(response.data);
              return;
            }
          });
          // selectedChannel.value?.messages.push(response.data);
          // update server
          // socket.emit(_channelEmits.newMessage, {
          //  ...response.data,
          // });
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: $lang?.getLine("error.sendMessage"),
          text: error.code + " " + error.message,
          type: "error",
          timeout: -1,
          location: "",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getChannels = async (uuid: string) => {
    channelsLoading.value = true;
    try {
      return await instance.get(channelApi.__getChannels, {
        params: {
          _uuid: uuid,
        },
      });
    } catch (error: any) {
      newNotification.value = {
        title: error.code,
        text: error.message,
        type: "error",
      };
    } finally {
      channelsLoading.value = false;
    }
  };

  const getChannelMessages = async (_channelID: string, unshift?: boolean) => {
    isMessagesLoading.value = true;
    await instance
      .get(channelApi.__getChannelMessages, {
        params: {
          _channelID: _channelID,
          limit: messagesPagination.limit,
          offset: messagesPagination.offset,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          const $channel = channels.value?.find((_c) => {
            return _c._channelID === _channelID;
          });
          if ($channel) {
            if (unshift) {
              $channel?.messages.unshift(...response.data);
            } else {
              $channel?.messages.push(...response.data);
              $channel.messagesDistributed = true;
            }
            // update offset
            messagesPagination.offset = Math.ceil(
              messagesPagination.offset - messagesPagination.limit
            );

            if (messagesPagination.offset < 0) {
              messagesPagination.end = true;
            }
          }
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isMessagesLoading.value = false;
      });
  };

  const getTotalChannelMessages = async (_channelID: string) => {
    isMessagesLoading.value = true;
    await instance
      .get(channelApi.__getTotalChannelMessages, {
        params: {
          _channelID: _channelID,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          messagesPagination.total = response.data;
          if (messagesPagination.total >= messagesPagination.limit) {
            messagesPagination.offset = Math.ceil(
              messagesPagination.total - messagesPagination.limit
            );
          }
          // if (messagesTotal.value >= messagesLimit.value) {
          //   messagesOffset.value = Math.ceil(
          //     messagesTotal.value - messagesLimit.value
          //   );
          // }
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isMessagesLoading.value = false;
      });
  };

  const createChannel = async (channel: ChannelForm) => {
    isLoading.value = true;
    await instance
      .post(channelApi.__addChannel, {
        _channelID: nanoid(20),
        ...channel,
        displayName: sessionStore.userSessionData?.displayName,
        createdBy: sessionStore.userSessionData?._uuid,
        createdAt: createDateTime(),
        settings: {
          channelNotifications: "all",
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          channels.value?.push({
            _id: response.data._id,
            _channelID: response.data._channelID,
            channelName: response.data.channelName,
            channelTopic: response.data.channelTopic,
            channelDescription: response.data.channelDescription,
            createdBy: response.data.createdBy,
            createdAt: response.data.createdAt,
            members: response.data.members,
            messages: [],
          });
          socket.emit(_channelEmits.create, {
            _channelID: response.data._channelID,
            name: response.data.name,
            createdBy: response.data.createdBy,
          });
          newNotification.value = {
            title: `Success: ${response.data.channelName}`,
            text: "Channel Created.",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getChannelMembers = async (_channelID: string) => {
    await instance
      .get(channelApi.__getChannelMembers, {
        params: {
          _channelID: _channelID,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          const $channel = channels.value?.find((_c) => {
            return _c._channelID === _channelID;
          });
          if ($channel) {
            $channel.membersDistributed = true;
            response.data.forEach((res: { _uuid: string; name: string }) => {
              $channel?.members.push({ _uuid: res._uuid, name: res.name });
            });
          }
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  const addChannelMembers = async (member: ChannelMembers) => {
    await instance
      .post(channelApi.__addChannelMembers, {
        _channelID: selectedChannel.value?._channelID,
        channelName: selectedChannel.value?.channelName,
        ...member,
        createdBy: sessionStore.userSessionData?._uuid,
        createdAt: createDateTime(),
        settings: {
          channelNotifications: "all",
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          socket.emit(_channelEmits.addMembers, {
            _channelID: response.data._channelID,
            _uuid: response.data._uuid,
            channelName: response.data.channelName,
            createdBy: response.data.createdBy,
            name: response.data.name,
          });
          newNotification.value = {
            title: `${response.status} Changes Saved.`,
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const removeChannelMembers = async (_uuid: string) => {
    await instance
      .post(channelApi.__removeChannelMembers, {
        _uuid: _uuid,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          newNotification.value = {
            title: `${response.status} Changes Saved.`,
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // checked deleteChannelMessage
  const deleteChannelMessage = async (_messageID: string | number) => {
    if (selectedChannel.value?.messages) {
      isMessageDelete.value = true;
      await instance
        .post(channelApi.__deleteChannelMessage, { _messageID })
        .then((response) => {
          if (response.statusText === "OK" && response.status === 200) {
            selectedChannel.value?.messages.forEach((message, index) => {
              if (message._id === _messageID) {
                selectedChannel.value?.messages.splice(index, 1);
                return;
              }
            });
          }
        })
        .catch((error) => {
          newNotification.value = {
            title: error.code,
            text: error.message,
            type: "error",
          };
        })
        .finally(() => {
          isMessageDelete.value = false;
        });
    }
  };

  // checked editChannelMessage
  const editChannelMessage = async (message: {
    _messageId: string | number;
    editContent: string;
    content: string;
    updatedAt: string;
  }) => {
    if (selectedChannel.value?.messages) {
      isMessageEdit.value = true;
      await instance
        .post(channelApi.__updateChannelMessage, {
          ...message,
        })
        .catch((error) => {
          newNotification.value = {
            title: error.code,
            text: error.message,
            type: "error",
          };
        })
        .finally(() => {
          isMessageEdit.value = false;
        });
      // socket event
      socket.emit(_channelEmits.editMessage, {
        channel: selectedChannel.value,
      });
    }
  };

  // const replyChannelMessage = async (message: {
  //   _messageId: string | number;
  //   editContent: string;
  //   content: string;
  //   updatedAt: string;
  // }) => {
  //   if (selectedChannel.value?.messages) {
  //     isMessageEdit.value = true;
  //     await instance
  //       .post(channelApi.__updateChannelMessage, {
  //         ...message,
  //       })
  //       .catch((error) => {
  //         newNotification.value = {
  //           title: error.code,
  //           text: error.message,
  //           type: "error",
  //         };
  //       })
  //       .finally(() => {
  //         isMessageEdit.value = false;
  //       });
  //     // socket event
  //     socket.emit(_channelEmits.editMessage, {
  //       channel: selectedChannel.value,
  //     });
  //   }
  // };

  const archiveChannel = async (_channelID: string) => {
    isLoading.value = true;
    await instance
      .post(channelApi.__archiveChannel, {
        _channelID: _channelID,
        _uuid: sessionStore.userSessionData?._uuid,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (channels.value)
            remove(channels.value, ["_channelID", _channelID]);
          newNotification.value = {
            title: `${response.status} Changes Saved.`,
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const updateChannel = async (channel: ChannelForm) => {
    await instance
      .post(channelApi.__updateChannel, {
        _channelID: selectedChannel.value?._channelID,
        ...channel,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          newNotification.value = {
            title: $lang?.getLine("success.channel"),
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // Leave Channel
  const leaveChannel = async (_channelID: string) => {
    await instance
      .post("/leavechannel", {
        _channelID: selectedChannel.value?._channelID,
        _uuid: sessionStore.userSessionData?._uuid,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          newNotification.value = {
            title: `${response.status} Changes Saved.`,
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const uploadFiles = async (files: File[]) => {
    uploadedFiles.value = [];
    isLoading.value = true;
    let formData = new FormData();
    files.forEach((file) => formData.append("files[]", file));
    formData.append("_channelID", selectedChannel.value?._channelID as string);
    formData.append("_uuid", sessionStore.userSessionData?._uuid as string);
    await instance
      .post(channelApi.__channelUpload, formData)
      .then((response) => {
        if (response.status === 200 && response.statusText === "OK") {
          uploadedFiles.value?.push(...response.data);
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: $lang?.getLine("error.upload"),
          text: error.code + " " + error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const downloadFile = (file: { name: string; path: string }) => {
    instance.get("/download", {
      params: {
        name: file.name,
        path: file.path,
      },
    });
  };

  const updateChannelSettings = (settings: {
    _channelID: string;
    _uuid: string;
    setting: ChannelSettings;
  }) => {
    isLoading.value = true;
    instance
      .post(channelApi.__addChannelSettings, {
        _channelID: settings._channelID,
        _uuid: settings._uuid,
        setting: settings.setting,
      })
      .then((response) => {
        if (response.statusText === "Created") {
          newNotification.value = {
            title: $lang?.getLine("success.channel"),
            text: "",
            type: "success",
          };
        }
      })
      .catch((error) => {
        newNotification.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // Channel Selected
  const onSelectChannel = async (channel: Channels) => {
    selectedChannel.value = {
      ...channel,
      selected: true,
      newMessages: null,
    };
  };
  // watchers
  watch(
    () => selectedChannel.value?.membersDistributed,
    async (membersDistributed) => {
      if (membersDistributed === false && selectedChannel.value) {
        await getChannelMembers(selectedChannel.value._channelID);
      }
    }
  );

  watch(
    () => selectedChannel.value?.messagesDistributed,
    async (messagesDistributed) => {
      if (messagesDistributed === false && selectedChannel.value) {
        await getTotalChannelMessages(selectedChannel.value._channelID);
        await getChannelMessages(selectedChannel.value._channelID);
      }
    }
  );
  // Sockets
  socket.on(
    _channelListener.newMessage,
    ({ _id, _channelID, from, fromName, content, createdAt }) => {
      //reset typing
      typing.value = null;
      channels.value?.forEach((channel) => {
        let UnreadMessagesTotal = 1;
        if (channel._channelID === _channelID) {
          channel.messages?.push({
            _id: _id,
            _channelID: _channelID,
            from: from,
            fromName: fromName,
            content: content,
            createdAt: createdAt,
          });

          channel.newMessages = {
            total: UnreadMessagesTotal + 1,
            lastMessage: content,
            from: fromName,
          };

          // Check for user settings
          if (channel.settings?.channelNotifications !== "none") {
            newNotification.value = {
              title: channel.channelName,
              text: fromName + ": " + content,
              type: "success",
            };
          }
          return;
        }
      });
    }
  );

  socket.on(_channelListener.createChannel, (room) => {
    console.log(room);
  });

  socket.on(_channelListener.joinChannel, ({ username, roomName }) => {
    newNotification.value = {
      type: "success",
      text: `${capitalize(username)} has joined room ${capitalize(roomName)}`,
    };
  });

  socket.on(_channelListener.addMembers, ({ channelName, from, to }) => {
    if (to === sessionStore.userSessionData?._uuid)
      newNotification.value = {
        type: "success",
        text: $lang?.getLine("success.newChannelMember", [
          capitalize(from),
          capitalize(channelName),
        ]),
      };
  });

  const onChannelTyping = (input: string) => {
    socket.timeout(500).emit(_channelEmits.typing, {
      _channelID: selectedChannel.value?._channelID,
      displayName: sessionStore.userSessionData?.displayName,
      input: input.length,
    });
  };

  socket.on(_channelListener.typing, ({ input, from, displayName }) => {
    if (input > 1) {
      typing.value = {
        from: from,
        name: displayName,
        isTyping: true,
      };
    } else {
      typing.value = null;
    }
  });

  socket.on(_channelListener.editMessage, async (message) => {
    console.log(message);
  });

  socket.on(_channelListener.deleteMessage, async (message) => {
    if (selectedChannel.value?.messages) {
      remove(selectedChannel.value?.messages, ["_id", message._id]);
    }
  });

  return {
    channels,
    selectedChannel,
    uploadedFiles,
    isLoading,
    typing,
    newNotification,
    filteredChannels,
    filterSearchInput,
    channelsLoading,
    isMessageDelete,
    isMessagesLoading,
    updateChannelSettings,
    removeChannelMembers,
    getChannelMessages,
    updateChannel,
    sendMessage,
    getChannels,
    createChannel,
    addChannelMembers,
    archiveChannel,
    onChannelTyping,
    onSelectChannel,
    leaveChannel,
    downloadFile,
    editChannelMessage,
    deleteChannelMessage,
    //replyChannelMessage,
    sendMessageThread,
    // delete
    messagesPagination,
    // messagesOffset,
    //messagesLimit,
    // messagesTotal,
    //replyMessage,
  };
});
