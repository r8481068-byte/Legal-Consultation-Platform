// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const Appointment = require("./models/Appointment");
// const User = require("./models/User");

// const initializeSocket = (httpServer) => {
//   const getAllowedOrigins = () => {
//     const isProduction = process.env.NODE_ENV === "production";

//     const configured = [
//       process.env.FRONTEND_URL,
//       process.env.CLIENT_URL,
//     ]
//       .filter(Boolean)
//       .flatMap((val) => val.split(","))
//       .map((origin) => origin.trim().replace(/\/+$/, ""))
//       .filter(Boolean);

//     if (isProduction) {
//       return configured;
//     }

//     const devOrigins = [
//       "http://localhost:5173",
//       "http://127.0.0.1:5173",
//       "http://localhost:5174",
//       "http://127.0.0.1:5174",
//     ];

//     return Array.from(new Set([...configured, ...devOrigins]));
//   };

//   const io = new Server(httpServer, {
//     cors: {
//       origin: (origin, callback) => {
//         if (!origin) {
//           return callback(null, true);
//         }

//         const normalizedOrigin = origin.trim().replace(/\/+$/, "");
//         const currentAllowed = getAllowedOrigins();

//         if (currentAllowed.includes(normalizedOrigin)) {
//           return callback(null, true);
//         }

//         return callback(new Error("Not allowed by CORS"));
//       },
//       credentials: true,
//       methods: ["GET", "POST"]
//     }
//   });

//   // Socket Authentication Middleware
//   io.use(async (socket, next) => {
//     try {
//       const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
//       if (!authHeader) {
//         return next(new Error("Authentication token required"));
//       }

//       const token = authHeader.startsWith("Bearer ")
//         ? authHeader.split(" ")[1]
//         : authHeader;

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const userId = decoded.id || decoded._id || decoded.userId;

//       if (!userId) {
//         return next(new Error("Token does not contain a user ID"));
//       }

//       const userDoc = await User.findById(userId).select("isActive role name email");
//       if (!userDoc) {
//         return next(new Error("User account no longer exists"));
//       }

//       if (userDoc.isActive === false) {
//         return next(new Error("Account has been deactivated or suspended"));
//       }

//       socket.user = {
//         userId: userDoc._id.toString(),
//         role: userDoc.role,
//         name: userDoc.name || "User",
//         email: userDoc.email || ""
//       };

//       next();
//     } catch (err) {
//       return next(new Error("Invalid or expired authentication token"));
//     }
//   });

//   const getAuthorizedAppointment = async (appointmentId, userId, userRole) => {
//     if (!appointmentId) return null;

//     const appointment = await Appointment.findById(appointmentId).populate("lawyer");
//     if (!appointment) return null;

//     const isClient = appointment.client?.toString() === userId.toString();
//     const lawyerUserId = appointment.lawyer?.user?.toString();
//     const isLawyer = lawyerUserId === userId.toString();
//     const isAdmin = userRole === "admin";

//     if (!isClient && !isLawyer && !isAdmin) {
//       return null;
//     }

//     let determinedRole = "client";
//     if (isAdmin) {
//       determinedRole = "admin";
//     } else if (isLawyer) {
//       determinedRole = "lawyer";
//     }

//     return {
//       appointment,
//       isClient,
//       isLawyer,
//       isAdmin,
//       role: determinedRole
//     };
//   };

//   io.on("connection", (socket) => {
//     console.log(`Socket connected: ${socket.id} (User: ${socket.user?.userId}, Role: ${socket.user?.role})`);

//     socket.data = socket.data || {};
//     socket.data.authorizedVideoRooms = socket.data.authorizedVideoRooms || new Set();
//     socket.data.authorizedChatRooms = socket.data.authorizedChatRooms || new Set();

//     const canSignalVideo = (appointmentId, targetSocketId) => {
//       if (!appointmentId) return false;
//       const videoRoom = `video-${appointmentId}`;

//       if (!socket.rooms.has(videoRoom) || !socket.data?.authorizedVideoRooms?.has(appointmentId.toString())) {
//         return false;
//       }

