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
  create: "create_channel",
  addMembers: "add_members_to_channel",
  editMessage: "edit_channel_message",
  deleteMessage: "delete_channel_message",
  typing: "channel_typing",
}

export const _channelListener = {
  newMessage: "client_new_channel_message",
  editMessage: "client_edit_channel_message",
  deleteMessage: "client_delete_channel_message",

  createChannel: "client_create_channel",
  joinChannel: "client_join_channel",
  addMembers: "client_add_members_to_channel",
  typing: "client_channel_typing",
  
  
  
  
}

// Direct Messages

export const _messageEmits = {

}

export const _messageListener = {
  
}
export default socket

 