import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { WORKFLOW_STEP } from "../config/constants.js";
export const ApplicationWorkflow = sequelize.define("ApplicationWorkflow", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  application_id: { type: DataTypes.UUID, allowNull: false, references: { model: "JobApplications", key: "id" }, onDelete: "CASCADE" },
  step: { type: DataTypes.ENUM(...Object.values(WORKFLOW_STEP)), allowNull: false },
  performed_by: { type: DataTypes.UUID, references: { model: "Recruiters", key: "id" } },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
