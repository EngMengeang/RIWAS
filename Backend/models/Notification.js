import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  sender_id: { type: DataTypes.UUID, allowNull: true, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
  recipient_id: { type: DataTypes.UUID, allowNull: false, references: { model: "Users", key: "id" }, onDelete: "CASCADE" },
  related_application_id: { type: DataTypes.UUID, references: { model: "JobApplications", key: "id" } },
  message_type: { type: DataTypes.STRING },
  content: { type: DataTypes.STRING }, 
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_sent: { type: DataTypes.BOOLEAN, defaultValue: false },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  read_at: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
