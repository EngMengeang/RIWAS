import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Recruiter = sequelize.define("Recruiter", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  profile_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: "Profiles", key: "id" } , onDelete: "CASCADE" , onUpdate: "CASCADE"},
  department: { type: DataTypes.STRING },
  positionTitle: { type: DataTypes.STRING },
  workEmail: { type: DataTypes.STRING },
  phoneExtension: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});