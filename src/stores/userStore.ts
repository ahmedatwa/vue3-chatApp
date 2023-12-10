import { defineStore } from "pinia";
import { ref } from "vue";
import { instance, userApi } from "@/axios";
import type { Snackbar } from "@/types";
import type { UserSettings, User } from "@/types/User";
import { nanoid } from "nanoid";
import { capitalize } from "@/helpers";

export const useUserStore = defineStore("userStore", () => {
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);
  const allUsers = ref<User[]>([])

  const getAllUsers = async () => {
    isLoading.value = true;
    
     await instance.get(userApi.__getAllUsers).then((response) => {
      if(response.data) {
        allUsers.value.push(...response.data)
      }
     }).catch ((error) => {
      newAlert.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
     }).finally (() => {
      isLoading.value = false;
     })
    }

  const getAllChannels = async () => {
    isLoading.value = true;
    try {
      return await instance.get(userApi.__getAllChannels);
    } catch (error: any) {
      newAlert.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (form: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    isLoading.value = true;
    await instance
      .post(userApi.__createUser, {
        ...form,
        _uuid: nanoid(20),
        _channelID: nanoid(15),
        displayName: capitalize(form.firstName + " " + form.lastName),
        status: 1,
      })
      .then((response) => {
        console.log(response.data);
        
        // Not nice but just for demo purpose
        //if (response) getAllUsers();
      })
      .then((error: any) => {
        newAlert.value = {
          code: error.code,
          text: error.message,
          type: "error",
        };
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const getUser = async (_uuid: string | string[]) => {
    isLoading.value = true;
    try {
      return await instance.get(userApi.__getUser, {
        params: {
          _uuid,
        },
      });
    } catch (error: any) {
      newAlert.value = {
        code: error.code,
        text: "User Not Found",
        type: "error",
      };
    } finally {
      isLoading.value = false;
    }
  };

  const updateUserSettings = async (settings: UserSettings, _channelID: string | number) => {
    await instance
      .post("/updateUserSeetings", {
        settings: settings,
        _channelID
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {});
  };
  return {
    newAlert,
    allUsers,
    updateUserSettings,
    getUser,
    createUser,
    getAllUsers,
    getAllChannels,
  };
});
