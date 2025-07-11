const { getSocketIO } = require("../utils/socket");


const emitToUser = (userId, event, payload) => {
  const io = getSocketIO();
  io.to(userId.toString()).emit(event, payload);
};

const emitToRoom = (room, event, data) => {
  const io = getSocketIO();
  io.to(room).emit(event, data);
};

module.exports = {
  emitToUser,
  emitToRoom,
};