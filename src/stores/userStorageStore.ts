import { defineStore } from "pinia";
import { useNow, useDateFormat, useStorage } from "@vueuse/core";
import { shallowRef, toValue } from "vue";

export const useStorageStore = defineStore("storageStore", () => {
  const formattedDate = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");

  const setLocalStorage = (key: string, data: object) => {
    if (key) {
      const state = useStorage(key, { ...data }, localStorage, {
        mergeDefaults: true,
      });

      state.value = data;
    }
  };

  // const getLocalStorage = (name: string, key?: string) => {
  //   values.value = null;
  //   if (key) {
  //     // console.log(key);

  //     const $_ = localStorage.getItem(name);
  //     if ($_) {
  //       const items = JSON.parse($_);
  //       if (items[key]) {
  //         return items[key];
  //       }
  //     }
  //   }

  //   return localStorage.getItem(name) ? localStorage.getItem(name) : null;
  // };
  // session id
  const setSessionId = (id: string) => {
    const state = useStorage("JSESSIOND", id, localStorage, {
      mergeDefaults: true,
    });
    state.value = id;
  };

  const getSessionId = (): string | undefined => {
    const $_ = localStorage.getItem("JSESSIOND");
    if ($_) {
      return $_;
    }
  };

  // App Settings
  const setAppSettings = (setting: {
    theme: string;
    connectionNotif: boolean;
    date?: string;
  }) => {
    const state = useStorage(
      "APPUSSTIG",
      { ...setting, date: formattedDate.value },
      localStorage,
      {
        mergeDefaults: true,
      }
    );
    state.value.theme = setting.theme;
    state.value.connectionNotif = setting.connectionNotif;
    state.value.date = formattedDate.value;
  };

  const getAppSettings = (key?: string): object | string | null => {
    const $_ = localStorage.getItem("APPUSSTIG");
    const data = shallowRef<object | null>(null);
    if ($_) {
      const items = JSON.parse($_);
      if (key) {
        data.value = items[key];
      }
    }
    return toValue(data);
  };

  // Last Selected
  const setLastSelected = (selected: Record<"_id" | "comp", string>) => {
    const state = useStorage(
      "LSTSELECD",
      { ...selected, date: formattedDate.value },
      localStorage,
      {
        mergeDefaults: true,
      }
    );
    state.value._id = selected._id;
    state.value.comp = selected.comp;
    state.value.date = formattedDate.value;
  };

  const getLastSelected = (): { _id: string; comp: string } | undefined => {
    const $_ = localStorage.getItem("LSTSELECD");
    if ($_) {
      return JSON.parse($_);
    }
  };

  return {
    setLocalStorage,
    setAppSettings,
    getLastSelected,
    setLastSelected,
    setSessionId,
    getAppSettings,
    getSessionId,
  };
});
