import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import { instance, sessionApi } from "@/axios";
import { User, UserSessionData } from "@/types/User";
import { useStorageStore, useDirectMessageStore } from "@/stores";
import { capitalize } from "@/helpers";
import socket from "@/client";
import { nanoid } from "nanoid";

export const useUserStore = defineStore("userStore", () => {
  const allUsers = ref<User[]>([]);

  const userSessionData = ref<UserSessionData>();
  const isLoggedIn = ref(false);
  const isLoading = ref(false);
  const sessionError = shallowRef();
  // stores
  const storageStore = useStorageStore();
  const directMessageStore = useDirectMessageStore();

  const getAllUsers = async () => {
    isLoading.value = true;
    await instance
      .get(sessionApi.__AllUsers)
      .then((response) => {
        if (response.status === 200 && response.statusText === "OK") {          
          response.data.forEach((user: User) => {
            allUsers.value.push({
              _id: user._id,
              _uuid: user._uuid,
              _channelID: user._channelID,
              sessionID: null,
              image: user.image,
              userName: user.userName,
              firstName: user.firstName,
              lastName: user.lastName,
              displayName: capitalize(user.firstName + " " + user.lastName),
              email: user.email,
              createdAt: user.createdAt,
              messages: [],
              connected: false
            });
          });
        }
      })
      .then((error) => {
        console.log(error);
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const createUser = async (form: {
    userName: string;
    firstName: string;
    lastName: string;
  }) => {
    isLoading.value = true;
    await instance
      .post(sessionApi.__createUser, {
        userName: form.userName,
        firstName: form.firstName,
        lastName: form.lastName,
        _channelID: nanoid(20)
      })
      .then((response) => {
        allUsers.value.push(response.data);
      })
      .then((error: any) => {
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

  // All Sockets
  const getDirectChannels = async (_uuid: string) => {
    isLoading.value = true;
    try {
      return await instance.get(sessionApi.__getDirectMessagesChannels, {
        params: {
          _uuid
        },
      });
    } catch (error: any) {
      sessionError.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const getUserChannels = async (uuid: string) => {
    isLoading.value = true;
    try {
      return await instance.get(sessionApi.__getChannels, {
        params: {
          _uuid: uuid,
        },
      });
    } catch (error: any) {
      sessionError.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const addSession = async (user: User) => {
    isLoading.value = true;
    let sessionID = nanoid(36)
    await instance
      .post(sessionApi.__addSession, {
        _uuid: user._uuid,
        connected: true,
        sessionID
      })
      .then((response) => {
        if (response?.statusText === "Created" && response.status === 201) {
          socket.auth = {
            _id: user._id,
            _uuid: user._uuid,
            _channelID: user._channelID,
            sessionID: sessionID,
            userName: user.userName,
            email: user.email,
            
          };
          // connect socket
          socket.connect();
          userSessionData.value = {
            _id: user._id,
            _uuid: user._uuid,
            _channelID: user._channelID,
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
          directMessageStore.users.push({...userSessionData.value })

          storageStore.setStorage("JSESSIOND", sessionID);
          (socket as any)._id = user._id;
          (socket as any)._uuid = user._uuid;
          (socket as any)._channelID = user._channelID;
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
            _channelID: response.data._channelID,
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
    allUsers,
    userSessionData,
    isLoggedIn,
    isLoading,
    sessionError,
    createUser,
    getAllUsers,
    getUserChannels,
    getDirectChannels,
    getSession,
    updateSession,
    addSession,
    restoreSession,
  };
});
