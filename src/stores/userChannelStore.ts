import { defineStore } from "pinia";
import { ref, computed } from "vue";
import socket from "@/client";
import { Channels, Snackbar, TypingEvent, ChannelMessages } from "@/types";
import { instance } from "@/axios";
import { useSessionStore } from "@/stores";
import { useNow, useDateFormat } from "@vueuse/core";
import {
  capitalize,
  forEach,
  isNull,
  toNumber,
  set,
  merge,
  findKey,
  remove,
  escape,
  filter,
  includes,
  toLower
} from "lodash";
import { v4 as uuidv4 } from "uuid";

export const useChannelStore = defineStore("channelStore", () => {
  const sessionStore = useSessionStore();

  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
  const isLoading = ref(false);
  const channels = ref<Channels[]>([]);
  const uploadedFile = ref<File | null>(null);
  const typing = ref<TypingEvent | null>(null);
  const UnreadMessagesTotal = ref(1);
  const newNotification = ref<Snackbar | null>(null);
  const selectedChannel = ref<Channels | null>(null);
  const errors = ref();
  const filterSearchInput = ref("");
  
  // Filter Channels
  const filteredChannels = computed(() => {
    isLoading.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
    return filter(channels.value, (channel) => {
      return includes(channel.name, toLower(filterSearchInput.value));
    });
  });

  const sendMessage = async (content: string) => {
    const messageContent = {
      _id: uuidv4(),
      from: sessionStore.userSessionData?._uuid,
      username: sessionStore.userSessionData?.username,
      room: selectedChannel.value?._roomId as string,
      content: escape(content),
      oldContent: escape(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : "",
      createdAt: formattedDate.value,
    };
    // push messages to channel
    selectedChannel.value?.messages.push(messageContent);
    // save sent Message
    await instance.post("/addroommessage", {
      room: selectedChannel.value?._roomId,
      createdAt: formattedDate.value,
      content: selectedChannel.value?.messages,
    });
    // upload file
    if (!isNull(uploadedFile.value)) {
      let formData = new FormData();
      formData.append("file", uploadedFile.value);
      formData.append("room", selectedChannel.value?._roomId as string);
      formData.append("uuid", sessionStore.userSessionData?._uuid as string);
      await instance.post("/upload", formData).then((response) => {
        if (response.status === 200) {
          uploadedFile.value = null;
        }
      });
    }
    socket.emit("new_room_message", messageContent);
  };

  const getChannels = async (uuid: string) => {
    isLoading.value = true;
    try {
      return await instance.get(`/getrooms?_uuid=${uuid}`);
    } catch (error) {
      errors.value = error;
    } finally {
      isLoading.value = false;
    }
  };

  const createChannel = async (name: string) => {
    isLoading.value = true;
    await instance
      .post("/addroom", {
        _roomId: uuidv4(),
        name: name,
        created_by: sessionStore.userSessionData?._uuid,
        created_at: formattedDate.value,
      })
      .then((response) => {
        if (response.data) {
          channels.value.push(response.data);
          socket.emit("create_channel", {
            _roomId: response.data.room_id,
            name: response.data.name,
            createdBy: response.data.created_by,
          });
        }
      })
      .catch((error) => {
        errors.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const addChannelUsers = async (users: string[]) => {
    await instance
      .post("/addchannelusers", {
        _roomId: selectedChannel.value?._roomId,
        users: users,
        created_by: sessionStore.userSessionData?._uuid,
        created_at: formattedDate.value,
      })
      .then((response) => {
        if (response.statusText === "OK")
          socket.emit("add_users_to_channel", {
            _roomId: response.data.room_id,
            roomName: response.data.name,
            createdBy: response.data.created_by,
            users: users,
          });
      })
      .catch((error) => {
        errors.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const deleteChannel = async ({ _id, _roomId }: Channels) => {
    await instance
      .post("/deletechannel", {
        _id: _id,
        _roomId: _roomId,
        _uuid: sessionStore.userSessionData?._uuid,
      })
      .then((response) => {
        if (response.statusText === "OK") {
          remove(channels.value, (channel) => {
            return channel._roomId === _roomId;
          });
        }
      })
      .catch((error) => {
        errors.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // User Selected
  const onSelectChannel = (room: Channels) => {
    selectedChannel.value = {
      ...room,
      selected: true,
      newMessages: null,
      messages: room.messages || [],
    };
    // Emit Socket
    socket.emit("join_channel", {
      _roomId: room._roomId,
      room: room.name,
      createdBy: room.createdBy,
    });
  };

  socket.on("client_new_channel_message", (messageContent) => {
    //reset typing
    typing.value = null;
    selectedChannel.value?.messages.push(messageContent);

    forEach(channels.value, (channel) => {
      if (channel._roomId === messageContent._roomId) {
        channel.newMessages = {
          total: UnreadMessagesTotal.value++,
          lastMessage: messageContent.content,
        };
        newNotification.value = {
          title: capitalize(messageContent.room),
          text: capitalize(messageContent.username) + messageContent.content,
        };
      }
    });
  });

  const alterChannelMessage = (key: string, message: ChannelMessages) => {
    const messageKey = findKey(
      selectedChannel.value?.messages,
      (m: ChannelMessages) => {
        return m._id === message._id;
      }
    );
    if (selectedChannel.value?.messages && messageKey) {
      if (key === "edit") {
        set(
          selectedChannel.value.messages,
          `messages[${messageKey}].content`,
          message.content
        );
        merge(selectedChannel.value?.messages[toNumber(messageKey)], {
          updatedAt: formattedDate.value,
          updated: true,
        });
        socket.emit("edit_channel_message", {
          channel: selectedChannel.value,
        });
      }
      if (key === "delete") {
        merge(selectedChannel.value?.messages[toNumber(messageKey)], {
          deletedAt: formattedDate.value,
          deleted: true,
        });
        socket.emit("delete_channel_message", {
          channel: selectedChannel.value,
        });
      }
    }
  };

  // Sockets
  socket.on("client_edit_channel_message", async (message) => {
    console.log(message);
  });

  socket.on("client_delete_channel_message", async (message) => {
    if (selectedChannel.value?.messages) {
      remove(selectedChannel.value?.messages, (m) => {
        return m._id === message._id;
      });
    }
  });

  return {
    channels,
    selectedChannel,
    uploadedFile,
    isLoading,
    typing,
    newNotification,
    filteredChannels,
    filterSearchInput,
    sendMessage,
    getChannels,
    createChannel,
    addChannelUsers,
    deleteChannel,
    alterChannelMessage,
    onSelectChannel,
  };
});
