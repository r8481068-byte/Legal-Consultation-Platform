const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Appointment = require("./models/Appointment");

const initializeSocket = (httpServer) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error("Authentication token required"));
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        userId: decoded.id || decoded._id || decoded.userId,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email
      };

      next();
    } catch (err) {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user?.userId}, Role: ${socket.user?.role})`);

    // ==========================================
    // CHAT SIGNALING & ROOM JOINING
    // ==========================================

    socket.on("join_chat_room", async ({ appointmentId }) => {
      try {
        if (!appointmentId) return;

        const appointment = await Appointment.findById(appointmentId).populate("lawyer");
        if (!appointment) {
          return socket.emit("error", { message: "Appointment not found" });
        }

        const isClient = appointment.client.toString() === socket.user.userId.toString();
        const lawyerUserId = appointment.lawyer?.user?.toString();
        const isLawyer = lawyerUserId === socket.user.userId.toString();

        if (!isClient && !isLawyer && socket.user.role !== "admin") {
          return socket.emit("error", { message: "Unauthorized to join this consultation chat" });
        }

        const room = `appointment-${appointmentId}`;
        socket.join(room);
        socket.emit("joined_chat_room", { room, appointmentId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("leave_chat_room", ({ appointmentId }) => {
      if (appointmentId) {
        socket.leave(`appointment-${appointmentId}`);
      }
    });

    socket.on("typing", ({ appointmentId }) => {
      if (appointmentId) {
        socket.to(`appointment-${appointmentId}`).emit("user_typing", {
          userId: socket.user.userId,
          name: socket.user.name
        });
      }
    });

    socket.on("stop_typing", ({ appointmentId }) => {
      if (appointmentId) {
        socket.to(`appointment-${appointmentId}`).emit("user_stop_typing", {
          userId: socket.user.userId
        });
      }
    });

    // ==========================================
    // WEBRTC VIDEO CONSULTATION SIGNALING
    // ==========================================

    socket.on("join_video_room", async ({ appointmentId }) => {
      try {
        if (!appointmentId) return;

        const appointment = await Appointment.findById(appointmentId).populate("lawyer");
        if (!appointment) {
          return socket.emit("video_error", { message: "Appointment not found" });
        }

        const isClient = appointment.client.toString() === socket.user.userId.toString();
        const lawyerUserId = appointment.lawyer?.user?.toString();
        const isLawyer = lawyerUserId === socket.user.userId.toString();

        if (!isClient && !isLawyer && socket.user.role !== "admin") {
          return socket.emit("video_error", { message: "Unauthorized to join this video consultation" });
        }

        if (appointment.status !== "confirmed" && appointment.status !== "completed") {
          return socket.emit("video_error", {
            message: `Video room is not active for status '${appointment.status}'`
          });
        }

        const videoRoom = `video-${appointmentId}`;
        socket.join(videoRoom);

        // Tell existing peers in the room that a new peer joined
        socket.to(videoRoom).emit("peer_connected", {
          socketId: socket.id,
          user: socket.user,
          role: isClient ? "client" : "lawyer"
        });

        // Send existing room members to this socket
        const roomSockets = Array.from(io.sockets.adapter.rooms.get(videoRoom) || []);
        const otherSockets = roomSockets.filter((id) => id !== socket.id);

        socket.emit("video_room_joined", {
          room: videoRoom,
          otherPeersCount: otherSockets.length,
          otherSockets
        });
      } catch (err) {
        socket.emit("video_error", { message: err.message });
      }
    });

    socket.on("webrtc_offer", ({ appointmentId, targetSocketId, sdp }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_offer", {
          senderSocketId: socket.id,
          sdp,
          user: socket.user
        });
      } else if (appointmentId) {
        socket.to(`video-${appointmentId}`).emit("webrtc_offer", {
          senderSocketId: socket.id,
          sdp,
          user: socket.user
        });
      }
    });

    socket.on("webrtc_answer", ({ appointmentId, targetSocketId, sdp }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_answer", {
          senderSocketId: socket.id,
          sdp
        });
      } else if (appointmentId) {
        socket.to(`video-${appointmentId}`).emit("webrtc_answer", {
          senderSocketId: socket.id,
          sdp
        });
      }
    });

    socket.on("webrtc_ice_candidate", ({ appointmentId, targetSocketId, candidate }) => {
      if (targetSocketId) {
        io.to(targetSocketId).emit("webrtc_ice_candidate", {
          senderSocketId: socket.id,
          candidate
        });
      } else if (appointmentId) {
        socket.to(`video-${appointmentId}`).emit("webrtc_ice_candidate", {
          senderSocketId: socket.id,
          candidate
        });
      }
    });

    socket.on("end_video_call", ({ appointmentId }) => {
      if (appointmentId) {
        io.to(`video-${appointmentId}`).emit("video_call_ended", {
          endedBy: socket.user
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
