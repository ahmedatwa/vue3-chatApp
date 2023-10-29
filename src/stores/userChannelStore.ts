import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { Channels, Snackbar, TypingEvent, ChannelMessages } from "@/types";
import { instance } from "@/axios";
import { useSessionStore } from "@/stores";
import { useNow, useDateFormat } from "@vueuse/core";
import { capitalize, forEach, isNull, toNumber, set, merge } from "lodash";
import { findKey, remove, escape, filter, includes, toLower } from "lodash";
import { v4 as uuidv4 } from "uuid";
import socket from "@/client";

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

  const sendMessage = async (
    content: string,
    relatedId?: string | number,
    relatedContent?: string
  ) => {
    isLoading.value = true;
    const messageContent = {
      _id: uuidv4(),
      from: sessionStore.userSessionData?._uuid,
      username: sessionStore.userSessionData?.username,
      room: selectedChannel.value?._roomId as string,
      content: escape(content),
      oldContent: escape(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${uploadedFile.value?.name
        }`
        : "",
      createdAt: formattedDate.value,
      relatedId: relatedId ? relatedId : null,
      relatedContent: relatedContent ? relatedContent : null,
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
    socket.emit("new_channel_message", {...messageContent, roomName: selectedChannel.value?.name});
    isLoading.value = false;
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
        if (response.statusText === "OK") {
          channels.value.push({
            _roomId: response.data._roomId,
            name: response.data.name,
            createdBy: response.data.created_by,
            createdAt: response.data.created_at,
            messages: [],
          });
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
  };

  socket.on("client_new_channel_message", ({
      _id,
      from,
      username,
      roomName,
      _roomId,
      content,
      oldContent,
      file,
      createdAt,
    }) => {
      //reset typing
      typing.value = null;
      forEach(channels.value, (channel) => {
        if (channel._roomId === _roomId) {
          channel.messages.push({
            _id: _id,
            from: from,
            username: username,
            room: roomName,
            content: content,
            oldContent: oldContent,
            file: file,
            createdAt: createdAt,
          });

          channel.newMessages = {
            total: UnreadMessagesTotal.value++,
            lastMessage: content,
            from: username,
          };
          newNotification.value = {
            title: capitalize(roomName),
            text: `${capitalize(username)}: ${content}`,
            type: "success"
          };
        }
      });
    }
  );

  const alterChannelMessage = async (key: string, message: ChannelMessages) => {
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

      // save sent Message
      await instance.post("/addroommessage", {
        room: selectedChannel.value?._roomId,
        createdAt: formattedDate.value,
        content: selectedChannel.value?.messages,
      });
    }
  };

  // Leave Channel
  const leaveChannel = (_uuid: string, channel: Channels) => {
    console.log(_uuid);
    
  }
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
    leaveChannel
  };
});
