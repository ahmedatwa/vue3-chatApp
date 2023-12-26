import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import type { UserSettings, LastSelectedEl } from "@/types/User";
import { createDateTime } from "@/helpers";

export const useStorageStore = defineStore("storageStore", () => {
  const lastSelectedElement = shallowRef<LastSelectedEl | null>(null);

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
    (): {
      current: LastSelectedEl | null;
      prev: LastSelectedEl | null;
    } => {
      return getStorage("LSTSELECD");
    }
  );

  const destroy = () => {
    localStorage.clear();
    location.reload();
  };

  return {
    getLastSelectedElement,
    lastSelectedElement,
    userStorageSettings,
    sessionID,
    destroy,
    setStorage,
  };
});
