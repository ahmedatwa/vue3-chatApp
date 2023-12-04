import { defineStore } from "pinia";
import { ref } from "vue";
// stores
import { useStorageStore } from "@/stores";
// axios
import { instance, sessionApi } from "@/axios";
// types
import type { User, UserSessionData } from "@/types/User";
import type { Snackbar } from "@/types";
import { capitalize } from "@/helpers";
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
            _id: response.data._id,
            _uuid: response.data._uuid,
            image: response.data.image,
            connected: response.data.connected,
            sessionID: response.data.sessionID,
            email: response.data.email,
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
          socket.auth = {
            _id: user._id,
            _uuid: user._uuid,
            sessionID: sessionID,
            userName: user.userName,
            email: user.email,
          };
          // connect socket
          socket.connect();
          userSessionData.value = {
            _id: user._id,
            _uuid: user._uuid,
            image: user.image,
            connected: true,
            sessionID: sessionID,
            userName: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            displayName: capitalize(user.firstName + " " + user.lastName),
            createdAt: user.createdAt,
          };

          storageStore.setStorage("JSESSIOND", sessionID);

          (socket as any)._id = user._id;
          (socket as any)._uuid = user._uuid;
          (socket as any).userName = user.userName;
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
