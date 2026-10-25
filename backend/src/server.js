// const dotenv = require("dotenv");
// dotenv.config();

// const app = require("./app");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5000;

// connectDB();

// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });



const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error("Warning: Initial database connection could not be established:", error.message);
        console.warn("Starting HTTP server so API health and diagnostics remain available to clients.");
    }

    const server = http.createServer(app);
    const io = initializeSocket(server);
    app.set("io", io);

    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Socket.IO server mounted and ready for real-time signaling`);
    });
};

startServer();
