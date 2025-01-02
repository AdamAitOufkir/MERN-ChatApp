import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getContacts,
  sendMessage,
  getUsers,
  deleteMessage
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/contacts", protectRoute, getContacts);
router.get("/users", protectRoute, getUsers);
router.get("/:id", protectRoute, getMessages);
router.delete("/:id", protectRoute, deleteMessage);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
