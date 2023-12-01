import { defineStore } from "pinia";
import { ref } from "vue";
import { useChannelStore, useDirectMessageStore } from "@/stores";
import { useStorageStore, useSessionStore } from "@/stores";
import { capitalize } from "@/helpers";
// types
import type { Channels } from "@/types/Channel";
import type { User } from "@/types/User";
import socket from "@/client";

export const useStateStore = defineStore("stateStore", () => {
  const userSessions = ref<User[]>([]);
  const channelSessions = ref<Channels[]>([]);
  // Stores
  const directMessageStore = useDirectMessageStore();
  const sessionStore = useSessionStore();
  const channelStore = useChannelStore();
  const storageStore = useStorageStore();

  

  // fired when socket disconnected


  

  

  return { channelSessions, userSessions };
});
