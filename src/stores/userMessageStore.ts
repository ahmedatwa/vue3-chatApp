import { defineStore } from "pinia";
import { useUserStore, useSessionStore } from "@/stores";
import socket from "@/client";
import { ref, computed } from "vue";
import { TypingEvent } from "@/types";
import { useNow, useDateFormat } from "@vueuse/core";
import { messageAxios } from "@/axios";
import { isNull, escape } from "lodash";

export const useMessageStore = defineStore("messageStore", () => {
  const userUserStore = useUserStore();
  const userSessionStore = useSessionStore();
  const isLoading = ref(false);
  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
  const typing = ref<TypingEvent | null>(null);
  const uploadedFile = ref<File | null>(null);

  const createdRoom = computed((): string | null => {
    if (userUserStore.selectedUser?._uuid) {
      return (
        userSessionStore.userSessionData?._uuid +
        "__" +
        userUserStore.selectedUser?._uuid
      );
    }
    return null;
  });

  const sendMessage = async (content: string) => {
    userUserStore.selectedUser?.messages.push({
      from: userSessionStore.userSessionData?._uuid!,
      to: userUserStore.selectedUser?._uuid!,
      content: escape(content),
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : '',
      fromSelf: true,
      seen: false,
      createdAt: formattedDate.value,
    });

    socket.emit("user_new_message", {
      content: content,
      file: uploadedFile.value
        ? `${import.meta.env.VITE_API_URL}/images/uploads/${
            uploadedFile.value?.name
          }`
        : null,
      to: userUserStore.selectedUser?._uuid,
      createdAt: formattedDate.value,
    });

    // save sent Message
    await messageAxios.post("/addmessage", {
      from: userSessionStore.userSessionData?._uuid!,
      to: userUserStore.selectedUser?._uuid!,
      content: content,
      fromSelf: (socket as any)._uuid === userSessionStore.userSessionData?._uuid,
      seen: false,
      createdAt: formattedDate.value,
      room: createdRoom.value,
      session: userSessionStore.userSessionData?.sessionId,
      messages: userUserStore.selectedUser?.messages,
    });
    // upload file
    if (!isNull(uploadedFile.value)) {
      let formData = new FormData();
      formData.append("file", uploadedFile.value);
      formData.append("room", createdRoom.value!);
      formData.append("uuid", userUserStore.selectedUser?._uuid!);
      await messageAxios.post("/upload", formData).then((response) => {
        if (response.status === 200) {
          uploadedFile.value = null;
        }
      });
    }
  };

  return {
    sendMessage,
    uploadedFile,
    createdRoom,
    isLoading,
    typing,
  };
});
