import { defineStore } from "pinia";
import { computed } from "vue";
import type { UserAppSettings } from "@/types";
import { createDateTime } from "@/helpers";

export const useStorageStore = defineStore("storageStore", () => {
  const setStorage = (key: string, data: object | string | []) => {
    if (typeof data === "object") {
      localStorage.setItem(
        key,
        JSON.stringify({ ...data, date: createDateTime() })
      );
    } else {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  const getStorage = (key: string) => {
    const $_ = localStorage.getItem(key);
    if ($_) {
      return JSON.parse($_);
    }
    return null
  };

  const sessionID = computed((): string | null => {
    return getStorage("JSESSIOND");
  });

  const userStorageSettings = computed((): UserAppSettings => {
    return getStorage("APPUSSTIG");
  });

  const getLastSelectedElement = computed(
    (): { _id: string; comp: string } | null => {
      return getStorage("LSTSELECD");
    }
  );

  const destroy = () => {
    localStorage.clear();
    location.reload();
  };

  // const userSettingData = shallowRef<UserAppSettings | null>(null);

  // // const userAppSettings = computed((): UserAppSettings | null => {
  // //   return settingData.value ? settingData.value : getUserAppSettings();
  // // });

  // const sessionID = computed(() => {
  //   return getSessionID();
  // });

  // const setLocalStorage = (key: string, data: object) => {
  //   if (key) {
  //     localStorage.setItem(key, JSON.stringify({ ...data }));
  //   }
  // };

  // // session id
  // const setSessionID = (id: string) => {
  //   localStorage.setItem("JSESSIOND", id);
  // };

  // const getSessionID = (): string | undefined => {
  //   const $_ = localStorage.getItem("JSESSIOND");
  //   if ($_) {
  //     return $_;
  //   }
  // };

  // // App Settings
  // const setUserAppSettings = (setting: UserAppSettings) => {
  //   const now = createDateTime();
  //   localStorage.setItem(
  //     "APPUSSTIG",
  //     JSON.stringify({
  //       ...setting,
  //       date: now,
  //     })
  //   );
  //   userSettingData.value = {
  //     theme: setting.theme,
  //     connectionNotif: setting.connectionNotif,
  //     date: now,
  //   };
  // };

  // const getUserAppSettings = async (): Promise<UserAppSettings | null> => {
  //   const $_ = localStorage.getItem("APPUSSTIG");
  //   if ($_) {
  //     const items = await JSON.parse($_);
  //     userSettingData.value = items ;
  //     return items;
  //   }
  //    return null;
  // };

  // // Last Selected
  // const setLastSelected = (selected: {
  //   _id: string | number;
  //   comp: string;
  // }) => {
  //   localStorage.setItem(
  //     "LSTSELECD",
  //     JSON.stringify({
  //       ...selected,
  //       date: createDateTime(),
  //     })
  //   );
  // };

  // const getLastSelected = (): { _id: string; comp: string } | undefined => {
  //   const $_ = localStorage.getItem("LSTSELECD");
  //   if ($_) {
  //     return JSON.parse($_);
  //   }
  // };

  return {
    getLastSelectedElement,
    userStorageSettings,
    sessionID,
    destroy,
    setStorage,
  };
});
