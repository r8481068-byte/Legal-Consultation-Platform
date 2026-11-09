
const Razorpay = require("razorpay");

let instance = null;
let cachedKeyId = null;
let cachedKeySecret = null;

/**
 * Lazily initializes and returns the Razorpay SDK instance.
 * Throws a controlled 503 error if credentials are not configured when payment operations are called,
 * allowing the application to start safely in all environments.
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay API credentials are not configured on the server");
    error.statusCode = 503;
    error.code = "PAYMENT_GATEWAY_UNAVAILABLE";
    throw error;
  }

  if (!instance || cachedKeyId !== keyId || cachedKeySecret !== keySecret) {
    instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    cachedKeyId = keyId;
    cachedKeySecret = keySecret;
  }

  return instance;
};

// Safe proxy to allow server startup without credentials while preserving caller syntax
const razorpay = new Proxy(
  {},
  {
    get(target, prop) {
      const client = getRazorpayInstance();
      const value = client[prop];
      if (typeof value === "function") {
        return value.bind(client);
      }
      return value;
    },
  }
);

module.exports = razorpay;
