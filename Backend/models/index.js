import { sequelize } from "../config/database.js";

import { User } from "./User.js";
import { Profile } from "./Profile.js";
import { Candidate } from "./Candidate.js";
import { Recruiter } from "./Recruiter.js";
import { JobPosting } from "./JobPosting.js";
import { JobApplication } from "./JobApplication.js";
import { InterviewSchedule } from "./InterviewSchedule.js";
import { InterviewFeedback } from "./InterviewFeedback.js";
import { ApplicationWorkflow } from "./ApplicationWorkflow.js";
import { Notification } from "./Notification.js";
import { Skill } from "./Skill.js";
import { Category } from "./Category.js";
import { UserSkill } from "./UserSkill.js";
import { MatrixScore } from "./MatrixScore.js";
import { ScoreAttribute } from "./ScoreAttribute.js";

// Import associations
import { initializeAssociations } from "./associations.js";

// Initialize all associations
initializeAssociations();


export {
  sequelize,
  User,
  Profile,
  Candidate,
  Recruiter,
  JobPosting,
  JobApplication,
  InterviewSchedule,
  InterviewFeedback,
  ApplicationWorkflow,
  Notification,
  Skill,
  Category,
  UserSkill,
  MatrixScore,
  ScoreAttribute,
};
