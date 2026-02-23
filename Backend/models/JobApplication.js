import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { JobPosting } from "./JobPosting.js";
import { APPLICATION_STATUS } from "../config/constants.js";

export const JobApplication = sequelize.define(
  "JobApplication",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    job_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: JobPosting, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    resume: { type: DataTypes.STRING, allowNull: false }, 
    resumePublicId: { type: DataTypes.STRING },
    cover_letter: { type: DataTypes.STRING }, 
    coverLetterPublicId: { type: DataTypes.STRING },
    extracted_text: { type: DataTypes.TEXT },
    cover_letter_text: { type: DataTypes.TEXT },
    ai_analysis: { type: DataTypes.JSONB },
    cover_letter_score: { type: DataTypes.FLOAT },
    missing_skills: { type: DataTypes.JSONB },
    status: {
      type: DataTypes.ENUM(...Object.values(APPLICATION_STATUS)),
      defaultValue: APPLICATION_STATUS.APPLIED,
    },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    rejected_at: { type: DataTypes.DATE },
    rejection_reason: { type: DataTypes.TEXT },
    interview_id: { type: DataTypes.UUID, references: { model: "InterviewSchedules", key: "id" } },
    score: { type: DataTypes.FLOAT },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    indexes: [
      { fields: ["job_id", "user_id"], unique: true },
      { fields: ["status"] },
    ],
  }
);
