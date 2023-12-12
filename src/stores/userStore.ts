import { defineStore } from "pinia";
import { ref } from "vue";
import { instance, _userApi } from "@/axios";
import type { Snackbar } from "@/types";
import type { UserSettings, User } from "@/types/User";
import { nanoid } from "nanoid";
import { capitalize } from "@/helpers";

export const useUserStore = defineStore("userStore", () => {
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);
  const allUsers = ref<User[]>([]);

  const getAllUsers = async () => {
    isLoading.value = true;
    await instance
      .get(_userApi.getAllUsers)
      .then((response) => {
        if (response.data) {
          allUsers.value.push(...response.data);
        }
      })
      .catch((error) => {
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

  const getAllChannels = async () => {
    isLoading.value = true;
    try {
      return await instance.get(_userApi.getAllChannels);
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
      .post(_userApi.createUser, {
        ...form,
        _uuid: nanoid(20),
        _channelID: nanoid(15),
        displayName: capitalize(form.firstName + " " + form.lastName),
        status: 1,
        settings: {
          theme: "light",
          leftOff: false,
          muteConnectionNotif: false,
          visible: 1,
          connected: 1,
        },
      })
      .then((response) => {
        allUsers.value.push({ ...response.data });
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
      return await instance.get(_userApi.getUser, {
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

  const updateUserSettings = async (
    _uuid: string | number,
    settings: UserSettings | null,
    visible: boolean,
    displayName?: string,
    image?: string
  ) => {
    await instance
      .post(_userApi.updateUserSeetings, {
        _uuid,
        settings,
        visible,
        displayName,
        image,
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