//       if (targetSocketId) {
//         const targetSocket = io.sockets.sockets.get(targetSocketId);
//         if (
//           !targetSocket ||
//           !targetSocket.rooms.has(videoRoom) ||
//           !targetSocket.data?.authorizedVideoRooms?.has(appointmentId.toString())
//         ) {
//           return false;
//         }
//       }

//       return true;
//     };

//     // ==========================================
//     // CHAT SIGNALING & ROOM JOINING
//     // ==========================================

//     socket.on("join_chat_room", async ({ appointmentId }) => {
//       try {
//         if (!appointmentId) return;

//         const auth = await getAuthorizedAppointment(appointmentId, socket.user.userId, socket.user.role);
//         if (!auth) {
//           return socket.emit("error", { message: "Unauthorized to join this consultation chat" });
//         }

//         const room = `appointment-${appointmentId}`;
//         socket.join(room);
//         socket.data.authorizedChatRooms.add(appointmentId.toString());
//         socket.emit("joined_chat_room", { room, appointmentId });
//       } catch (err) {
//         socket.emit("error", { message: err.message });
//       }
//     });

//     socket.on("leave_chat_room", ({ appointmentId }) => {
//       if (appointmentId) {
//         const room = `appointment-${appointmentId}`;
//         socket.leave(room);
//         if (socket.data?.authorizedChatRooms) {
//           socket.data.authorizedChatRooms.delete(appointmentId.toString());
//         }
//       }
//     });

//     socket.on("typing", ({ appointmentId }) => {
//       if (!appointmentId) return;
//       const chatRoom = `appointment-${appointmentId}`;
//       if (!socket.rooms.has(chatRoom) || !socket.data?.authorizedChatRooms?.has(appointmentId.toString())) {
//         return;
//       }

//       socket.to(chatRoom).emit("user_typing", {
//         userId: socket.user.userId,
//         name: socket.user.name
//       });
//     });

//     socket.on("stop_typing", ({ appointmentId }) => {
//       if (!appointmentId) return;
//       const chatRoom = `appointment-${appointmentId}`;
//       if (!socket.rooms.has(chatRoom) || !socket.data?.authorizedChatRooms?.has(appointmentId.toString())) {
//         return;
//       }

//       socket.to(chatRoom).emit("user_stop_typing", {
//         userId: socket.user.userId
//       });
//     });

//     // ==========================================
//     // WEBRTC VIDEO CONSULTATION SIGNALING
//     // ==========================================

//     socket.on("join_video_room", async ({ appointmentId }) => {
//       try {
//         if (!appointmentId) return;

//         const auth = await getAuthorizedAppointment(appointmentId, socket.user.userId, socket.user.role);
//         if (!auth) {
//           return socket.emit("video_error", { message: "Unauthorized to join this video consultation" });
//         }

//         const { appointment, role } = auth;

//         if (appointment.status !== "confirmed" && appointment.status !== "completed") {
//           return socket.emit("video_error", {
//             message: `Video room is not active for status '${appointment.status}'`
//           });
//         }

//         const videoRoom = `video-${appointmentId}`;
//         socket.join(videoRoom);
//         socket.data.authorizedVideoRooms.add(appointmentId.toString());

//         // Tell existing peers in the room that a new peer joined
//         socket.to(videoRoom).emit("peer_connected", {
//           socketId: socket.id,
//           user: socket.user,
//           role // Explicit: "client", "lawyer", or "admin"
//         });

//         // Send existing room members to this socket
//         const roomSockets = Array.from(io.sockets.adapter.rooms.get(videoRoom) || []);
//         const otherSockets = roomSockets.filter((id) => id !== socket.id);

//         socket.emit("video_room_joined", {
//           room: videoRoom,
//           otherPeersCount: otherSockets.length,
//           otherSockets
//         });
//       } catch (err) {
//         socket.emit("video_error", { message: err.message });
//       }
//     });

//     socket.on("webrtc_offer", ({ appointmentId, targetSocketId, sdp }) => {
//       if (!canSignalVideo(appointmentId, targetSocketId)) {
//         return;
//       }

