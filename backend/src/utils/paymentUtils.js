/**
 * Payment Lifecycle and Security Utilities
 *
 * Provides shared, deterministic payment selection and safe formatting
 * across appointment, lawyer, and client detail services.
 */

/**
 * Select authoritative payment based on chronological and lifecycle precedence rules.
 * Input payments array must be pre-sorted descending by { createdAt: -1, _id: -1 }.
 *
 * Lifecycle Precedence Rules:
 * - Old refunded payment + newer captured payment = Paid
 * - Old captured payment + newer refunded payment = Refunded
 * - Old captured payment + newer refund_pending payment = Refund Pending
 * - Old captured payment + newer failed payment = Paid
 * - Same timestamp = deterministic _id tie-break (handled by sorting)
 * - Failed or created attempts must not erase a previous successful payment
 *
 * @param {Array<Object>} appPayments - Array of lean Payment documents for a single appointment
 * @returns {Object|null} The authoritative Payment document or null
 */
const selectAuthoritativePayment = (appPayments) => {
  if (!appPayments || appPayments.length === 0) return null;
  if (appPayments.length === 1) return appPayments[0];

  const latestCaptured = appPayments.find((p) => p.status === "captured");
  const latestRefund = appPayments.find(
    (p) => p.status === "refunded" || p.status === "refund_pending"
  );

  if (latestCaptured && latestRefund) {
    const capturedIdx = appPayments.indexOf(latestCaptured);
    const refundIdx = appPayments.indexOf(latestRefund);
    // Lower index means newer in descending order ({ createdAt: -1, _id: -1 })
    return capturedIdx < refundIdx ? latestCaptured : latestRefund;
  }

  if (latestCaptured) {
    // Later failed or created payment attempts must not erase earlier successful captured payment
    return latestCaptured;
  }

  if (latestRefund) {
    return latestRefund;
  }

  // No successful payment history -> represent latest attempt accurately
  return appPayments[0];
};

/**
 * Strips gateway secrets and returns safe client-facing payment fields.
 *
 * @param {Object|null} payment - Lean Payment document
 * @returns {Object|null} Safe payment object
 */
const formatSafePayment = (payment) => {
  if (!payment) return null;
  return {
    _id: payment._id,
    amount: payment.amount,
    currency: payment.currency || "INR",
    status: payment.status,
    paidAt: payment.paidAt || null,
    refundId: payment.refundId || null,
    failureReason: payment.failureReason || null,
    createdAt: payment.createdAt,
  };
};

module.exports = {
  selectAuthoritativePayment,
  formatSafePayment,
};

