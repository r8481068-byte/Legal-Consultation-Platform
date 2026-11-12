/**
 * Utility functions for database search, filtering, and regex sanitization.
 */

/**
 * Escapes all regular expression metacharacters in a user-provided string
 * so that it can be safely used as a literal match in MongoDB $regex queries
 * or JavaScript RegExp constructors without regex injection, syntax errors, or ReDoS.
 *
 * Metacharacters escaped: . * + ? ^ $ { } ( ) | [ ] \
 *
 * @param {string} str - Raw search/filter input from user
 * @returns {string} Escaped string safe for literal regex matching
 */
const escapeRegex = (str) => {
  if (typeof str !== "string") {
    if (str === null || str === undefined) return "";
    str = String(str);
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

module.exports = {
  escapeRegex
};

