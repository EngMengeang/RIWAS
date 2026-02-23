import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

import { JOB_STATUS, JOB_TYPE } from "../config/constants.js";

export const JobPosting = sequelize.define("JobPosting", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postedBy: { type: DataTypes.UUID, allowNull: false, references: { model: "Users", key: "id" } },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  requirements: { type: DataTypes.JSONB, allowNull: true },
  responsibility: { type: DataTypes.TEXT, allowNull: true },
  department: { type: DataTypes.STRING, allowNull: true },
  location: { type: DataTypes.STRING, allowNull: true },
  jobType: { type: DataTypes.ENUM(...Object.values(JOB_TYPE)), allowNull: true },
  salary: { type: DataTypes.JSONB, allowNull: true },
  status: { type: DataTypes.ENUM(...Object.values(JOB_STATUS)), defaultValue: JOB_STATUS.DRAFT },
  coverImage: { type: DataTypes.STRING, allowNull: true },
  coverImagePublicId: { type: DataTypes.STRING, allowNull: true },
  applicantsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  applicationDeadline: { type: DataTypes.DATE, allowNull: true },
  publishedAt: { type: DataTypes.DATE, allowNull: true },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
