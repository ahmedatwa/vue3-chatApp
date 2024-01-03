import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import { reactive, shallowRef, watchEffect } from "vue";
import { instance, _channelApi } from "@/axios";
import { useSessionStore } from "@/stores";
import { nanoid } from "nanoid";
import { remove, createDateTime, capitalize } from "@/helpers";
// types
import type { Snackbar, UploadedFiles, Typing } from "@/types/Chat.d.ts";
import type {
  SendThreadPayload,
  TenorGifs,
  MessageReactions,
} from "@/types/Chat.d.ts";
import type {
  Channels,
  ChannelForm,
  ChannelMembers,
} from "@/types/Channel.d.ts";
import type { ChannelSettings, ChannelMessages } from "@/types/Channel.d.ts";
// socket
import socket, { _channelEmits, _channelListener } from "@/client";
import type { NewThreadMessage, AddMembers } from "@/types/Sockets.d.ts";
import type { NewChannel, JoinChannel } from "@/types/Sockets.d.ts";
import { langKey } from "@/types/Symbols";
import { sanitize } from "@/composables/useDOMPurify";

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
  const uploadedFiles = ref<UploadedFiles[] | null>(null);
  const typing = ref<Record<"channel" | "thread", Typing | null>>({
    channel: null,
    thread: null,
  });

  const newAlert = ref<Snackbar | null>(null);
  const selectedChannel = ref<Channels | null>(null);
  const filterSearchInput = ref("");
  const paginationLimit = ref(10);
  const isScroll = shallowRef<{ start: boolean; end: boolean } | null>(null);

  // Filter Channels
  const filteredChannels = computed(() => {
    isLoading.channels = true;
    setTimeout(() => {
      isLoading.channels = false;
    }, 300);
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
    files?: File[] | TenorGifs | null;
  }) => {
    isScroll.value = null;

    if (message.files) {
      await uploadFiles(message.files);
    }

    // Avoid empty DB Records
    if (uploadedFiles.value === null && message.content.length < 1) {
      return;
    }

    await instance
      .post(_channelApi.addChannelMessage, {
        _channelID: selectedChannel.value?._channelID,
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        content: sanitize(message.content),
        files: uploadedFiles.value?.map((file) => file._id),
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedChannel.value?.messages) {
            selectedChannel.value.messages.push({
              ...response.data,
              files: uploadedFiles.value || null,
              thread: [],
            });
            socket.emit(_channelEmits.newMessage, {
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

  const sendMessageThread = async (message: SendThreadPayload) => {
    isLoading.thread = true;
    // save Files
    if (message.files) {
      await uploadFiles(message.files);
    }

    // Avoid empty DB Records
    if (uploadedFiles.value === null && message.content.length < 1) {
      return;
    }

    await instance
      .post(_channelApi.addChannelMessageThread, {
        from: sessionStore.userSessionData?._uuid,
        fromName: sessionStore.userSessionData?.displayName,
        to: message.to,
        toName: message.toName,
        _channelID: message._channelID,
        _messageID: message._messageID,
        content: sanitize(message.content),
        createdAt: createDateTime(),
      })
      .then((response) => {
        if (response.data) {
          if (selectedChannel.value?.messages) {
            const _message = selectedChannel.value?.messages.find(
              (o) => o._id === message._messageID
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
              to: message.to,
              toName: message.toName,
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
    offset: number,
    unshift: boolean,
    limit?: number
  ) => {
    isLoading.messages = true;
    await instance
      .get(_channelApi.getChannelMessages, {
        params: {
          _channelID: _channelID,
          limit: limit ? limit : paginationLimit.value,
          offset: offset > 0 ? offset : 0,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          if (selectedChannel.value) {
            if (unshift) {
              selectedChannel.value.messages?.unshift(...response.data);
              isScroll.value = {
                start: true,
                end: false,
              };
            } else {
              selectedChannel.value.messages?.push(...response.data);
              isScroll.value = {
                start: false,
                end: true,
              };
            }

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

            const channel = channels.value.find(
              (c: Channels) => c._channelID === _channelID
            );
            if (channel) {
              channel.messagesDistributed = true;
              channel.pagination = {
                limit: $_limit,
                offset: $_offset,
                total: channel.totalMessages,
              };
            }
            selectedChannel.value.messagesDistributed = true;
            selectedChannel.value.pagination = {
              limit: $_limit,
              offset: $_offset,
              total: selectedChannel.value.totalMessages,
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
    try {
      const response = await instance.get(_channelApi.getTotalChannelMessages, {
        params: {
          _channelID: _channelID,
        },
      });
      return response.data;
    } catch (error) {}
  };

  const createChannel = async (channel: ChannelForm) => {
    isLoading.channels = true;
    await instance
      .post(_channelApi.addChannel, {
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
            totalMessages: 0,
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
      .get(_channelApi.getChannelMembers, {
        params: {
          _channelID: _channelID,
        },
      })
      .then((response) => {
        if (response.statusText === "OK" && response.status === 200) {
          const channel = channels.value.find(
            (c: Channels) => c._channelID === _channelID
          );

          if (channel) {
            channel.membersDistributed = true;
            channel?.members?.push(...response.data);
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
      return await instance.get(_channelApi.getChannels, {
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
      .post(_channelApi.updateChannelMembers, {
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
        .post(_channelApi.deleteChannelMessage, { _id: _messageID })
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
    _messageID: string | number;
    editContent: string;
    content: string;
    updatedAt: string;
  }) => {
    if (selectedChannel.value?.messages) {
      isMessageEdit.value = true;
      await instance
        .post(_channelApi.updateChannelMessage, {
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
      .post(_channelApi.archiveChannel, {
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
      .post(_channelApi.updateChannel, {
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
      .post(_channelApi.leaveChannel, {
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

  const updateMessageReaction = (reaction: MessageReactions) => {
    instance
      .post(_channelApi.updateMessageReaction, {
        ...reaction,
      })
      .then((response) => {
        if (response.status === 200 && response.statusText === "OK") {
          if (selectedChannel.value) {
            const message = selectedChannel.value.messages.find(
              (message) => message._id === reaction._messageID
            );
            if (message?.reactions) {
              if (message.reactions?.length > 0) {
                const index = message.reactions?.findIndex(
                  (emoji) => emoji._uuid === reaction._uuid
                );

                if (index > -1) {
                  message.reactions?.splice(index, 1);
                }
              } else {
                message.reactions?.push({
                  ...response.data,
                  total: 1,
                });
              }
            } else {
              message?.reactions?.push({
                ...response.data,
                total: 1,
              });
            }
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

  const uploadFiles = async (files: File[] | TenorGifs) => {
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

    formData.append("_channelID", selectedChannel.value?._channelID as string);
    formData.append("_uuid", sessionStore.userSessionData?._uuid as string);
    await instance
      .post(_channelApi.channelUpload, formData)
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
    instance
      .post(_channelApi.addChannelSettings, {
        ...settings,
      })
      .then((response) => {
        if (response.statusText === "Created") {
          newAlert.value = {
            text: $lang?.getLine("channel.success.updated"),
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
  watchEffect(async () => {
    const channel = channels.value.find(
      (c: Channels) => c._channelID === selectedChannel.value?._channelID
    );

    if (channel) {
      if (!channel.membersDistributed) {
      }
    }
  });

  watchEffect(async () => {
    if (selectedChannel.value?.selected) {
      const channel = channels.value.find(
        (c: Channels) => c._channelID === selectedChannel.value?._channelID
      );
      if (channel) {
        if (!channel.messagesDistributed) {
          if (selectedChannel.value.pagination) {
            await getChannelMessages(
              selectedChannel.value?._channelID,
              selectedChannel.value.pagination?.offset,
              false
            );
          }
          // Memebers
          await getChannelMembers(selectedChannel.value?._channelID);
        }
      }
    }
  });

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
    const _channel = channels.value.find((c) => {
      return c._channelID === event._channelID;
    });

    if (_channel) {
      const found = _channel?.messages.find((m) => {
        return m._id === event._messageID;
      });
      if (found) {
        found.thread.push({ ...event });
      }

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
          totalMessages: 0,
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

  socket.on(_channelListener.typing, (event: Typing) => {
    if (event.input > 0) {
      typing.value.channel = {
        from: event.from,
        input: event.input,
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

  socket.on(_channelListener.threadTyping, (event: Typing) => {
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
    paginationLimit,
    isScroll,
    getChannelMembers,
    getChannels,
    channelTheadTyping,
    getTotalChannelMessages,
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
    updateMessageReaction,
    downloadFile,
    editChannelMessage,
    deleteChannelMessage,
    sendMessageThread,
  };
});
