import { defineStore } from "pinia";
import { useNow, useDateFormat, useStorage } from "@vueuse/core";
import { shallowRef, toValue } from "vue";
import { Settings } from "@/types"

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

  const getAppSettings = (key?: string): Settings | string => {    
    const $_ = localStorage.getItem("APPUSSTIG");
    const data = shallowRef<Settings | string>("");
    if ($_) {
      const items = JSON.parse($_);      
      if (key !== undefined) {
        data.value = items[key];
      } else {
        data.value =  items;
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
