const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const { protect, authorize } = require("./middleware/authMiddleware");
const errorHandler = require("./middleware/errorMiddleware");
const lawyerRoutes = require("./routes/lawyerRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const availabilityRoutes = require("./routes/availabilityRoutes");

const paymentRoutes = require("./routes/paymentRoutes");


const app = express();

// =========================
// Security Middleware
// =========================

app.use(helmet());


const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
].filter(Boolean);


app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, or Postman)
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

app.use(
    express.json({
        limit: "10mb",
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        }
    })
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =========================
// Health Check (Always reachable)
// =========================

const healthHandler = (req, res) => {
    const mongoose = require("mongoose");
    const isDbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({
        success: true,
        message: "Legal Consultation API is running",
        database: isDbConnected ? "connected" : "disconnected"
    });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// =========================
// Rate Limiting
// =========================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "production" ? 100 : 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
});

app.use("/api", apiLimiter);

// Database connection readiness check for API routes
app.use("/api", (req, res, next) => {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: "Database connection is currently unavailable. Please verify MongoDB status or Atlas IP whitelist."
        });
    }
    next();
});

// =========================
// Routes
// =========================

const reviewRoutes = require("./routes/reviewRoutes");
const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/lawyers", lawyerRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);


// =========================
// Temporary Auth Test Routes
// =========================

app.get("/api/test/protected", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Protected route accessed",
        user: req.user
    });
});

app.get(
    "/api/test/admin",
    protect,
    authorize("admin"),
    (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin route accessed",
            user: req.user
        });
    }
);

// =========================
// Global Error Handler
// MUST BE LAST
// =========================

app.use(errorHandler);

module.exports = app;