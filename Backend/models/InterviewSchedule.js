// import { DataTypes } from "sequelize";
// import { sequelize } from "../config/database.js";
// import {NOTIFICATION_TYPES} from "../config/constants.js";
// import { INTERVIEW_STATUS } from "../config/constants.js";
// export const InterviewSchedule = sequelize.define("InterviewSchedule", {
//   id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   application_id: { type: DataTypes.UUID, allowNull: false, references: { model: "JobApplications", key: "id" }, onDelete: "CASCADE" },
//   scheduled_by: { type: DataTypes.UUID, allowNull: false, references: { model: "Recruiters", key: "id" }, onDelete: "CASCADE" },
//   scheduled_at: { type: DataTypes.DATE },
//   location: { type: DataTypes.STRING },
//   interview_type: { type: DataTypes.STRING },
//   title: { type: DataTypes.STRING },
//   description: { type: DataTypes.TEXT },
//   duration: { type: DataTypes.INTEGER },
//   meeting_link: { type: DataTypes.STRING },
//   notes: { type: DataTypes.TEXT },
//   status: { type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPES)), defaultValue: NOTIFICATION_TYPES.SCHEDULED  },
//   created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//   updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
// });
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { INTERVIEW_STATUS } from "../config/constants.js";

export const InterviewSchedule = sequelize.define("InterviewSchedule", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  application_id: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    references: { model: "JobApplications", key: "id" }, 
    onDelete: "CASCADE" 
  },
  scheduled_by: { 
    type: DataTypes.UUID, 
    allowNull: false, 
    references: { model: "Recruiters", key: "id" }, 
    onDelete: "CASCADE" 
  },
  scheduled_at: { type: DataTypes.DATE },
  location: { type: DataTypes.STRING },
  interview_type: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER },
  meeting_link: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  status: { 
    type: DataTypes.ENUM(...Object.values(INTERVIEW_STATUS)), 
    defaultValue: INTERVIEW_STATUS.SCHEDULED 
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