//       const videoRoom = `video-${appointmentId}`;
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("webrtc_offer", {
//           senderSocketId: socket.id,
//           sdp,
//           user: socket.user
//         });
//       } else {
//         socket.to(videoRoom).emit("webrtc_offer", {
//           senderSocketId: socket.id,
//           sdp,
//           user: socket.user
//         });
//       }
//     });

//     socket.on("webrtc_answer", ({ appointmentId, targetSocketId, sdp }) => {
//       if (!canSignalVideo(appointmentId, targetSocketId)) {
//         return;
//       }

//       const videoRoom = `video-${appointmentId}`;
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("webrtc_answer", {
//           senderSocketId: socket.id,
//           sdp
//         });
//       } else {
//         socket.to(videoRoom).emit("webrtc_answer", {
//           senderSocketId: socket.id,
//           sdp
//         });
//       }
//     });

//     socket.on("webrtc_ice_candidate", ({ appointmentId, targetSocketId, candidate }) => {
//       if (!canSignalVideo(appointmentId, targetSocketId)) {
//         return;
//       }

//       const videoRoom = `video-${appointmentId}`;
//       if (targetSocketId) {
//         io.to(targetSocketId).emit("webrtc_ice_candidate", {
//           senderSocketId: socket.id,
//           candidate
//         });
//       } else {
//         socket.to(videoRoom).emit("webrtc_ice_candidate", {
//           senderSocketId: socket.id,
//           candidate
//         });
//       }
//     });

//     socket.on("leave_video_room", ({ appointmentId }) => {
//       if (appointmentId) {
//         const videoRoom = `video-${appointmentId}`;
//         socket.leave(videoRoom);
//         if (socket.data?.authorizedVideoRooms) {
//           socket.data.authorizedVideoRooms.delete(appointmentId.toString());
//         }
//         socket.to(videoRoom).emit("peer_disconnected", {
//           socketId: socket.id,
//           user: socket.user
//         });
//       }
//     });

//     socket.on("end_video_call", ({ appointmentId }) => {
//       if (!canSignalVideo(appointmentId)) {
//         return;
//       }

//       const videoRoom = `video-${appointmentId}`;
//       io.to(videoRoom).emit("video_call_ended", {
//         endedBy: socket.user
//       });
//     });

//     socket.on("disconnecting", () => {
//       for (const room of socket.rooms) {
//         if (typeof room === "string" && room.startsWith("video-")) {
//           socket.to(room).emit("peer_disconnected", {
//             socketId: socket.id,
//             user: socket.user
//           });
//         }
//       }
//       if (socket.data?.authorizedVideoRooms) {
//         socket.data.authorizedVideoRooms.clear();
//       }
//       if (socket.data?.authorizedChatRooms) {
//         socket.data.authorizedChatRooms.clear();
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log(`Socket disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// };

// module.exports = initializeSocket;





const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Appointment = require("./models/Appointment");
const User = require("./models/User");

const initializeSocket = (httpServer) => {
  const getAllowedOrigins = () => {
    const isProduction = process.env.NODE_ENV === "production";

    const configured = [
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL,
    ]
      .filter(Boolean)
      .flatMap((val) => val.split(","))
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean);

    if (isProduction) {
      return configured;
    }

    const devOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ];

    return Array.from(new Set([...configured, ...devOrigins]));
  };

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = origin.trim().replace(/\/+$/, "");
        const currentAllowed = getAllowedOrigins();

        if (currentAllowed.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const authHeader =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization;

      if (!authHeader) {
        return next(new Error("Authentication token required"));
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id || decoded._id || decoded.userId;

      if (!userId) {
        return next(new Error("Token does not contain a user ID"));
      }

      const userDoc = await User.findById(userId).select(
        "isActive role name email"
      );

      if (!userDoc) {
        return next(new Error("User account no longer exists"));
      }

      if (userDoc.isActive === false) {
        return next(
          new Error("Account has been deactivated or suspended")
        );
      }

      socket.user = {
        userId: userDoc._id.toString(),
        role: userDoc.role,
        name: userDoc.name || "User",
        email: userDoc.email || "",
      };

      next();
    } catch (err) {
      return next(new Error("Invalid or expired authentication token"));
    }
  });

  const getAuthorizedAppointment = async (
    appointmentId,
    userId,
    userRole
  ) => {
    if (!appointmentId) return null;

    const appointment = await Appointment.findById(
      appointmentId
    ).populate("lawyer");

    if (!appointment) return null;

    const isClient =
      appointment.client?.toString() === userId.toString();

    const lawyerUserId = appointment.lawyer?.user?.toString();
    const isLawyer = lawyerUserId === userId.toString();
    const isAdmin = userRole === "admin";

    if (!isClient && !isLawyer && !isAdmin) {
      return null;
    }

    let determinedRole = "client";

    if (isAdmin) {
      determinedRole = "admin";
    } else if (isLawyer) {
      determinedRole = "lawyer";
    }

    return {
      appointment,
      isClient,
      isLawyer,
      isAdmin,
      role: determinedRole,
    };
  };

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id} (User: ${socket.user?.userId}, Role: ${socket.user?.role})`
    );

    socket.data = socket.data || {};
    socket.data.authorizedVideoRooms =
      socket.data.authorizedVideoRooms || new Set();
    socket.data.authorizedChatRooms =
      socket.data.authorizedChatRooms || new Set();

    const canSignalVideo = (appointmentId, targetSocketId) => {
      if (!appointmentId) return false;

      const appointmentKey = appointmentId.toString();
      const videoRoom = `video-${appointmentKey}`;

      if (
        !socket.rooms.has(videoRoom) ||
        !socket.data?.authorizedVideoRooms?.has(appointmentKey)
      ) {
        return false;
      }

      if (targetSocketId) {
        const targetSocket = io.sockets.sockets.get(targetSocketId);

        if (
          !targetSocket ||
          !targetSocket.rooms.has(videoRoom) ||
          !targetSocket.data?.authorizedVideoRooms?.has(appointmentKey)
        ) {
          return false;
        }
      }

      return true;
    };

    // ==========================================
    // CHAT SIGNALING & ROOM JOINING
    // ==========================================

    socket.on("join_chat_room", async ({ appointmentId } = {}) => {
      try {
        if (!appointmentId) return;

        const auth = await getAuthorizedAppointment(
          appointmentId,
          socket.user.userId,
          socket.user.role
        );

        if (!auth) {
          return socket.emit("error", {
            message: "Unauthorized to join this consultation chat",
          });
        }

        const room = `appointment-${appointmentId}`;

        socket.join(room);
        socket.data.authorizedChatRooms.add(
          appointmentId.toString()
        );

        socket.emit("joined_chat_room", {
          room,
          appointmentId,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("leave_chat_room", ({ appointmentId } = {}) => {
      if (appointmentId) {
        const appointmentKey = appointmentId.toString();
        const room = `appointment-${appointmentKey}`;

        socket.leave(room);
        socket.data.authorizedChatRooms.delete(appointmentKey);
      }
    });

    socket.on("typing", ({ appointmentId } = {}) => {
      if (!appointmentId) return;

      const appointmentKey = appointmentId.toString();
      const chatRoom = `appointment-${appointmentKey}`;

      if (
        !socket.rooms.has(chatRoom) ||
        !socket.data.authorizedChatRooms.has(appointmentKey)
      ) {
        return;
      }

      socket.to(chatRoom).emit("user_typing", {
        userId: socket.user.userId,
        name: socket.user.name,
      });
    });

    socket.on("stop_typing", ({ appointmentId } = {}) => {
      if (!appointmentId) return;

      const appointmentKey = appointmentId.toString();
      const chatRoom = `appointment-${appointmentKey}`;

      if (
        !socket.rooms.has(chatRoom) ||
        !socket.data.authorizedChatRooms.has(appointmentKey)
      ) {
        return;
      }

      socket.to(chatRoom).emit("user_stop_typing", {
        userId: socket.user.userId,
      });
    });

    // ==========================================
    // WEBRTC VIDEO CONSULTATION SIGNALING
    // ==========================================

    socket.on("join_video_room", async ({ appointmentId } = {}) => {
      try {
        if (!appointmentId) return;

        const auth = await getAuthorizedAppointment(
          appointmentId,
          socket.user.userId,
          socket.user.role
        );

        if (!auth) {
          return socket.emit("video_error", {
            message: "Unauthorized to join this video consultation",
          });
        }

        const { appointment, role } = auth;

        if (
          appointment.status !== "confirmed" &&
          appointment.status !== "completed"
        ) {
          return socket.emit("video_error", {
            message: `Video room is not active for status '${appointment.status}'`,
          });
        }

        const appointmentKey = appointmentId.toString();
        const videoRoom = `video-${appointmentKey}`;

        const alreadyJoined = socket.rooms.has(videoRoom);

        socket.join(videoRoom);
        socket.data.authorizedVideoRooms.add(appointmentKey);

        // Notify existing peers only when a new socket joins
        if (!alreadyJoined) {
          socket.to(videoRoom).emit("peer_connected", {
            socketId: socket.id,
            user: socket.user,
            role,
          });
        }

        const roomSockets = Array.from(
          io.sockets.adapter.rooms.get(videoRoom) || []
        );

        const otherSockets = roomSockets.filter(
          (id) => id !== socket.id
        );

        socket.emit("video_room_joined", {
          room: videoRoom,
          otherPeersCount: otherSockets.length,
          otherSockets,
        });
      } catch (err) {
        socket.emit("video_error", { message: err.message });
      }
    });

    socket.on(
      "webrtc_offer",
      ({ appointmentId, targetSocketId, sdp } = {}) => {
        if (!sdp || !canSignalVideo(appointmentId, targetSocketId)) {
          return;
        }

        const videoRoom = `video-${appointmentId}`;

        const payload = {
          senderSocketId: socket.id,
          sdp,
          user: socket.user,
        };

        if (targetSocketId) {
          io.to(targetSocketId).emit("webrtc_offer", payload);
        } else {
          socket.to(videoRoom).emit("webrtc_offer", payload);
        }
      }
    );

    socket.on(
      "webrtc_answer",
      ({ appointmentId, targetSocketId, sdp } = {}) => {
        if (!sdp || !canSignalVideo(appointmentId, targetSocketId)) {
          return;
        }

        const videoRoom = `video-${appointmentId}`;

        const payload = {
          senderSocketId: socket.id,
          sdp,
        };

        if (targetSocketId) {
          io.to(targetSocketId).emit("webrtc_answer", payload);
        } else {
          socket.to(videoRoom).emit("webrtc_answer", payload);
        }
      }
    );

    socket.on(
      "webrtc_ice_candidate",
      ({ appointmentId, targetSocketId, candidate } = {}) => {
        if (
          !candidate ||
          !canSignalVideo(appointmentId, targetSocketId)
        ) {
          return;
        }

        const videoRoom = `video-${appointmentId}`;

        const payload = {
          senderSocketId: socket.id,
          candidate,
        };

        if (targetSocketId) {
          io.to(targetSocketId).emit(
            "webrtc_ice_candidate",
            payload
          );
        } else {
          socket.to(videoRoom).emit(
            "webrtc_ice_candidate",
            payload
          );
        }
      }
    );

    // Securely leave video room
    socket.on("leave_video_room", ({ appointmentId } = {}) => {
      if (!appointmentId) return;

      const appointmentKey = appointmentId.toString();
      const videoRoom = `video-${appointmentKey}`;

      // Verify actual room membership and authorization
      if (
        !socket.rooms.has(videoRoom) ||
        !socket.data.authorizedVideoRooms.has(appointmentKey)
      ) {
        return;
      }

      socket.leave(videoRoom);
      socket.data.authorizedVideoRooms.delete(appointmentKey);

      socket.to(videoRoom).emit("peer_disconnected", {
        socketId: socket.id,
        user: socket.user,
      });
    });

    socket.on("end_video_call", ({ appointmentId } = {}) => {
      if (!canSignalVideo(appointmentId)) {
        return;
      }

      const videoRoom = `video-${appointmentId}`;

      io.to(videoRoom).emit("video_call_ended", {
        endedBy: socket.user,
      });
    });

    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (
          typeof room === "string" &&
          room.startsWith("video-")
        ) {
          socket.to(room).emit("peer_disconnected", {
            socketId: socket.id,
            user: socket.user,
          });
        }
      }

      socket.data.authorizedVideoRooms.clear();
      socket.data.authorizedChatRooms.clear();
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = initializeSocket;
