/**
 * LegalConnect Phase 6: Mongoose Test Lifecycle Verification Suite
 *
 * Validates:
 * 1. Initial connectTestDB() connects when readyState === 0 and increments refCount to 1.
 * 2. Subsequent connectTestDB() calls increment refCount and reuse existing connection without re-connecting.
 * 3. Premature disconnect prevention: first disconnectTestDB() decrements refCount to 1 and DOES NOT disconnect.
 * 4. Final disconnect: when refCount reaches 0, disconnectTestDB() properly closes the connection.
 * 5. Failure rollback: if mongoose.connect() fails, refCount is safely rolled back.
 * 6. Force disconnect: forceDisconnectTestDB() immediately clears refCount and disconnects.
 * 7. In-process multi-suite simulation: verifies two simulated test suites sharing a process do not disrupt each other.
 *
 * Run with:
 *   node --test backend/tests/mongooseLifecycle.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const {
  connectTestDB,
  disconnectTestDB,
  forceDisconnectTestDB,
  getConnectionRefCount,
  _resetRefCount,
  mongoUri,
} = require("./helpers/testDb");

describe("Phase 6: Mongoose Connection Lifecycle & Ownership", () => {
  let originalConnect;
  let originalDisconnect;
  let originalReadyStateDescriptor;

  let mockReadyState = 0;
  let connectCalls = 0;
  let disconnectCalls = 0;

  beforeEach(() => {
    _resetRefCount(0);
    mockReadyState = 0;
    connectCalls = 0;
    disconnectCalls = 0;

    originalConnect = mongoose.connect;
    originalDisconnect = mongoose.disconnect;
    originalReadyStateDescriptor = Object.getOwnPropertyDescriptor(
      mongoose.connection,
      "readyState"
    );

    Object.defineProperty(mongoose.connection, "readyState", {
      get: () => mockReadyState,
      configurable: true,
    });

    mongoose.connect = async () => {
      connectCalls++;
      mockReadyState = 1;
      return mongoose.connection;
    };

    mongoose.disconnect = async () => {
      disconnectCalls++;
      mockReadyState = 0;
    };
  });

  afterEach(() => {
    mongoose.connect = originalConnect;
    mongoose.disconnect = originalDisconnect;
    if (originalReadyStateDescriptor) {
      Object.defineProperty(
        mongoose.connection,
        "readyState",
        originalReadyStateDescriptor
      );
    }
    _resetRefCount(0);
  });

  // =========================================================================
  // 1. INITIAL CONNECTION
  // =========================================================================
  test("1. Initial connectTestDB() establishes connection and sets refCount to 1", async () => {
    assert.equal(getConnectionRefCount(), 0);
    assert.equal(mongoose.connection.readyState, 0);

    await connectTestDB();

    assert.equal(connectCalls, 1, "mongoose.connect must be called once");
    assert.equal(getConnectionRefCount(), 1, "refCount must be 1");
    assert.equal(mongoose.connection.readyState, 1, "readyState must be 1 (connected)");
  });

  // =========================================================================
  // 2. SHARED CONNECTION REUSE
  // =========================================================================
  test("2. Multiple connectTestDB() calls increment refCount and reuse existing connection", async () => {
    await connectTestDB();
    assert.equal(connectCalls, 1);
    assert.equal(getConnectionRefCount(), 1);

    // Second suite connects in same process
    await connectTestDB();
    assert.equal(connectCalls, 1, "mongoose.connect must NOT be called again when already connected");
    assert.equal(getConnectionRefCount(), 2, "refCount must increment to 2");

    // Third suite connects
    await connectTestDB();
    assert.equal(connectCalls, 1);
    assert.equal(getConnectionRefCount(), 3, "refCount must increment to 3");
  });

  // =========================================================================
  // 3. PREMATURE DISCONNECTION PREVENTION
  // =========================================================================
  test("3. Suite A calling disconnectTestDB() does NOT disconnect while Suite B is still active", async () => {
    // Both suites connect
    await connectTestDB(); // Suite A
    await connectTestDB(); // Suite B
    assert.equal(getConnectionRefCount(), 2);
    assert.equal(mongoose.connection.readyState, 1);

    // Suite A finishes and teardown runs
    await disconnectTestDB();

    assert.equal(getConnectionRefCount(), 1, "refCount must decrement to 1");
    assert.equal(disconnectCalls, 0, "mongoose.disconnect must NOT be called while refCount > 0");
    assert.equal(mongoose.connection.readyState, 1, "Connection must remain active for Suite B");
  });

  // =========================================================================
  // 4. FINAL CLEANUP
  // =========================================================================
  test("4. Final disconnect occurs only when last active suite completes teardown", async () => {
    await connectTestDB(); // Suite A
    await connectTestDB(); // Suite B

    // Suite A tears down
    await disconnectTestDB();
    assert.equal(disconnectCalls, 0);

    // Suite B tears down
    await disconnectTestDB();

    assert.equal(getConnectionRefCount(), 0, "refCount must drop to 0");
    assert.equal(disconnectCalls, 1, "mongoose.disconnect must be called once refCount reaches 0");
    assert.equal(mongoose.connection.readyState, 0, "readyState must be 0 (disconnected)");
  });

  // =========================================================================
  // 5. CONNECTION FAILURE ROLLBACK
  // =========================================================================
  test("5. If connection attempt fails, refCount is safely rolled back", async () => {
    mongoose.connect = async () => {
      throw new Error("MongoNetworkTimeoutError: connection timed out");
    };

    let caughtError = null;
    try {
      await connectTestDB();
    } catch (err) {
      caughtError = err;
    }

    assert.ok(caughtError, "Error must be propagated to caller");
    assert.equal(getConnectionRefCount(), 0, "refCount must be rolled back to 0 on failure");
    assert.equal(mongoose.connection.readyState, 0);
  });

  // =========================================================================
  // 6. FORCE DISCONNECT
  // =========================================================================
  test("6. forceDisconnectTestDB() immediately clears refCount and closes connection", async () => {
    await connectTestDB();
    await connectTestDB();
    await connectTestDB();
    assert.equal(getConnectionRefCount(), 3);
    assert.equal(mongoose.connection.readyState, 1);

    await forceDisconnectTestDB();

    assert.equal(getConnectionRefCount(), 0, "refCount must be reset to 0");
    assert.equal(disconnectCalls, 1, "mongoose.disconnect must be executed");
    assert.equal(mongoose.connection.readyState, 0, "Connection must be closed");
  });

  // =========================================================================
  // 7. IN-PROCESS MULTI-SUITE SIMULATION
  // =========================================================================
  test("7. End-to-end multi-suite lifecycle simulation: sequential and overlapping runs", async () => {
    // Phase 1: Overlapping execution
    // Suite 1 starts
    await connectTestDB();
    assert.equal(getConnectionRefCount(), 1);

    // Suite 2 starts before Suite 1 finishes
    await connectTestDB();
    assert.equal(getConnectionRefCount(), 2);

    // Suite 1 completes
    await disconnectTestDB();
    assert.equal(getConnectionRefCount(), 1);
    assert.equal(mongoose.connection.readyState, 1, "Suite 2 queries still succeed");

    // Suite 2 completes
    await disconnectTestDB();
    assert.equal(getConnectionRefCount(), 0);
    assert.equal(mongoose.connection.readyState, 0, "Connection closed cleanly after all suites");

    // Phase 2: Subsequent independent suite reconnects cleanly
    await connectTestDB();
    assert.equal(connectCalls, 2, "Second independent suite connects anew");
    assert.equal(getConnectionRefCount(), 1);
    assert.equal(mongoose.connection.readyState, 1);

    await disconnectTestDB();
    assert.equal(getConnectionRefCount(), 0);
    assert.equal(mongoose.connection.readyState, 0);
  });

  // =========================================================================
  // 8. CONCURRENT CONNECTION PROMISE SHARING
  // =========================================================================
  test("8. Two concurrent connectTestDB() calls share one in-flight connection promise without duplicates", async () => {
    let resolveConnection;
    mongoose.connect = () => {
      connectCalls++;
      return new Promise((resolve) => {
        resolveConnection = () => {
          mockReadyState = 1;
          resolve(mongoose.connection);
        };
      });
    };

    // Trigger two concurrent connection calls
    const promiseA = connectTestDB();
    const promiseB = connectTestDB();

    assert.equal(connectCalls, 1, "mongoose.connect must be called exactly once despite concurrent invocations");
    assert.equal(getConnectionRefCount(), 2, "refCount must be 2 for the two callers");

    // Resolve the in-flight connection
    resolveConnection();

    const [connA, connB] = await Promise.all([promiseA, promiseB]);

    assert.equal(connA, mongoose.connection);
    assert.equal(connB, mongoose.connection);
    assert.equal(connA.readyState, 1);
    assert.equal(connB.readyState, 1);
    assert.equal(connectCalls, 1, "Must remain exactly one connect call after resolution");
  });

  // =========================================================================
  // 9. READYSTATE === 2 AWAITING
  // =========================================================================
  test("9. A caller encountering readyState === 2 waits for pending connection instead of returning prematurely", async () => {
    mockReadyState = 2; // connecting state
    let openListener;

    mongoose.connection.once = (event, callback) => {
      if (event === "open") openListener = callback;
    };

    let resolved = false;
    const callPromise = connectTestDB().then((conn) => {
      resolved = true;
      return conn;
    });

    // Verify it did not return synchronously while readyState is 2
    await new Promise((r) => setImmediate(r));
    assert.equal(resolved, false, "Must not resolve prematurely while readyState is 2");

    // Simulate connection becoming ready
    mockReadyState = 1;
    if (openListener) openListener();

    const conn = await callPromise;
    assert.equal(resolved, true);
    assert.equal(conn.readyState, 1);
    assert.equal(getConnectionRefCount(), 1);
  });

  // =========================================================================
  // 10. RETRY AFTER FAILED CONNECTION
  // =========================================================================
  test("10. Subsequent call can cleanly retry after a failed connection attempt", async () => {
    let shouldFail = true;
    mongoose.connect = async () => {
      connectCalls++;
      if (shouldFail) {
        throw new Error("Simulated connection timeout");
      }
      mockReadyState = 1;
      return mongoose.connection;
    };

    // Attempt 1: Fails
    let error1 = null;
    try {
      await connectTestDB();
    } catch (err) {
      error1 = err;
    }
    assert.ok(error1);
    assert.equal(getConnectionRefCount(), 0, "refCount must be rolled back on failure");
    assert.equal(connectCalls, 1);

    // Attempt 2: Retry succeeds
    shouldFail = false;
    const conn = await connectTestDB();

    assert.equal(conn.readyState, 1);
    assert.equal(getConnectionRefCount(), 1);
    assert.equal(connectCalls, 2, "Must perform a new connect call on retry");
  });

  // =========================================================================
  // 11. CONCURRENT CONNECTION FAILURE ROLLBACK
  // =========================================================================
  test("11. Concurrent calls on failed connection: all callers catch error and refCount rolls back to 0", async () => {
    let rejectConnection;
    mongoose.connect = () => {
      connectCalls++;
      return new Promise((_, reject) => {
        rejectConnection = () => {
          reject(new Error("MongoServerSelectionError: connection refused"));
        };
      });
    };

    const pA = connectTestDB();
    const pB = connectTestDB();

    assert.equal(getConnectionRefCount(), 2);
    assert.equal(connectCalls, 1);

    rejectConnection();

    let errA = null;
    let errB = null;
    try { await pA; } catch (e) { errA = e; }
    try { await pB; } catch (e) { errB = e; }

    assert.ok(errA);
    assert.ok(errB);
    assert.equal(getConnectionRefCount(), 0, "refCount must roll back to 0 after both concurrent failures settle");
  });
});

