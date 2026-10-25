const dns = require("dns");
const mongoose = require("mongoose");

// Configure public DNS resolvers to prevent ECONNREFUSED on MongoDB Atlas SRV lookups in environments with restrictive ISP DNS
try {
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
} catch (e) {
    // Ignore if custom DNS cannot be configured
}

const connectDB = async () => {
    const primaryUri = process.env.MONGO_URI;
    const fallbackUri = process.env.LOCAL_MONGO_URI || "mongodb://127.0.0.1:27017/legalconnect";

    if (!primaryUri && !fallbackUri) {
        throw new Error("No MongoDB connection URI provided in environment variables.");
    }

    if (primaryUri) {
        try {
            console.log("Connecting to primary MongoDB (Atlas)...");
            await mongoose.connect(primaryUri, {
                serverSelectionTimeoutMS: 5000,
            });

            console.log("MongoDB connected successfully to primary database (Atlas)");
            return;
        } catch (error) {
            console.error("Primary MongoDB Atlas connection failed:", error.message);
            if (error.message.includes("SSL alert number 80") || error.message.includes("whitelist")) {
                console.warn(
                    "\n[Atlas Network Notice] Your current IP address is likely not whitelisted on MongoDB Atlas." +
                    "\nPlease add your current IP address to the Network Access IP Access List in the MongoDB Atlas dashboard: https://cloud.mongodb.com\n"
                );
            }

            if (fallbackUri && fallbackUri !== primaryUri) {
                console.log(`Attempting fallback to local MongoDB instance (${fallbackUri})...`);
                try {
                    await mongoose.connect(fallbackUri, {
                        serverSelectionTimeoutMS: 4000,
                    });
                    console.log("MongoDB connected successfully to local fallback database");
                    return;
                } catch (fallbackError) {
                    console.error("Fallback MongoDB connection also failed:", fallbackError.message);
                }
            }

            throw error;
        }
    } else {
        await mongoose.connect(fallbackUri);
        console.log("MongoDB connected successfully to local database");
    }
};

module.exports = connectDB;