import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false,
 // withCredentials: true,
});

socket.onAny((event, ...args) => {
  console.log("client", event, args);
});

setInterval(() => {
  const start = Date.now();
  socket.emit("ping", () => {
    console.log(`pong (latency: ${Date.now() - start} ms)`);
  });
}, 1000);


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
}

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
}

// Direct Messages
export const _directMessageEmits = {
  newMessage: "new_direct_message",
  newThreadMessage: "new_direct_thread_message",
  typing: "user_typing",
  threadTyping: "thread_user_typing",
  userDisconnected: "user_disconnected",
  status: "user_status",
}

export const _directMessageListener = {
  newMessage: "client_new_direct_message",
  newThreadMessage: "client_new_direct_thread_message",
  typing: "client_user_typing",
  threadTyping: "client_thread_user_typing",
  userDisconnected: "client_user_disconnected",
  connected: "user_connected",
  disconnect: "disconnect",
  status: "client_user_status",
}

export default socket

 