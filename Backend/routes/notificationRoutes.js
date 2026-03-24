import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my notifications
router.get("/", getMyNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.put("/:id/read", markAsRead);

// Mark all as read
router.put("/mark-all-read", markAllAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

export default router;
