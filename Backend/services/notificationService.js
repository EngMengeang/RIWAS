import { Notification } from "../models/Notification.js";
import { sendApplicationStatusEmail } from "./emailService.js";
import { NOTIFICATION_TYPES } from "../config/constants.js";

// Create a notification and send email to user
export const createNotification = async ({
  senderId,
  recipient,
  type,
  content,
  application = null,
}) => {
  if (!recipient || !recipient.id) {
    console.error("Notification recipient is invalid!", recipient);
    return null;
  }

  try {
    // Save notification in DB
    const notification = await Notification.create({
      sender_id: senderId,
      recipient_id: recipient.id,
      related_application_id: application?.id || null,
      message_type: type,
      content,
      is_sent: true,
    });

    console.log(`Notification saved for user ${recipient.id}`);

    // Send email if this type requires it
    if (type === NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED && application) {
      try {
        // Safety checks to avoid errors
        if (!recipient.email) {
          console.warn("Skipping email: recipient has no email", recipient);
        } else if (!application.job?.title) {
          console.warn("Skipping email: application missing job info", application);
        } else {
          await sendApplicationStatusEmail(recipient, application, application.status);
          console.log(`Email sent to ${recipient.email}`);
        }
      } catch (emailError) {
        console.error("Failed to send application status email:", emailError);
      }
    }

    return notification;
  } catch (dbError) {
    console.error("Failed to create notification:", dbError);
    return null;
  }
};
