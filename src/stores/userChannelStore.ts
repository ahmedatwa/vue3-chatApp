import { defineStore } from "pinia";
import { ref, computed } from "vue";
import socket from "@/client";
import { Room, Snackbar, TypingEvent } from "@/types";
import { instance } from "@/axios";
import { useSessionStore } from "@/stores";
import { useNow, useDateFormat } from "@vueuse/core";
import { capitalize, forEach, isNull, filter, includes, remove, escape } from "lodash";
import { v4 as uuidv4 } from 'uuid';

export const useChannelStore = defineStore("channelStore", () => {
  const sessionStore = useSessionStore();

  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
  const isLoading = ref(false);
  const channels = ref<Room[]>([]);
  const uploadedFile = ref<File | null>(null);
  const typing = ref<TypingEvent | null>(null);
  const UnreadMessagesTotal = ref(1);
  const newNotification = ref<Snackbar | null>(null);
  const selectedChannel = ref<Room | null>(null);
  const errors = ref();
  const filterSearchInput = ref("");

  // Filter Users
  const filteredChannels = computed(() => {
    if (filterSearchInput) {
      isLoading.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, 700);
      return filter(channels.value, (channel) => {
        return includes(channel.name, filterSearchInput.value);
      });
    }
  });

  const sendMessage = async (content: string) => {
    const messageContent = {
      _id: uuidv4(),
      from: sessionStore.userSessionData?._uuid,
      username: sessionStore.userSessionData?.username,
      room: selectedChannel.value?._roomId as string,
      content: escape(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${uploadedFile.value?.name
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

  const getChannels = async (): Promise<void> => {
    await instance
      .get(`/getrooms?_uuid=${sessionStore.userSessionData?._uuid}`)
      .then((response) => {
        channels.value = response.data;
      })
      .catch((error) => {
        errors.value = error;
      });
  };

  const createChannel = async (room: { name: string; users: string[] }) => {
    isLoading.value = true;
    await instance
      .post("/addroom", {
        _roomId: uuidv4(),
        name: room.name,
        created_by: sessionStore.userSessionData?._uuid,
        created_at: formattedDate.value,
        users: room.users,
      })
      .then((response) => {
        if (response.data) channels.value = response.data;
        socket.emit("create_room", {
          _roomId: response.data.room_id,
          name: response.data.name,
          createdBy: response.data.created_by,
        });
      })
      .catch((error) => {
        errors.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // User Selected
  const onSelectChannel = (room: Room) => {
    selectedChannel.value = {
      ...room,
      selected: true,
      newMessages: null,
      messages: [...room.messages],
    };
    // Emit Socket
    socket.emit("join_room", {
      _roomId: room._roomId,
      room: room.name,
      createdBy: room.createdBy,
    });
  };

  socket.on("client_new_room_message", (messageContent) => {
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


  socket.on("client_edit_room_message", async (message) => {
    console.log(message);
  });

  socket.on("client_delete_room_message", async (message) => {
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
    filterSearchInput,
    filteredChannels,
    sendMessage,
    getChannels,
    createChannel,
    onSelectChannel,
  };
});
