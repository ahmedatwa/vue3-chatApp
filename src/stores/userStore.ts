import { defineStore } from "pinia";
import { ref, inject, computed } from "vue";
import { instance, _userApi } from "@/axios";
import { nanoid } from "nanoid";
import { capitalize, createDateTime } from "@/helpers";
import { langKey } from "@/types/Symbols";
// Types
import type { Snackbar, UploadedFiles } from "@/types/Chat";
import type { UserSettings, User } from "@/types/User";

export const useUserStore = defineStore("userStore", () => {
  const isLoading = ref(false);
  const newAlert = ref<Snackbar | null>(null);
  const allUsers = ref<User[]>([]);
  const downloadedFiles = ref<UploadedFiles[] | null>(null);
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
              firstName: capitalize(user.firstName),
              lastName: capitalize(user.lastName),
              image: user.image.length
                ? import.meta.env.VITE_API_UPLOAD_URL + user.image
                : "",
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

  const mappedUsers = computed(() => {
    return allUsers.value.map(({ _uuid, displayName, email, createdAt }) => {
      return {
        _uuid,
        displayName,
        email,
        createdAt,
      };
    });
  });

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
    displayName: string | null,
    image: File | null
  ) => {
    isLoading.value = true;
    let formData = new FormData();
    formData.append("_uuid", _uuid as string);
    settings ? formData.append("settings", JSON.stringify(settings)) : null;
    displayName ? formData.append("displayName", displayName as string) : null;
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

  const updateUser = async (
    _uuid: string | number,
    data: {
      key: string;
      value: boolean | string;
    }
  ) => {
    isLoading.value = true;
    await instance
      .post(_userApi.updateUser, {
        _uuid,
        data,
      })
      .then((response) => {
        if (response.status === 200)
          newAlert.value = {
            text: $lang?.getLine("chat.success.status"),
            type: "success",
          };
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

  const getUserFilesDownloads = async (_uuid: string | undefined) => {
    await instance
      .get(_userApi.getUserFilesDownloads, {
        params: {
          _uuid,
        },
      })
      .then((response) => {
        if (response.status === 200 && response.statusText === "OK") {
          if (response.data.length) downloadedFiles.value = response.data;
        }
      });
  };

  const downloadFiles = async (_uuid: string, file: UploadedFiles) => {
    await instance
      .get(_userApi.downloadFile, {
        params: {
          path: file.path,
          name: file.name,
          fileID: file._id,
          _uuid,
        },
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data], { type: file.type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch((error) => {
        newAlert.value = {
          title: $lang?.getLine("chat.error.download"),
          text: error.code + " " + error.message,
          type: "error",
        };
      });
  };

  const clearDownloads = async (_uuid: string) => {
    await instance
      .post(_userApi.clearDownloads, {
        _uuid,
      })
      .then((response) => {
        console.log(response);

        if (response.status === 200) {
          downloadedFiles.value = null;
          newAlert.value = {
            text: $lang?.getLine("chat.success.clear"),
            type: "success",
          };
        }
      })
      .catch((error) => {
        newAlert.value = {
          title: error.code,
          text: error.message,
          type: "error",
        };
      });
  };
  return {
    newAlert,
    allUsers,
    downloadedFiles,
    mappedUsers,
    clearDownloads,
    updateUser,
    updateUserSettings,
    downloadFiles,
    getUser,
    createUser,
    getAllUsers,
    getAllChannels,
    getUserFilesDownloads,
  };
});
