let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const rooms = socket.handshake.query.rooms?.split(",") || [];

    if (userId) socket.join(userId);
    rooms.forEach((r) => socket.join(r));

    socket.on("typing", ({ to }) => {
      socket.to(to).emit("typing", { from: userId });
    });

    socket.on("stop_typing", ({ to }) => {
      socket.to(to).emit("stop_typing", { from: userId });
    });

    socket.on("disconnect", () => {
      console.log(` ${userId} disconnected`);
    });
  });
};

const getSocketIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};

module.exports = { initSocket, getSocketIO };