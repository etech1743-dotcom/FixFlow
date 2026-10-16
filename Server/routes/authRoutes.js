const express = require("express");
const rateLimit = require("express-rate-limit");
const passport = require("../config/passport");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  register,
  registerWorker,
  login,
  me,
  logout,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  googleCallback,
} = require("../controllers/authController");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again later." },
});

router.post("/register", authLimiter, register);
router.post("/register-worker", authLimiter, registerWorker);
router.post("/login", authLimiter, login);
router.get("/me", authenticateToken, me);
router.post("/logout", authenticateToken, logout);
router.patch("/profile", authenticateToken, updateProfile);
router.post("/change-password", authenticateToken, changePassword);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token",authLimiter,resetPassword);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/`,
  }),
  googleCallback
);

module.exports = router;
