import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { instance, userApi } from "@/axios";
import type { DBUser, CreateUserForm } from "@/types/User.ts";

export const useLoginStore = defineStore("loginUser", () => {
  const users = ref<DBUser[]>([]);
  const isLoading = ref(false);
  
  const form: CreateUserForm = reactive({
    userName: "",
    firstName: "",
    lastName: ""
  })
 
  
  const responseError = ref();
  const responseResult = ref(null);

  const getAllUsers = async () => {
    isLoading.value = true;
    await instance
      .get(userApi.__AllUsers)
      .then((response): void => {
        users.value = response.data;
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };

  const createUser = async () => {
    isLoading.value = true;
    await instance
      .post(userApi.__createUser, {
        userName: form?.firstName.toLowerCase() + form?.lastName.toLowerCase(),
        firstName: form?.firstName,
        lastName: form?.lastName,
      })
      .then((response) => {
        users.value.push(...response.data)
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
        getAllUsers();
      });
  };

  return {
    getAllUsers,
    createUser,
    responseResult,
    responseError,
    users,
    isLoading,
    form,
  };
});
