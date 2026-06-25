const Message = require("../models/Message");

const socketSetup = (io) => {
  io.on("connection", (socket) => {
    // Join personal notification room
    socket.on("join", (userId) => {
      if (userId) socket.join(userId);
    });

    // Join a chat conversation room
    socket.on("joinRoom", (roomId) => {
      if (roomId) socket.join(roomId);
    });

    // Persist + broadcast a message
    socket.on("sendMessage", async (data) => {
      try {
        const { roomId, senderId, receiverId, content, type } = data;
        if (!roomId || !senderId || !receiverId || !content) return;

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          roomId,
          content,
          type: type || "text",
        });

        io.to(roomId).emit("newMessage", message);
        io.to(receiverId).emit("notification", {
          type: "message",
          from: senderId,
          preview: content.slice(0, 50),
        });
      } catch (err) {
        socket.emit("messageError", { message: err.message });
      }
    });

    // Typing indicator
    socket.on("typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("userTyping", userId);
    });

    socket.on("stopTyping", ({ roomId, userId }) => {
      socket.to(roomId).emit("userStoppedTyping", userId);
    });

    // Group chat room
    socket.on("joinGroup", (groupId) => {
      if (groupId) socket.join(`group_${groupId}`);
    });

    socket.on("disconnect", () => {
      // No-op; socket auto-leaves rooms
    });
  });
};

module.exports = socketSetup;
