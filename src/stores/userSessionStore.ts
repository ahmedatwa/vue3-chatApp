import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import { instance, sessionApi } from "@/axios";
import { DBUser } from "@/types/User.ts";
import { SessionError, UserSessionData } from "@/types/Session.ts";
import { useStorageStore } from "@/stores";
import socket from "@/client";
import { capitalize } from "@/helpers";

export const useSessionStore = defineStore("userSession", () => {
  const userSessionData = ref<UserSessionData>();
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const sessionError = shallowRef<SessionError | null>(null);
  const storageStore = useStorageStore();

  // All Sockets
  const getAllSessions = async () => {
    isLoading.value = true;
    try {
      return await instance.get(sessionApi.__getSessions, {
        params: {
          connected: 1,
        },
      });
    } catch (error) {
      // sessionError.value = {
      //   code: error.code,
      //   text: error.message,
      //   type: "error",
      // };
    } finally {
      isLoading.value = false;
    }
  };

  const addSession = async (user: DBUser) => {
    isLoading.value = true;
    await instance
      .post(sessionApi.__addSession, {
        _uuid: user._uuid,
        sessionID: user.sessionID,
        connected: true,
      })
      .then((response) => {        
        if (response?.statusText === "Created" && response.status === 201) {          
          socket.auth = {
            _id: user._id,
            _uuid: user._uuid,
            sessionID: user.sessionID,
            userName: user.userName,
            //image: user.image,
          };
          // connect socket
          socket.connect();
          userSessionData.value = {
            _id: user._id,
            _uuid: user._uuid,
            image: user.image,
            connected: true,
            sessionID: user.sessionID,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            displayName: capitalize(user.firstName + " " + user.lastName),
            createdAt: user.createdAt,
          };
          storageStore.setSessionId(user.sessionID!);
          (socket as any)._id = user._id;
          (socket as any)._uuid = user._uuid;
          (socket as any).userName = user.userName;
          isLoggedIn.value = true;
        }
      })
      .catch((error) => {
        sessionError.value = {
          code: error.code,
          text: error.message,
          type: "error",
        };
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
      .get(sessionApi.__getSession, {
        params: {
          sessionID: sessionID,
          connected: 1,
        },
      })
      .then((response) => {
        if (response.data) {
          userSessionData.value = {
            _id: response.data._id,
            _uuid: response.data._uuid,
            image: response.data.image,
            connected: response.data.connected,
            sessionID: response.data.sessionID,
            email: response.data.sessionID,
            userName: response.data.userName,
            firstName: capitalize(response.data.firstName),
            lastName: capitalize(response.data.lastName),
            displayName: capitalize(
              response.data.firstName + " " + response.data.lastName
            ),
            createdAt: response.data.createdAt,
          };
          socket.auth = { ...userSessionData.value };
          socket.connect();
          isLoggedIn.value = true;
        }
      })
      .catch((error) => {
        sessionError.value = {
          code: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  // update
  const updateSession = async (session: {
    _uuid?: string;
    sessionID: string;
    connected: boolean;
  }) => {    
    isLoading.value = true;
    await instance
      .post(sessionApi.__updateSession, {
        _uuid: session._uuid,
        sessionID: session.sessionID,
        connected: session.connected,
      })
      .then((response) => {        
        if (response.status === 201 && response.statusText === "Created")
          if (session.connected === false) {
            isLoggedIn.value = false;
            localStorage.clear();
            location.reload();
          }
      })
      .catch((error) => {
        sessionError.value = {
          code: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  // Restore
  const restoreSession = async (sessionID: string) => {
    isLoading.value = true;
    await instance
      .post(sessionApi.__restoreSession, {
        sessionID,
      })
      .then((response) => {        
        if (response.status === 201 && response.statusText === "Created") {
          isLoggedIn.value = true;
          location.reload();
        }
      })
      .catch((error) => {
        sessionError.value = {
          code: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  return {
    userSessionData,
    isLoggedIn,
    isLoading,
    sessionError,
    getAllSessions,
    getSession,
    updateSession,
    addSession,
    restoreSession,
  };
});
