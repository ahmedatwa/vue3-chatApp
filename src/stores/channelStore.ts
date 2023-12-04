import { defineStore } from "pinia";
import { ref, computed, inject, reactive, shallowRef, watch } from "vue";
import { instance, channelApi } from "@/axios";
import { useSessionStore } from "@/stores";
import { nanoid } from "nanoid";
import { esc, remove, createDateTime, capitalize } from "@/helpers";
// types
import type { Snackbar, UploadedFiles } from "@/types";
import type { Channels, ChannelForm, SendThreadPayload } from "@/types/Channel";
import type {
  ChannelMembers,
  ChannelSettings,
  ChannelMessages,
  ChannelTyping,
} from "@/types/Channel";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import type { NewThreadMessage, AddMembers } from "@/types/sockets";
import type { NewChannel, JoinChannel } from "@/types/sockets";
import { langKey } from "@/types/Symbols";

export const useChannelStore = defineStore("channelStore", () => {
  const sessionStore = useSessionStore();
  const $lang = inject(langKey);

  const isLoading = reactive({
    thread: false,
    messages: false,
    channels: false,
  });
  const isMessageEdit = shallowRef(false);
  const isMessageDelete = shallowRef(false);
  const channels = ref<Channels[]>([]);
  const uploadedFiles = ref<UploadedFiles[]>([]);
  const typing = ref<Record<"channel" | "thread", ChannelTyping | null>>({
    channel: null,
    thread: null,
  });

  const newAlert = ref<Snackbar | null>(null);
  const selectedChannel = ref<Channels | null>(null);
  const filterSearchInput = ref("");
  const paginationLimit = ref(50);
  const messagesTotal = ref(0);

  // Filter Channels
  const filteredChannels = computed(() => {
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
    isLoading.messages = true;
    // save Files
    if (message.files?.length) {
      await uploadFiles(message.files);
    }
    // save sent Message
    await instance
      .post(channelApi.__addChannelMessage, {
        _channelID: selectedChannel.value?._channelID,
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        content: esc(message.content),
        files: uploadedFiles.value,
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedChannel.value?.messages)
            selectedChannel.value.messages.push({
              ...response.data,
              thread: [],
            });
          // update server
          socket.emit(_channelEmits.newMessage, {
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

  const sendMessageThread = async (payload: SendThreadPayload) => {
    isLoading.thread = true;
    // save Files
    if (payload.files?.length) {
      await uploadFiles(payload.files);
    }
    await instance
      .post(channelApi.__addChannelMessageThread, {
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        to: payload.to,
        toName: payload.toName,
        _channelID: payload._channelID,
        _messageID: payload._messageID,
        content: esc(payload.content),
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.data) {
          if (selectedChannel.value?.messages) {
            const _message = selectedChannel.value?.messages.find(
              (o) => o._id === payload._messageID
            );
            if (_message) {
              _message.thread.push(response.data);
            }
            // update socket
            socket.emit(_channelEmits.newThreadMessage, {
              _id: response.data._id,
              _messageID: response.data._messageID,
              _channelID: response.data._channelID,
              from: response.data.from,
              fromName: response.data.fromName,
              to: payload.to,
              toName: payload.toName,
              content: response.data.content,
              createdAt: response.data.createdAt,
            });
          }
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
        isLoading.thread = false;
      });
  };

  const getChannelMessages = async (
    _channelID: string | number,
    limit?: number,
    offset: number = 0,
    unshift?: boolean
  ) => {
    isLoading.messages = true;
    await instance
      .get(channelApi.__getChannelMessages, {
        params: {
          _channelID: _channelID,
          limit: limit,
          offset: offset > 0 ? offset : 0,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedChannel.value) {
            unshift
              ? selectedChannel.value.messages?.unshift(...response.data)
              : selectedChannel.value.messages?.push(...response.data);

            const ceil = Math.ceil(offset - paginationLimit.value);
            let $_offset = ceil;
            let $_limit = paginationLimit.value;

            if (ceil > paginationLimit.value) {
              $_offset = ceil;
              $_limit = paginationLimit.value;
            } else if (ceil <= paginationLimit.value && $_offset > 0) {
              $_limit = ceil;
              $_offset = 0;
            }

            selectedChannel.value.messagesDistributed = true;
            selectedChannel.value.pagination = {
              limit: $_limit,
              offset: $_offset,
              total: messagesTotal.value,
            };
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

  const getTotalChannelMessages = async (_channelID: string) => {
    return await instance
      .get(channelApi.__getTotalChannelMessages, {
        params: {
          _channelID: _channelID,
        },
      })
      .then((response) => {
        if (response.data) [(messagesTotal.value = response.data as number)];
      })
      .catch((error) => {
        newAlert.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      });
  };

  const createChannel = async (channel: ChannelForm) => {
    isLoading.channels = true;
    await instance
      .post(channelApi.__addChannel, {
        _channelID: nanoid(15),
        ...channel,
        displayName: sessionStore.userSessionData?.displayName,
        createdBy: sessionStore.userSessionData?._uuid,
        createdAt: createDateTime(),
        settings: {
          muteNotifications: "none",
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          channels.value.push({
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
          newAlert.value = {
            title: $lang?.getLine("channel.success.created", [
              response.data.channelName,
            ]),
            text: "Channel Created.",
            type: "success",
          };
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
        isLoading.channels = false;
      });
  };

  const getChannelMembers = async (_channelID: string) => {
    isLoading.messages = true;
    await instance
      .get(channelApi.__getChannelMembers, {
        params: {
          _channelID: _channelID,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedChannel.value) {
            selectedChannel.value.membersDistributed = true;
            selectedChannel.value?.members?.push(...response.data);
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

  const getChannels = async (uuid: string) => {
    isLoading.channels = true;
    try {
      return await instance.get(channelApi.__getChannels, {
        params: {
          _uuid: uuid,
        },
      });
    } catch (error: any) {
      newAlert.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
    } finally {
      isLoading.channels = false;
    }
  };

  const updateChannelMembers = async (payload: {
    add: ChannelMembers[];
    remove: ChannelMembers[];
  }) => {
    isLoading.channels = true;
    await instance
      .post(channelApi.__updateChannelMembers, {
        _channelID: selectedChannel.value?._channelID,
        channelName: selectedChannel.value?.channelName,
        members: [...payload.add],
        createdAt: createDateTime(),
        settings: {
          muteNotifications: "none",
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          let fromName = "";
          for (let i = 0; i < payload.add.length; i++) {
            if (payload.add[i]._uuid === selectedChannel.value?.createdBy) {
              fromName = payload.add[i].displayName;
            }
            break;
          }

          if (fromName) {
            socket.emit(_channelEmits.updateMembers, {
              ...response.data,
              fromName: fromName,
              from: selectedChannel.value?.createdBy,
              _id: selectedChannel.value?._id,
              channelName: selectedChannel.value?.channelName,
            });
            newAlert.value = {
              title: $lang?.getLine("channel.success.updated"),
              text: "",
              type: "success",
            };
          }

          // Removed Sockets
          if (payload.remove) {
            socket.emit(_channelEmits.removedMembers, {
              removed: payload.remove,
              _channelID: selectedChannel.value?._channelID,
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
        isLoading.channels = false;
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
            if (selectedChannel.value?.messages) {
              selectedChannel?.value?.messages.forEach((message, index) => {
                if (message._id === _messageID) {
                  selectedChannel.value?.messages?.splice(index, 1);
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
          newAlert.value = {
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

  const archiveChannel = async (payload: {
    _channelID: string;
    name: string;
  }) => {
    isLoading.channels = true;
    await instance
      .post(channelApi.__archiveChannel, {
        _channelID: payload._channelID,
        _uuid: sessionStore.userSessionData?._uuid,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (channels.value) {
            remove(channels.value, ["_channelID", payload._channelID]);
            newAlert.value = {
              title: $lang?.getLine("channel.success.archived", [payload.name]),
              text: "",
              type: "success",
            };
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
        isLoading.channels = false;
      });
  };

  const updateChannel = async (channel: ChannelForm) => {
    isLoading.channels = true;
    await instance
      .post(channelApi.__updateChannel, {
        _channelID: selectedChannel.value?._channelID,
        ...channel,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          newAlert.value = {
            title: $lang?.getLine("channel.success.updated"),
            text: "",
            type: "success",
          };
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
        isLoading.channels = false;
      });
  };

  // Leave Channel
  const leaveChannel = async (payload: {
    _channelID: string;
    name: string;
  }) => {
    isLoading.channels = true;
    await instance
      .post(channelApi.__leaveChannel, {
        _channelID: payload._channelID,
        _uuid: sessionStore.userSessionData?._uuid,
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          const index = channels.value.findIndex(
            (channel) => channel._channelID === payload._channelID
          );
          if (index) {
            channels.value.splice(index, 1);
            newAlert.value = {
              title: $lang?.getLine("channel.success.updated"),
              text: "",
              type: "success",
            };
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
        isLoading.channels = false;
      });
  };

  const uploadFiles = async (files: File[]) => {
    uploadedFiles.value = [];
    isLoading.channels = true;
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
        newAlert.value = {
          title: $lang?.getLine("error.upload"),
          text: error.code + " " + error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.channels = false;
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
    isLoading.channels = true;
    instance
      .post(channelApi.__addChannelSettings, {
        ...settings,
      })
      .then((response) => {
        if (response.statusText === "Created") {
          newAlert.value = {
            title: $lang?.getLine("channel.success.updated"),
            text: "",
            type: "success",
          };
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
        isLoading.channels = false;
      });
  };

  // Channel Selected
  const onSelectChannel = async (channel: Channels) => {
    // Resetting Data for performance s
    selectedChannel.value = {
      ...channel,
      selected: true,
      newMessages: null,
      messagesDistributed: false,
      messages: [],
      members: [],
      pagination: {
        limit: paginationLimit.value,
        total: channel.pagination?.total || 0,
        offset: channel.pagination?.total
          ? Math.ceil(channel.pagination?.total - paginationLimit.value)
          : 0,
      },
    };
  };

  // watchers
  watch(
    () => selectedChannel.value?.membersDistributed,
    async (membersDistributed) => {
      if (!membersDistributed && selectedChannel.value) {
        await getChannelMembers(selectedChannel.value?._channelID);
      }
    }
  );

  watch(
    () => selectedChannel.value?.messagesDistributed,
    async (messagesDistributed) => {
      if (selectedChannel.value && !messagesDistributed) {
        await getTotalChannelMessages(selectedChannel.value._channelID);

        if (messagesTotal.value) {
          const offset = Math.ceil(messagesTotal.value - paginationLimit.value);
          await getChannelMessages(
            selectedChannel.value?._channelID,
            paginationLimit.value,
            offset,
            false
          );
        }
      }
    }
  );

  // Sockets
  const UnreadMessagesTotal = reactive({ count: 0 });
  socket.on(_channelListener.newMessage, (message: ChannelMessages) => {
    //reset typing
    typing.value.channel = null;
    const found = channels.value.find(
      (c) => c._channelID === message._channelID
    );

    if (found) {
      found.messages.push({
        _id: message._id,
        _channelID: message._channelID,
        from: message.from,
        fromName: message.fromName,
        content: message.content,
        createdAt: message.createdAt,
        thread: [],
      });
      // Check for user settings
      if (found.settings?.muteNotifications === "none") {
        found.newMessages = {
          total: UnreadMessagesTotal.count++,
          lastMessage: message.content,
          from: message.fromName,
        };

        newAlert.value = {
          title: found.channelName,
          text: message.fromName + ": " + message.content,
          type: "success",
        };
      }
    }
  });

  // new thread message event
  socket.on(_channelListener.newThreadMessage, (event: NewThreadMessage) => {
    //reset typing
    typing.value.thread = null;
    const _channel = channels.value.find(
      (chann) => chann._channelID === event._channelID
    );

    if (_channel) {
      _channel?.messages?.forEach((message) => {
        if (message._id === event._messageID) {
          message.thread.push({ ...event });
          return;
        }
      });

      // Check for user settings
      if (_channel.settings?.muteNotifications === "none") {
        _channel.newMessages = {
          total: UnreadMessagesTotal.count + 1,
          lastMessage: event.content,
          from: event.fromName,
        };

        newAlert.value = {
          title: _channel.channelName,
          text: event.fromName + ": " + event.content,
          type: "success",
        };
      }
    }
  });

  // Create channel Event
  socket.on(_channelListener.createChannel, (event: NewChannel) => {
    console.log(event);
  });

  // Join Channel Event
  socket.on(_channelListener.joinChannel, (event: JoinChannel) => {
    newAlert.value = {
      type: "success",
      text: $lang?.getLine("channel.join", [
        capitalize(event.userName),
        capitalize(event.channelName),
      ]),
    };
  });

  // Adding Members to Channel Event
  socket.on(_channelListener.updateMembers, (event: AddMembers) => {
    if (event.to === sessionStore.userSessionData?._uuid) {
      const found = channels.value.find(
        (channel) => channel._channelID === event._channelID
      );

      if (!found) {
        channels.value.push({
          _id: event._id,
          _channelID: event._channelID,
          channelName: event.channelName,
          channelTopic: "",
          channelDescription: "",
          messages: [],
          createdBy: event.from,
          createdAt: event.createdAt,
          members: [
            {
              _uuid: event.to,
              displayName: event.toName,
              email: event.email,
            },
          ],
        });
      }

      newAlert.value = {
        type: "success",
        text: $lang?.getLine("channel.success.newChannelMember", [
          capitalize(event.fromName),
        ]),
      };
    }
  });

  // Removed Members
  socket.on(
    _channelListener.removedMembers,
    (event: { _uuid: string; _channelID: string }) => {
      remove(channels.value, ["_channelID", event._channelID]);
    }
  );
  // channel Typing
  const channelTyping = (input: string) => {
    socket.timeout(500).emit(_channelEmits.typing, {
      _channelID: selectedChannel.value?._channelID,
      displayName: sessionStore.userSessionData?.displayName,
      input: input,
    });
  };

  socket.on(_channelListener.typing, (event: ChannelTyping) => {
    if (event.input.length > 0) {
      typing.value.channel = {
        from: event.from,
        input: '',
        displayName: event.displayName,
      };
    } else {
      typing.value.channel = null;
    }
  });

  // Thread Typing
  const channelTheadTyping = (input: string) => {
    socket.timeout(500).emit(_channelEmits.threadTyping, {
      _channelID: selectedChannel.value?._channelID,
      displayName: sessionStore.userSessionData?.displayName,
      input: input,
    });
  };

  socket.on(_channelListener.threadTyping, (event: ChannelTyping) => {
    if (event.input.length > 0) {
      typing.value.thread = {
        from: event.from,
        displayName: event.displayName,
        input: '',
      };
    } else {
      typing.value.thread = null;
    }
  });

  // Edit Message Event
  socket.on(_channelListener.editMessage, async (message) => {
    console.log(message);
  });

  // Delete Message Event
  socket.on(_channelListener.deleteMessage, async (message) => {
    if (selectedChannel.value?.messages) {
      remove(selectedChannel.value?.messages, ["_id", message._id]);
    }
  });

  return {
    channels,
    selectedChannel,
    uploadedFiles,
    typing,
    isLoading,
    newAlert,
    filteredChannels,
    filterSearchInput,
    isMessageDelete,
    getChannels,
    channelTheadTyping,
    updateChannelSettings,
    getChannelMessages,
    updateChannel,
    sendMessage,
    createChannel,
    updateChannelMembers,
    archiveChannel,
    channelTyping,
    onSelectChannel,
    leaveChannel,
    downloadFile,
    editChannelMessage,
    deleteChannelMessage,
    sendMessageThread,
  };
});
