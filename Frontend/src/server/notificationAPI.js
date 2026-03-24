import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get my notifications
export const getMyNotifications = async ({ page = 1, limit = 50, unreadOnly = false } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: { page, limit, unreadOnly },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/notifications/mark-all-read`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

// Get unread count
export const getUnreadNotificationCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    throw error;
  }
};
