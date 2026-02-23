import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";


export const Candidate = sequelize.define("Candidate", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: "Users", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
  profile_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: "Profiles", key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
  resumeUrl: { type: DataTypes.STRING, allowNull: true },
  education: { type: DataTypes.JSONB, allowNull: true },
  experience: { type: DataTypes.JSONB, allowNull: true },
  summary: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

