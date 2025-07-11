const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["client", "freelancer"])
      .withMessage("Role must be either 'client' or 'freelancer'"),
  ],
  validateRequest,
  register
);
router.post("/login", validateRequest, login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;