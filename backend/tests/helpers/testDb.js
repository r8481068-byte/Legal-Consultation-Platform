/**
 * LegalConnect Phase 6: Centralized Test Database Lifecycle Manager
 *
 * Provides reference-counted, owner-safe Mongoose connection management
 * with shared in-flight connection promise safety for the automated test suite.
 *
 * Key guarantees:
 * 1. Multiple test suites in the same process share a single connection.
 * 2. Concurrent calls to connectTestDB() share a single in-flight connection promise.
 * 3. Callers encountering readyState === 2 wait until the connection settles.
 * 4. Connection is closed only when all active suites have completed teardown
 *    (refCount reaches 0).
 * 5. Rolls back refCount and resets connectionPromise if connection attempt fails.
 * 6. Supports clean retries after failed connection attempts.
 * 7. forceDisconnectTestDB() ensures safe teardown even if a connection is in-flight.
 */

const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoUri =
  process.env.TEST_MONGO_URI ||
  process.env.LOCAL_MONGO_URI ||
  (process.env.NODE_ENV === "production" ? null : process.env.MONGO_URI) ||
  "mongodb://127.0.0.1:27017/legalconnect";

let refCount = 0;
let connectionPromise = null;

/**
 * Connect to test database with reference tracking and shared promise safety.
 * If already connected (readyState === 1), returns immediately.
 * If connecting (in-flight promise or readyState === 2), awaits existing promise.
 */
async function connectTestDB(options = {}) {
  refCount++;

  if (!mongoUri && process.env.NODE_ENV === "production") {
    refCount = Math.max(0, refCount - 1);
    throw new Error(
      "Safety Guard: Automated test suite cannot connect to production database without explicit TEST_MONGO_URI."
    );
  }

  // 1. If already fully connected, reuse immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2. If no connection attempt is currently in-flight, initiate one
  if (!connectionPromise) {
    if (mongoose.connection.readyState === 2) {
      connectionPromise = new Promise((resolve, reject) => {
        mongoose.connection.once("open", () => resolve(mongoose.connection));
        mongoose.connection.once("error", reject);
      }).finally(() => {
        connectionPromise = null;
      });
    } else {
      connectionPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        ...options,
      }).finally(() => {
        connectionPromise = null;
      });
    }
  }

  // 3. Await shared connection promise and roll back refCount if failed
  try {
    await connectionPromise;
  } catch (err) {
    refCount = Math.max(0, refCount - 1);
    throw err;
  }

  return mongoose.connection;
}

/**
 * Disconnect from test database with reference tracking.
 * Closes the connection ONLY when refCount drops to 0.
 */
async function disconnectTestDB() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    if (connectionPromise) {
      try {
        await connectionPromise;
      } catch {
        // Ignore in-flight error during teardown
      }
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

/**
 * Force disconnect regardless of refCount (emergency teardown or process exit).
 */
async function forceDisconnectTestDB() {
  refCount = 0;
  if (connectionPromise) {
    try {
      await connectionPromise;
    } catch {
      // Ignore in-flight error during forced teardown
    }
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

/**
 * Returns current reference count (for lifecycle testing and diagnostics).
 */
function getConnectionRefCount() {
  return refCount;
}

/**
 * Reset internal reference count and connection promise (used in isolated unit tests).
 */
function _resetRefCount(val = 0) {
  refCount = val;
  connectionPromise = null;
}

module.exports = {
  connectTestDB,
  disconnectTestDB,
  forceDisconnectTestDB,
  getConnectionRefCount,
  _resetRefCount,
  mongoUri,
};
