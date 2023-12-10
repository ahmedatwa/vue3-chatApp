import { defineStore } from "pinia";
import { ref } from "vue";
// stores
import { useStorageStore } from "@/stores";
// axios
import { instance, sessionApi } from "@/axios";
// types
import type { User, UserSessionData } from "@/types/User";
import type { Snackbar } from "@/types";
import socket from "@/client";
import { nanoid } from "nanoid";

export const useSessionStore = defineStore("sessionStore", () => {
  // stores
  const storageStore = useStorageStore();
  const userSessionData = ref<UserSessionData>();
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);

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
            ...response.data,
          };
          socket.auth = { ...userSessionData.value };
          socket.connect();
          (socket as any)._id = response.data._id;
          (socket as any)._uuid = response.data._uuid;
          (socket as any).sessionID = response.data.sessionID;
          (socket as any).email = response.data.email;
          (socket as any).displayName = response.data.displayName;
          isLoggedIn.value = true;
        }
      })
      .catch((err) => {
        newAlert.value = {
          code: err.code,
          text: err.message,
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
      .catch((err) => {
        newAlert.value = {
          code: err.code,
          text: err.message,
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
      .catch((err) => {
        newAlert.value = {
          code: err.code,
          text: err.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const addSession = async (user: User) => {
    isLoading.value = true;
    let sessionID = nanoid(36);
    await instance
      .post(sessionApi.__addSession, {
        _uuid: user._uuid,
        connected: true,
        sessionID,
      })
      .then((response) => {
        if (response?.statusText === "Created" && response.status === 201) {
          userSessionData.value = {
            ...user,
            connected: true,
            sessionID: sessionID,
          };

          socket.auth = { ...userSessionData.value };
          // connect socket
          socket.connect();

          storageStore.setStorage("JSESSIOND", sessionID);

          (socket as any)._id = user._id;
          (socket as any)._uuid = user._uuid;
          (socket as any).sessionID = sessionID;
          (socket as any).email = user.email;
          (socket as any).displayName = user.displayName;
          isLoggedIn.value = true;
        }
      })
      .catch((err) => {
        newAlert.value = {
          code: err.code,
          text: err.message,
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
    newAlert,
    getSession,
    updateSession,
    addSession,
    restoreSession,
  };
});
