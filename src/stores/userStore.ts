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
    } catch (error) {
      console.log(error);
    }
  };

  const getAllChannels = async () => {
    try {
      return await instance.get(userApi.__getAllChannels)
    } catch (error: any) {
      newAlert.value = {
        code: error.code,
        text: error.message,
        type: "error",
      };
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
        if(response)
        getAllUsers()
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

  const getUser = (_uuid: string | string[]) => {
    return instance.get(userApi.__getUser, {
      params: {
        _uuid,
      },
    });
  };

  return {
    newAlert,
    getUser,
    createUser,
    getAllUsers,
    getAllChannels,
  };
});
