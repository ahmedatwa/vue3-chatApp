import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { v4 as uuidv4 } from "uuid";
import { esc, formatDate } from "@/helpers";
import type { TypingEvent } from "@/types";
import { instance, directMessageApi } from "@/axios";
import { useUserStore, useSessionStore } from "@/stores";
import socket from "@/client";

export const useMessageStore = defineStore("messageStore", () => {
  const userStore = useUserStore();
  const sessionStore = useSessionStore();
  //const channelStore = useChannelStore();
  const isLoading = ref(false);
  //const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
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
      _threadId: (_threadId !== null) ? createdRoom.value : _threadId,
      from: sessionStore.userSessionData?._uuid!,
      to: userStore.selectedUser?._uuid!,
      content: esc(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : "",
      fromSelf: true,
      createdAt: formatDate()
    });

    socket.emit("user_new_message", {
      content: content,
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : null,
      to: userStore.selectedUser?._uuid,
      createdAt: formatDate(),
    });

    // save sent Message
    await instance.post(directMessageApi.__add_Message, {
      from: sessionStore.userSessionData?._uuid!,
      to: userStore.selectedUser?._uuid!,
      session: sessionStore.userSessionData?.sessionID,
      _roomId: createdRoom.value,
      createdAt: formatDate(),
      content: userStore.selectedUser?.messages,
      // from: userSessionStore.userSessionData?._uuid!,
      // to: userUserStore.selectedUser?._uuid!,
      // content: content,
      // fromSelf:
      //   (socket as any)._uuid === userSessionStore.userSessionData?._uuid,
      // seen: false,
      // createdAt: formattedDate.value,
      // room: createdRoom.value,
      // session: userSessionStore.userSessionData?.sessionID,
      // messages: userUserStore.selectedUser?.messages,
    });
    // upload file
    if (uploadedFile.value) {
      let formData = new FormData();
      formData.append("file", uploadedFile.value);
      formData.append("room", createdRoom.value!);
      formData.append("_uuid", userStore.selectedUser?._uuid!);
      await instance.post("/upload", formData).then((response) => {
        if (response.status === 200) {
          uploadedFile.value = null;
        }
      });
    }
  };

  const getMessages = async (uuid: string) => {
    isLoading.value = true;
    try {
      return instance.get(directMessageApi.__get_Messages, {
        params: {
          _uuid: uuid
        }
      })
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
