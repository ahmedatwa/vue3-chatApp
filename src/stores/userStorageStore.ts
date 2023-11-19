import { defineStore } from "pinia";
import { shallowRef, computed } from "vue";
import { Settings } from "@/types";
import { formatDate } from "@/helpers";

export const useStorageStore = defineStore("storageStore", () => {
  const settingData = shallowRef<Settings | null>(null);

  const appSettings = computed((): Settings | null => {
    return settingData.value ? settingData.value : getAppSettings();
  });
  const sessionId = computed(() => {
    return getSessionId();
  });

  const setLocalStorage = (key: string, data: object) => {
    if (key) {
      localStorage.setItem(key, JSON.stringify({ ...data }));
    }
  };

  // session id
  const setSessionId = (id: string) => {
    localStorage.setItem("JSESSIOND", id);
  };

  const getSessionId = (): string | undefined => {
    const $_ = localStorage.getItem("JSESSIOND");
    if ($_) {
      return $_;
    }
  };

  // App Settings
  const setAppSettings = (setting: Settings) => {
    localStorage.setItem(
      "APPUSSTIG",
      JSON.stringify({
        ...setting,
        date: formatDate(),
      })
    );
    settingData.value = {
      theme: setting.theme,
      connectionNotif: setting.connectionNotif,
      date: setting.date,
    };
  };

  const getAppSettings = (): Settings | null => {
    const $_ = localStorage.getItem("APPUSSTIG");
    if ($_) {
      const items = JSON.parse($_);
      settingData.value = items;
      return items;
    }
    return null;
  };

  // Last Selected
  const setLastSelected = (selected: {
    _id: string | number;
    comp: string;
  }) => {
    localStorage.setItem(
      "LSTSELECD",
      JSON.stringify({
        ...selected,
        date: formatDate(),
      })
    );
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
    getSessionId,
    appSettings,
    sessionId,
  };
});
