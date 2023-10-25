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
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello World!");
  res.end();
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
    password: "$2a$12$rIo6oFSHNjK7GpzK6VqXCuoUxjZG4f61zYdSchwblVrzTrt9wZwZG", // "changeit" encrypted with bcrypt
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
      socket._uuid = socketAuth._uuid;
      socket.username = socketAuth.username;
      return next();
    }
    // socket.sessionId = socketAuth.sessionId;
    // socket.uuid = socketAuth.uuid;
    // socket.username = socketAuth.username;
    // next();
  } catch (error) {
    if (socketAuth._uuid === undefined) {
      return next(new Error("invalid User ID", error));
    }
  }
});

io.on("connection", async (socket) => {
  // emit session details and save
  const sessionData = {
    _id: socket._id,
    _uuid: socket._uuid,
    sessionId: socket.sessionId,
    username: socket.username,
    connected: socket.connected,
    messages: [],
  };
  socket.emit("session", sessionData);
  // join the "uuid" room
  socket.join(socket._uuid);

  // notify existing users
  socket.broadcast.emit("user_connected", sessionData);
  // forward the private message to the right recipient (and to other tabs of the sender)
  socket.on("user_new_message", ({ content, file, to, createdAt, count }) => {
    socket.to(to).to(socket._uuid).emit("client_user_new_message", {
      content,
      file,
      from: socket._uuid,
      to,
      createdAt,
      count,
    });
  });

  // notify user typing event
  socket.on("user_typing", ({ to, input }) => {
    socket
      .to(to)
      .to(socket._uuid)
      .timeout(500)
      .emit("client_user_typing", {
        input: input,
        from: socket._uuid,
        username: socket.username,
      });
  });

  // notify users upon disconnection
  socket.on("disconnect", async (reason, details) => {
    socket.broadcast.emit("user_disconnected", socket._uuid, reason);
    // console.log(details.context.responseText);
    const matchingSockets = await io.in(socket._uuid).fetchSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user_disconnected", socket._uuid, reason);
    }
  });

  // channels
  socket.on("create_room", ({ _roomId, name, createdBy }) => {
    socket.join(_roomId);
    socket.broadcast.to(_roomId).emit("client_create_room", {
      _roomId: _roomId,
      room: socket.room,
      name: name,
      createdBy: createdBy,
    });
  });

  socket.on("join_room", ({ _roomId, room, createdBy }) => {
    socket.join(_roomId);
    socket.broadcast.to(_roomId).emit("client_join_room", {
      username: socket.username,
      roomName: room,
      createdBy: createdBy,
    });
  });

  socket.on("new_room_message", (messageContent) => {
    socket.broadcast.to(messageContent.room).emit("client_new_room_message", messageContent);
  });

  socket.on("room_typing", ({ _roomId, input }) => {
    socket.broadcast
      .to(_roomId)
      .timeout(500)
      .emit("client_room_typing", {
        input: input,
        from: socket._uuid,
        username: socket.username,
      });
  });

  socket.on("delete_room_message", (message) => {
    console.log(message)
    socket.broadcast
      .to(message.room).emit("client_delete_room_message", message);
  });

    socket.on("edit_room_message", ({channel}) => {
    socket.broadcast
      .to(channel._roomId).emit("client_edit_room_message", {
      channel,
    });
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
