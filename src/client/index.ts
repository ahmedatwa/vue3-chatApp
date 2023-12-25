import { io } from "socket.io-client";
import { shallowRef } from "vue";
import type { Snackbar } from "@/types/Chat";

export const socketError = shallowRef<Snackbar | null>(null);
const reconnectAttempt = shallowRef(0);

const socket = io("http://localhost:3000", {
  autoConnect: false,
  reconnectionAttempts: 10,
  reconnection: true,
  // withCredentials: true,
});

socket.onAny((event, ...args) => {
  console.log("client", event, args);
});

socket.io.on("error", (error) => {
  socketError.value = {
    isSnackbar: true,
    title: error.name + ": Server Connection Lost.",
    text: `reconnection attempt: ${reconnectAttempt.value}`,
    type: "error",
  };
});

socket.io.on("ping", () => {
  setInterval(() => {
    const start = Date.now();
    socket.emit("ping", () => {
      console.log(`pong (latency: ${Date.now() - start} ms)`);
    });
  }, 1000);
});

socket.io.on("reconnect_attempt", (attempt) => {
  reconnectAttempt.value = attempt;
});

socket.io.on("reconnect_failed", () => {
  socketError.value = {
    isSnackbar: true,
    title: "Server Down.",
    text: `reconnection attempt: ${reconnectAttempt.value}`,
    type: "error",
  };
});

socket.io.on("reconnect", () => {
  socketError.value = {
    isSnackbar: false,
    text: '',
    type: ''
  }
});

// Channel
export const _channelEmits = {
  newMessage: "new_channel_message",
  newThreadMessage: "new_channel_thread_message",
  create: "create_channel",
  editMessage: "edit_channel_message",
  deleteMessage: "delete_channel_message",
  typing: "channel_typing",
  threadTyping: "channel_thread_typing",
  updateMembers: "update_members_channel",
  removedMembers: "remove_members_channel",
};

export const _channelListener = {
  newMessage: "client_new_channel_message",
  newThreadMessage: "client_channel_thread_message",
  editMessage: "client_edit_channel_message",
  deleteMessage: "client_delete_channel_message",
  createChannel: "client_create_channel",
  joinChannel: "client_join_channel",
  typing: "client_channel_typing",
  threadTyping: "client_channel_thread_typing",
  updateMembers: "client_update_members_channel",
  removedMembers: "client_remove_members_channel",
};

// Direct Messages
export const _directMessageEmits = {
  newMessage: "new_direct_message",
  newThreadMessage: "new_direct_thread_message",
  typing: "user_typing",
  threadTyping: "thread_user_typing",
  userDisconnected: "user_disconnected",
  status: "user_status",
};

export const _directMessageListener = {
  newMessage: "client_new_direct_message",
  newThreadMessage: "client_new_direct_thread_message",
  typing: "client_user_typing",
  threadTyping: "client_thread_user_typing",
  userDisconnected: "client_user_disconnected",
  connected: "user_connected",
  disconnect: "disconnect",
  status: "client_user_status",
};

export default socket;
