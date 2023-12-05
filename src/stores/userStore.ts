import { defineStore } from "pinia";
import { ref } from "vue";
import { instance, userApi } from "@/axios";
import type { Snackbar } from "@/types";

export const useUserStore = defineStore("userStore", () => {
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);

  const getAllUsers = async () => {
    isLoading.value = true;
    try {
      return await instance.get(userApi.__getAllUsers);
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
    userName: string;
    firstName: string;
    lastName: string;
  }) => {
    isLoading.value = true;
    await instance
      .post(userApi.__createUser, {
        userName: form.userName,
        firstName: form.firstName,
        lastName: form.lastName,
      })
      .then((response) => {
        // Not nice but just for demo purpose
        if (response) getAllUsers();
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

  const getUser = async(_uuid: string | string[]) => {
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

  return {
    newAlert,
    getUser,
    createUser,
    getAllUsers,
    getAllChannels,
  };
});
