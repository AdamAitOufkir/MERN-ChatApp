import express from "express";
import {
  addContact,
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile); //protectRoute middleware (check for token before updating profile)
router.post("/add-contact/:id", protectRoute, addContact);

router.get("/check", protectRoute, checkAuth);

export default router;
