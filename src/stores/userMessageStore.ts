import { defineStore } from "pinia";
import { useUserStore, useSessionStore, useChannelStore } from "@/stores";
import socket from "@/client";
import { ref, computed } from "vue";
import { TypingEvent } from "@/types";
import { useNow, useDateFormat } from "@vueuse/core";
import { messageAxios } from "@/axios";
import { isNull, escape } from "lodash";
import { v4 as uuidv4 } from "uuid";

export const useMessageStore = defineStore("messageStore", () => {
  const userStore = useUserStore();
  const sessionStore = useSessionStore();
  const channelStore = useChannelStore();
  const isLoading = ref(false);
  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
  const typing = ref<TypingEvent | null>(null);
  const uploadedFile = ref<File | null>(null);

  const createdRoom = computed((): string | null => {
    if (userStore.selectedUser?._uuid) {
      return (
        sessionStore.userSessionData?._uuid +
        "__" +
        userStore.selectedUser?._uuid
      );
    }
    return null;
  });

  const sendMessage = async (_threadId: string | null, content: string) => {
    userStore.selectedUser?.messages.push({
      _id: uuidv4(),
      _threadId: isNull(_threadId) ? createdRoom.value : _threadId,
      from: sessionStore.userSessionData?._uuid!,
      to: userStore.selectedUser?._uuid!,
      content: escape(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : "",
      fromSelf: true,
      createdAt: formattedDate.value,
    });

    socket.emit("user_new_message", {
      content: content,
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : null,
      to: userStore.selectedUser?._uuid,
      createdAt: formattedDate.value,
    });

    // save sent Message
    await messageAxios.post("/addmessage", {
      from: sessionStore.userSessionData?._uuid!,
      to: userStore.selectedUser?._uuid!,
      session: sessionStore.userSessionData?.sessionId,
      _roomId: createdRoom.value,
      createdAt: formattedDate.value,
      content: userStore.selectedUser?.messages,
      // from: userSessionStore.userSessionData?._uuid!,
      // to: userUserStore.selectedUser?._uuid!,
      // content: content,
      // fromSelf:
      //   (socket as any)._uuid === userSessionStore.userSessionData?._uuid,
      // seen: false,
      // createdAt: formattedDate.value,
      // room: createdRoom.value,
      // session: userSessionStore.userSessionData?.sessionId,
      // messages: userUserStore.selectedUser?.messages,
    });
    // upload file
    if (!isNull(uploadedFile.value)) {
      let formData = new FormData();
      formData.append("file", uploadedFile.value);
      formData.append("room", createdRoom.value!);
      formData.append("_uuid", userStore.selectedUser?._uuid!);
      await messageAxios.post("/upload", formData).then((response) => {
        if (response.status === 200) {
          uploadedFile.value = null;
        }
      });
    }
  };

  const getMessages = async (uuid: string) => {
    isLoading.value = true;
    try {
      return messageAxios.get(`/getmessages?_uuid=${uuid}`);
    } catch (error) {
    } finally {
      isLoading.value = false;
    }
  };

  return {
    sendMessage,
    getMessages,
    uploadedFile,
    createdRoom,
    isLoading,
    typing,
  };
});
