import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./User.js";

export const UserResume = sequelize.define("UserResume", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: User, key: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  resume: { type: DataTypes.STRING, allowNull: false }, 
  resumePublicId: { type: DataTypes.STRING }, 
  extracted_text: { type: DataTypes.TEXT }, 
  ai_analysis: { type: DataTypes.JSONB },
  uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
