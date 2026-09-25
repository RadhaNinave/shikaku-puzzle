import { Server } from "socket.io";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinGame", (boardId) => {
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined game ${boardId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
