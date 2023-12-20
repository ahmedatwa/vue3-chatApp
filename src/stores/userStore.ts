import { defineStore } from "pinia";
import { ref, inject } from "vue";
import { instance, _userApi } from "@/axios";
import type { Snackbar } from "@/types/Chat";
import type { UserSettings, User } from "@/types/User";
import { nanoid } from "nanoid";
import { capitalize, createDateTime } from "@/helpers";
import { langKey } from "@/types/Symbols";

export const useUserStore = defineStore("userStore", () => {
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);
  const allUsers = ref<User[]>([]);
  const $lang = inject(langKey);

  const getAllUsers = async () => {
    isLoading.value = true;
    await instance
      .get(_userApi.getAllUsers)
      .then((response) => {
        if (response.data) {
          response.data.forEach((user: User) => {
            allUsers.value.push({
              _id: user._id,
              _uuid: user._uuid,
              _channelID: user._channelID || null,
              displayName: user.displayName,
              firstName: user.firstName,
              lastName: user.lastName,
              image: user.image.length ? import.meta.env.VITE_API_UPLOAD_URL + user.image : '',
              email: user.email,
              connected: user.connected || false,
              visible: user.visible,
              settings: user.settings,
              messages: [],
              pagination: null,
              createdAt: user.createdAt,
            });
          });
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
        displayName: capitalize(form.firstName + " " + form.lastName),
        status: 1,
        settings: {
          theme: "light",
          leftOff: 1,
          muteConnectionNotif: 0,
        },
      })
      .then((response) => {
        allUsers.value.push({ ...response.data, createdAt: createDateTime() });
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
    displayName?: string | null,
    image?: File | null
  ) => {
    isLoading.value = true;
    let formData = new FormData();
    formData.append("_uuid", _uuid as string);
    settings ? formData.append("settings", JSON.stringify(settings)) : null;
    displayName !== null ? formData.append("displayName", displayName as string) : null;
    image ? formData.append("image", image) : null;
    await instance
      .post(_userApi.updateUserSettings, formData)
      .then((response) => {
        if (response.status === 200) {
          newAlert.value = {
            text: $lang?.getLine("preference.success", ["profile settings"]),
            type: "success",
          };
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

  const updateUserStatus = async (
    _uuid: string | number,
    connected: boolean | null,
    visible: boolean | null
  ) => {
    isLoading.value = true;
    await instance
      .post(_userApi.updateUserStatus, {
        _uuid,
        visible,
        connected,
      })
      .then((_response) => {})
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
  return {
    newAlert,
    allUsers,
    updateUserStatus,
    updateUserSettings,
    getUser,
    createUser,
    getAllUsers,
    getAllChannels,
  };
});
