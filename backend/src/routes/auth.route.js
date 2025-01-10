import express from "express";
import {
  addContact,
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/update-profile", protectRoute, updateProfile);
router.post("/add-contact/:id", protectRoute, addContact);
router.get("/check", protectRoute, checkAuth);

export default router;