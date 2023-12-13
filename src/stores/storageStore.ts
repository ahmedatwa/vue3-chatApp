import { defineStore } from "pinia";
import { computed } from "vue";
import type { UserSettings } from "@/types/User";
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
    return null;
  };

  const sessionID = computed((): string | null => {
    return getStorage("JSESSIOND");
  });

  const userStorageSettings = computed((): UserSettings => {
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

  return {
    getLastSelectedElement,
    userStorageSettings,
    sessionID,
    destroy,
    setStorage,
  };
});
