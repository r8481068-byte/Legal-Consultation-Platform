const { body } = require("express-validator");
const {
  isValidIndianMobile,
  isValidPinCode,
  isValidAadhaar,
  isValidPAN,
} = require("../utils/cryptoUtils");

const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required")
    .custom((val) => {
      if (!isValidIndianMobile(val)) {
        throw new Error("Please enter a valid 10-digit Indian mobile number");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Confirm password must match password");
      }
      return true;
    }),

  body("role")
    .optional()
    .isIn(["client", "lawyer"])
    .withMessage("Invalid account role. Administrator self-registration is strictly prohibited"),
];

const loginValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

const verifyOtpValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be exactly 6 digits")
    .isNumeric()
    .withMessage("Verification code must only contain digits"),
];

const emailOnlyValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
];

const clientProfileValidator = [
  body("state")
    .trim()
    .notEmpty()
    .withMessage("State is required")
    .isLength({ max: 100 })
    .withMessage("State name is too long"),

  body("district")
    .trim()
    .notEmpty()
    .withMessage("District is required")
    .isLength({ max: 100 })
    .withMessage("District name is too long"),

  body("subDistrict")
    .trim()
    .notEmpty()
    .withMessage("Block / Sub-district is required")
    .isLength({ max: 100 })
    .withMessage("Block / Sub-district name is too long"),

  body("locality")
    .trim()
    .notEmpty()
    .withMessage("Area / Locality is required")
    .isLength({ max: 150 })
    .withMessage("Area / Locality is too long"),

  body("cityVillage")
    .trim()
    .notEmpty()
    .withMessage("City or Village is required")
    .isLength({ max: 100 })
    .withMessage("City or Village name is too long"),

  body("pincode")
    .trim()
    .notEmpty()
    .withMessage("PIN code is required")
    .custom((val) => {
      if (!isValidPinCode(val)) {
        throw new Error("Please enter a valid 6-digit Indian PIN code");
      }
      return true;
    }),

  body("addressLine")
    .trim()
    .notEmpty()
    .withMessage("Address line is required")
    .isLength({ min: 5, max: 250 })
    .withMessage("Address line must be between 5 and 250 characters"),
];

const identityValidator = [
  body("aadhaar")
    .trim()
    .notEmpty()
    .withMessage("Aadhaar number is required")
    .custom((val) => {
      if (!isValidAadhaar(val)) {
        throw new Error("Invalid Aadhaar number format. Must be 12 digits starting with 2-9");
      }
      return true;
    }),

  body("pan")
    .trim()
    .notEmpty()
    .withMessage("PAN number is required")
    .custom((val) => {
      if (!isValidPAN(val)) {
        throw new Error("Invalid PAN format. Must be 10 characters (e.g. ABCDE1234F)");
      }
      return true;
    }),
];

module.exports = {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  emailOnlyValidator,
  clientProfileValidator,
  identityValidator,
};