const express = require("express");
const {
  register,
  login,
  verifyEmail,
  resendEmailVerificationLink,
  sendPasswordResetLink,
  verifyResetPasswordLink,
  resetPassword,
  googleAuth,
} = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", register);
router.get("/verify_email", verifyEmail);
router.get(
  "/resend_email_verification_link/:userId",
  resendEmailVerificationLink
);
router.post("/login", login);
router.post("/google_auth", googleAuth);
router.post("/send_password_rest_link", sendPasswordResetLink);
router.get("/verify_password_rest_link", verifyResetPasswordLink);
router.post("/reset_password/:userId", resetPassword);

module.exports = router;
