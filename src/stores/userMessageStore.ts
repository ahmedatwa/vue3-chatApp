import { defineStore } from "pinia";
import { useUserStore, useSessionStore } from "@/stores";
import socket from "@/client";
import { ref, computed } from "vue";
import { TypingEvent } from "@/types";
import { useNow, useDateFormat } from "@vueuse/core";
import { messageAxios } from "@/axios";
import { isNull } from "lodash";

export const useMessageStore = defineStore("messageStore", () => {
  const userUserStore = useUserStore();
  const userSessionStore = useSessionStore();
  //const messagesData = ref<userMessages[]>([]);
  const isLoading = ref(false);
  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
  const typing = ref<TypingEvent | null>(null);
  const uploadedFile = ref<File | null>(null);

  const createdRoom = computed((): string | null => {
    if (userUserStore.selectedUser?.uuid) {
      return (
        userSessionStore.userSessionData?.uuid +
        "__" +
        userUserStore.selectedUser?.uuid
      );
    }
    return null;
  });

  const sendMessage = async (content: string) => {
    const message = {
      from: userSessionStore.userSessionData?.uuid!,
      to: userUserStore.selectedUser?.uuid!,
      content: content,
      file: uploadedFile.value
        ? `http://localhost/project-root/public/images/uploads/${uploadedFile.value?.name}`
        : null,
      fromSelf: true,
      seen: false,
      createdAt: formattedDate.value,
    };
    socket.emit("server_new_message", {
      content: content,
      file: uploadedFile.value
        ? `http://localhost/project-root/public/images/uploads/${uploadedFile.value?.name}`
        : null,
      to: userUserStore.selectedUser?.uuid,
      createdAt: formattedDate.value,
    });

    userUserStore.selectedUser?.messages.push(message);
    // save sent Message
    await messageAxios.post("/addmessage", {
      from: userSessionStore.userSessionData?.uuid!,
      to: userUserStore.selectedUser?.uuid!,
      content: content,
      fromSelf: (socket as any).uuid === userSessionStore.userSessionData?.uuid,
      seen: false,
      createdAt: formattedDate.value,
      room: createdRoom.value,
      session: userSessionStore.userSessionData?.sessionId,
      messages: message,
    });
    // upload file
    if (!isNull(uploadedFile.value)) {
      let formData = new FormData();
      formData.append("file", uploadedFile.value);
      formData.append("room", createdRoom.value!);
      formData.append("uuid", userUserStore.selectedUser?.uuid!);
      await messageAxios.post("/upload", formData).then((response) => {
        if (response.status === 200) {
          uploadedFile.value = null
        }
      });
    }
  };

  return {
    sendMessage,
    uploadedFile,
   // messagesData,
    createdRoom,
    isLoading,
    typing,
  };
});
