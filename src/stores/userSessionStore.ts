import { defineStore } from "pinia";
import { ref } from "vue";
import { instance } from "@/axios";
import { UserSessionData, LoggedUser } from "@/types";
import socket from "@/client";
import { useStorage } from "@vueuse/core";

export const useSessionStore = defineStore("userSession", () => {
  const userSessionData = ref<UserSessionData>();
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const responseError = ref();
  const responseResult = ref(null)

  // All Sockets
  const getAllSessions = async () => {
    try {
      return await instance.get(`/getsessions?connected=1`);
    } catch (err) {
      console.log(err);
    }
  };

  const addSession = async (user: LoggedUser) => {
    isLoading.value = true;
    await instance
      .post("/addsession", {
        uuid: user.uuid,
        session_id: user.sessionId,
        connected: true,
      })
      .then((response) => {
        if (response?.statusText === "Created") {
          socket.auth = {
            _id: user._id,
            uuid: user.uuid,
            sessionId: user.sessionId,
            username: user.username,
            image: user.image,
          };
          // connect socket
          socket.connect();
          userSessionData.value = {
            _id: user._id,
            image: user.image,
            uuid: user.uuid,
            connected: true,
            sessionId: user.sessionId,
            username: user.username,
            createdAt: user.createdAt,
          };
          useStorage("JSESSIOND", user.sessionId);
          (socket as any)._id = user._id;
          (socket as any).uuid = user.uuid;
          (socket as any).username = user.username;
          isLoggedIn.value = true;
        }
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  // session
  const getSession = async (sessionID: string) => {
    isLoading.value = true;
    isLoggedIn.value = false;
    await instance
      .get(`getsession?session_id=${sessionID}`)
      .then((response) => {
        if (response.data) userSessionData.value = response.data;
        socket.auth = { ...userSessionData.value };
        socket.connect();
        isLoggedIn.value = true;
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  // update
  const updateSession = async (session: {
    uuid?: string;
    sessionId?: string;
    connected: boolean;
  }) => {
    await instance
      .post("/updatesession", {
        uuid: session.uuid,
        session_id: session.sessionId,
        connected: session.connected,
      })
      .then((response) => {
        responseResult.value = response.data
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
        isLoggedIn.value = true;
      });
  };

  return {
    userSessionData,
    isLoggedIn,
    isLoading,
    responseError,
    responseResult,
    getAllSessions,
    getSession,
    updateSession,
    addSession,
  };
});
