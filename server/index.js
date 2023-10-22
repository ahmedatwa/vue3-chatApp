import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { instrument } from "@socket.io/admin-ui";
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 500,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

const port = process.env.VITE_SERVER_PORT || 3000;
const httpServer = createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('Hello World!');
  res.end()
});

const io = new Server(httpServer, {
   connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
  cors: {
     origin: ["http://localhost:5173"],
     credentials: true,
   },
  // withCredentials: true,
});

instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2a$12$rIo6oFSHNjK7GpzK6VqXCuoUxjZG4f61zYdSchwblVrzTrt9wZwZG" // "changeit" encrypted with bcrypt
  },
  mode: "development",
});

io.use(async (socket, next) => {
  const socketAuth = socket.handshake.auth;

  try {
    const sessionId = socket.handshake.auth.sessionId;
    if (sessionId) {
      socket._id = socketAuth._id;
      socket.sessionId = sessionId;
      socket.uuid = socketAuth.uuid;
      socket.username = socketAuth.username;
      return next();
    }
    // socket.sessionId = socketAuth.sessionId;
    // socket.uuid = socketAuth.uuid;
    // socket.username = socketAuth.username;
    // next();
  } catch (error) {
    if (socketAuth.uuid === undefined) {
      return next(new Error("invalid User ID", error));
    }
  }
});

io.on("connection", async (socket) => {
  // emit session details and save
  const sessionData = {
    _id: socket._id,
    sessionId: socket.sessionId,
    uuid: socket.uuid,
    username: socket.username,
    connected: socket.connected,
    messages: [],
  };
  socket.emit("session", sessionData);
  // join the "uuid" room
  socket.join(socket.uuid);

  // notify existing users
  socket.broadcast.emit("user_connected", sessionData);
  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("server_new_message", ({ content, file, to, createdAt, count }) => {
    socket.to(to).to(socket.uuid).emit("client_new_message", {
      content,
      file,
      from: socket.uuid,
      to,
      createdAt,
      count,
    });
  });

  // notify user typing event
  socket.on("typing", ({ to, input }) => {
    socket
      .to(to)
      .to(socket.uuid).timeout(500).emit("user_typing", { input: input, from: socket.uuid, username: socket.username });
  });

  // notify users upon disconnection
  socket.on("disconnect", async (reason, details) => {
    socket.broadcast.emit("user_disconnected", socket.uuid, reason);
    // console.log(details.context.responseText);
    const matchingSockets = await io.in(socket.uuid).fetchSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user_disconnected", socket.uuid, reason);
    }
  });

  // channels
  socket.on("create-room", ({_roomId, name, createdBy}) => {
    socket.join(_roomId)
    socket.broadcast.emit(`room ${_roomId} was created`)
});

socket.on("on-join-room", ({uuid, _roomId, name, createdBy}) => {
  console.log(uuid);
  socket.to(_roomId).emit('joined-room', {
    uuid: uuid,
    _roomId: _roomId,
    name: name,
    createdBy: createdBy
  })
});


}); // connection


io.of("/").adapter.on("create-room", (room) => {
  console.log(`room ${room} was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
// listening port
httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
