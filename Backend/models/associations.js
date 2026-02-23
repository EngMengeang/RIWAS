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
import { ApplicationStatusHistory } from "./ApplicationStatusHistory.js";

export function initializeAssociations() {
  // ---------------------------
  // User → Profile (1:1)
  // ---------------------------
  User.hasOne(Profile, { foreignKey: "user_id", as: "profile", onDelete: "CASCADE" });
  Profile.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // ---------------------------
  // Profile → Candidate / Recruiter (1:1)
  // ---------------------------

  User.hasOne(Candidate, {foreignKey: "user_id",as: "candidate",onDelete: "CASCADE",});
  Candidate.belongsTo(User, {foreignKey: "user_id",as: "user",});

  User.hasOne(Recruiter, {foreignKey: "user_id",as: "recruiter",onDelete: "CASCADE",});
  Recruiter.belongsTo(User, {foreignKey: "user_id",as: "user",});

  Profile.hasOne(Candidate, { foreignKey: "profile_id", as: "candidateInfo" });
  Candidate.belongsTo(Profile, { foreignKey: "profile_id", as: "profile" });

  Profile.hasOne(Recruiter, { foreignKey: "profile_id", as: "recruiterInfo" });
  Recruiter.belongsTo(Profile, { foreignKey: "profile_id", as: "profile" });

  // ---------------------------
  // User → JobPosting (1:N)
  // ---------------------------
  User.hasMany(JobPosting, { foreignKey: "postedBy", as: "jobPostings" });
  JobPosting.belongsTo(User, { foreignKey: "postedBy", as: "recruiter" });

  // ---------------------------
  // Candidate → JobApplication (1:N)
  // ---------------------------
  Candidate.hasMany(JobApplication, { foreignKey: "candidate_id", as: "applications", onDelete: "CASCADE" });
  JobApplication.belongsTo(Candidate, { foreignKey: "candidate_id", as: "candidate" });

  // ---------------------------
  // JobPosting → JobApplication (1:N)
  // ---------------------------
  JobPosting.hasMany(JobApplication, { foreignKey: "job_id", as: "applications", onDelete: "CASCADE" });
  JobApplication.belongsTo(JobPosting, { foreignKey: "job_id", as: "job" });

  // ---------------------------
  // JobApplication → InterviewSchedule (1:1)
  // ---------------------------
  JobApplication.hasOne(InterviewSchedule, { foreignKey: "application_id", as: "interview" });
  InterviewSchedule.belongsTo(JobApplication, { foreignKey: "application_id", as: "application" });

  // ---------------------------
  // Recruiter → InterviewSchedule (1:N)
  // ---------------------------
  Recruiter.hasMany(InterviewSchedule, { foreignKey: "scheduled_by", as: "scheduledInterviews", onDelete: "CASCADE" });
  InterviewSchedule.belongsTo(Recruiter, { foreignKey: "scheduled_by", as: "recruiter" });

  // ---------------------------
  // InterviewSchedule → InterviewFeedback (1:N)
  // ---------------------------
  InterviewSchedule.hasMany(InterviewFeedback, { foreignKey: "interview_id", as: "feedbacks", onDelete: "CASCADE" });
  InterviewFeedback.belongsTo(InterviewSchedule, { foreignKey: "interview_id", as: "interview" });

  // ---------------------------
  // Recruiter → InterviewFeedback (1:N)
  // ---------------------------
  Recruiter.hasMany(InterviewFeedback, { foreignKey: "given_by", as: "feedbackGiven", onDelete: "CASCADE" });
  InterviewFeedback.belongsTo(Recruiter, { foreignKey: "given_by", as: "recruiter" });

  // ---------------------------
  // JobApplication → ApplicationWorkflow (1:N)
  // ---------------------------
  JobApplication.hasMany(ApplicationWorkflow, { foreignKey: "application_id", as: "workflows", onDelete: "CASCADE" });
  ApplicationWorkflow.belongsTo(JobApplication, { foreignKey: "application_id", as: "application" });

  // JobApplication → ApplicationStatusHistory (1:N)
  JobApplication.hasMany(ApplicationStatusHistory, { foreignKey: "application_id", as: "statusHistory" });
  ApplicationStatusHistory.belongsTo(JobApplication, { foreignKey: "application_id", as: "application" });

  // Recruiter → ApplicationWorkflow (1:N)
  Recruiter.hasMany(ApplicationWorkflow, { foreignKey: "performed_by", as: "workflowActions", onDelete: "CASCADE" });
  ApplicationWorkflow.belongsTo(Recruiter, { foreignKey: "performed_by", as: "recruiter" });

  // ---------------------------
  // User → Notification (1:N) sender / recipient
  // ---------------------------
  User.hasMany(Notification, { foreignKey: "sender_id", as: "sentNotifications", onDelete: "CASCADE" });
  Notification.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

  User.hasMany(Notification, { foreignKey: "recipient_id", as: "receivedNotifications", onDelete: "CASCADE" });
  Notification.belongsTo(User, { foreignKey: "recipient_id", as: "recipient" });

  // ---------------------------
  // User ↔ Skill (M:N)
  // ---------------------------
  User.belongsToMany(Skill, { through: UserSkill, as: "skills", foreignKey: "user_id" });
  Skill.belongsToMany(User, { through: UserSkill, as: "users", foreignKey: "skill_id" });

  // ---------------------------
  // Category → Skill (1:N)
  // ---------------------------
  Category.hasMany(Skill, { foreignKey: "category_id", as: "skills", onDelete: "SET NULL" });
  Skill.belongsTo(Category, { foreignKey: "category_id", as: "category" });

  // ---------------------------
  // JobApplication → MatrixScore (1:N)
  // ---------------------------
  JobApplication.hasMany(MatrixScore, { foreignKey: "application_id", as: "matrixScores", onDelete: "CASCADE" });
  MatrixScore.belongsTo(JobApplication, { foreignKey: "application_id", as: "application" });

  // ScoreAttribute → MatrixScore (1:N)
  ScoreAttribute.hasMany(MatrixScore, { foreignKey: "attribute_id", as: "matrixScores", onDelete: "CASCADE" });
  MatrixScore.belongsTo(ScoreAttribute, { foreignKey: "attribute_id", as: "attribute" });
}