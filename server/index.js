import { createServer } from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";


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

io.use((socket, next) => {
  const socketAuth = socket.handshake.auth;

  try {
    const sessionID = socket.handshake.auth.sessionID;
    if (sessionID) {
      socket._id = socketAuth._id;
      socket.sessionID = sessionID;
      socket.email = socketAuth.email;
      socket._channelID = socketAuth._channelID;
      socket._uuid = socketAuth._uuid;
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

io.on("connection", (socket) => {
  // emit session details and save
  const sessionData = {
    _id: socket._id,
    _uuid: socket._uuid,
    _channelID: socket._channelID,
    sessionID: socket.sessionID,
    userName: socket.userName,
    connected: socket.connected,
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
        userName: socket.userName,
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

  // Auto Join Channels on connect
    socket.on("channels", ( channels ) => {
     channels.forEach((channel) => {
      socket.join(channel)
     })
  });

  socket.on("create_channel", ({ _roomId, name, createdBy }) => {
    socket.join(_roomId);
    socket.broadcast.to(_roomId).emit("client_create_channel", {
      _roomId: _roomId,
      room: socket.room,
      name: name,
      createdBy: createdBy,
    });
  });

  socket.on("join_channel", ({ _roomId, room, createdBy }) => {
    socket.join(_roomId);
    socket.broadcast.to(_roomId).emit("client_join_channel", {
      userName: socket.userName,
      channelName: room,
      createdBy: createdBy,
    });
  });

  socket.on("add_members_to_channel", ({ _channelID, _uuid, channelName, createdBy, name }) => {
    socket.join(_channelID);
    socket.to(_uuid).to(_uuid).emit("client_add_members_to_channel", {
      channelName: channelName,
      from: socket.userName,
      to: _uuid
    })
    
  });

  socket.on("new_channel_message", ({ _id, _channelID, from, fromName, content, createdAt}) => {
    socket.broadcast.to(_channelID).emit("client_new_channel_message", { 
      _id: _id, 
      _channelID: _channelID,
      from: from, 
      fromName: fromName, 
      content: content, 
      createdAt: createdAt
    });
  });

    socket.on("new_channel_thread_message", ({ _id, _messageID, _channelID, from, fromName, to, toName, content, createdAt}) => {
    socket.broadcast.to(_channelID).emit("client_channel_thread_message", { 
      _id: _id, 
      _messageID: _messageID,
      _channelID: _channelID,
      from: from, 
      fromName: fromName, 
      to: to, 
      toName: toName, 
      content: content, 
      createdAt: createdAt
    });
  });


  socket.on("channel_typing", ({ _channelID, input, displayName }) => {
    socket.broadcast
      .to(_channelID)
      .timeout(500)
      .emit("client_channel_typing", {
        input: input,
        from: socket._uuid,
        displayName: displayName,
      });
  });

  // thread
    socket.on("channel_thread_typing", ({ _channelID, input, displayName }) => {
    socket.broadcast
      .to(_channelID)
      .timeout(500)
      .emit("client_channel_thread_typing", {
        input: input,
        from: socket._uuid,
        displayName: displayName,
      });
  });

  socket.on("delete_channel_message", (message) => {
    socket.broadcast
      .to(message.room).emit("client_delete_channel_message", message);
  });

    socket.on("edit_channel_message", ({channel}) => {
    socket.broadcast
      .to(channel._roomId).emit("client_edit_channel_message", {
      channel,
    });
  });

}); // connection

// io.of("/").adapter.on("create-room", (room) => {
//   console.log(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   console.log(`socket ${id} has joined room ${room}`);
// });
// listening port
httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
