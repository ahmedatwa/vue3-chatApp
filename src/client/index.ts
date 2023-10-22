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

export default socket;
