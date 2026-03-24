import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";
import { JobApplication } from "../models/JobApplication.js";
import { JobPosting } from "../models/JobPosting.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Get notifications for the current user
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, unreadOnly = false } = req.query;
  const offset = (page - 1) * limit;

  const where = { recipient_id: req.user.id };
  if (unreadOnly === 'true') {
    where.is_read = false;
  }

  const { count, rows } = await Notification.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    include: [
      {
        model: User,
        as: "sender",
        attributes: ["id", "firstName", "lastName", "email", "profilePicture"],
      },
      {
        model: JobApplication,
        as: "application",
        include: [{ model: JobPosting, as: "job" }],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  res.status(200).json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      unreadCount: await Notification.count({
        where: { recipient_id: req.user.id, is_read: false },
      }),
    },
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  // Verify the notification belongs to the current user
  if (notification.recipient_id !== req.user.id) {
    return res.status(403).json({ error: "Not authorized to access this notification" });
  }

  notification.is_read = true;
  notification.read_at = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { recipient_id: req.user.id, is_read: false } }
  );

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    updatedCount: result[0],
  });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

  if (!notification) {
    return res.status(404).json({ error: "Notification not found" });
  }

  // Verify the notification belongs to the current user
  if (notification.recipient_id !== req.user.id) {
    return res.status(403).json({ error: "Not authorized to delete this notification" });
  }

  await notification.destroy();

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// Get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.count({
    where: { recipient_id: req.user.id, is_read: false },
  });

  res.status(200).json({
    success: true,
    unreadCount: count,
  });
});
