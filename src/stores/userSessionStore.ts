import { defineStore } from "pinia";
import { ref } from "vue";
import { instance } from "@/axios";
import { UserSessionData, DBUser } from "@/types";
import socket from "@/client";
import { useStorageStore } from "@/stores";

export const useSessionStore = defineStore("userSession", () => {
  const userSessionData = ref<UserSessionData>();
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const responseError = ref();
  const responseResult = ref(null);
  const storageStore = useStorageStore();

  // All Sockets
  const getAllSessions = async () => {
    isLoading.value = true;
    try {
      return await instance.get(`/getallsessions?connected=1`);
    } catch (error) {
      responseError.value = error;
    } finally {
      isLoading.value = false;
    }
  };

  const addSession = async (user: DBUser) => {
    isLoading.value = true;
    await instance
      .post("/addsession", {
        _uuid: user._uuid,
        session_id: user.sessionId,
        connected: true,
      })
      .then((response) => {
        if (response?.statusText === "Created") {
          socket.auth = {
            _id: user._id,
            _uuid: user._uuid,
            sessionId: user.sessionId,
            username: user.username,
            image: user.image,
          };
          // connect socket
          socket.connect();
          userSessionData.value = {
            _id: user._id,
            _uuid: user._uuid,
            image: user.image,
            connected: true,
            sessionId: user.sessionId!,
            username: user.username,
            createdAt: user.createdAt,
          };
          storageStore.setSessionId(user.sessionId!);
          (socket as any)._id = user._id;
          (socket as any)._uuid = user._uuid;
          (socket as any).username = user.username;
          isLoggedIn.value = true;
        }
      })
      .catch((error) => {
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
      .catch((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  // update
  const updateSession = async (session: {
    _uuid?: string;
    sessionId?: string;
    connected: boolean;
  }) => {
    await instance
      .post("/updatesession", {
        _uuid: session._uuid,
        session_id: session.sessionId,
        connected: session.connected,
      })
      .then((response) => {
        responseResult.value = response.data;
      })
      .catch((error) => {
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
