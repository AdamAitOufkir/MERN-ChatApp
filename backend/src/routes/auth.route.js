import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  blockUser,
  unblockUser,
  getUserById,
  getBlockedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getIncomingFriendRequests,
  getOutgoingFriendRequests
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
router.post("/block/:id", protectRoute, blockUser);
router.post("/unblock/:id", protectRoute, unblockUser);
router.get("/check", protectRoute, checkAuth);
router.get('/user/:id', getUserById);
router.get("/blocked-users", protectRoute, getBlockedUsers);
router.post("/friend-request/:id", protectRoute, sendFriendRequest);
router.post("/friend-request/:id/accept", protectRoute, acceptFriendRequest);
router.post("/friend-request/:id/reject", protectRoute, rejectFriendRequest);
router.get("/friend-requests/incoming", protectRoute, getIncomingFriendRequests);
router.get("/friend-requests/outgoing", protectRoute, getOutgoingFriendRequests);

export default router;