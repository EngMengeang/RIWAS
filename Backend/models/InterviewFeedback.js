import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { InterviewSchedule } from "./InterviewSchedule.js";
import { Recruiter } from "./Recruiter.js";

export const InterviewFeedback = sequelize.define("InterviewFeedback", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  interview_id: { type: DataTypes.UUID, allowNull: false, references: { model: InterviewSchedule, key: "id" }, onDelete: "CASCADE" },
  given_by: { type: DataTypes.UUID, allowNull: false, references: { model: Recruiter, key: "id" }, onDelete: "CASCADE" },
  comments: { type: DataTypes.TEXT },
  rating: { type: DataTypes.INTEGER },
  recommendation: { type: DataTypes.TEXT },
  shared_with_candidate: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
