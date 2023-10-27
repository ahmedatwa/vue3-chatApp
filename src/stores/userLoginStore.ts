import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { instance } from "@/axios";
import { DBUser } from "@/types";

export const useLoginStore = defineStore("loginUser", () => {
  const users = ref<DBUser[]>([]);
  const isLoading = ref(false);
  const username = ref("");
  const responseError = ref();
  const responseResult = ref(null)

  const isValid = computed(() => {
    return username.value.length > 2;
  });

  const getAllUsers = async () => {
    isLoading.value = true;
    await instance
      .get("/all")
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
      .post(`/create?username=${username.value}`)
      .then((response) => {
        responseResult.value = response.data;
      })
      .then((error) => {
        responseError.value = error;
      })
      .finally(() => {
        isLoading.value = false;
        username.value = "";
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
    username,
    isValid
  };
});
