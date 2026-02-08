import { InterviewSchedule } from "../models/InterviewSchedule.js";
import { InterviewFeedback } from "../models/InterviewFeedback.js";
import { JobApplication } from "../models/JobApplication.js";
import { Candidate } from "../models/Candidate.js";
import { JobPosting } from "../models/JobPosting.js";
import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";
import { Recruiter } from "../models/Recruiter.js"; 
import { ApplicationWorkflow } from "../models/ApplicationWorkflow.js";
import { ApplicationStatusHistory } from "../models/ApplicationStatusHistory.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import {
  sendInterviewScheduledEmail,
  sendInterviewStatusUpdateEmail,
} from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";
import {
  NOTIFICATION_TYPES,
  APPLICATION_STATUS,
  WORKFLOW_STEP,
  INTERVIEW_STATUS,
} from "../config/constants.js";


// CREATE INTERVIEW

export const createInterview = asyncHandler(async (req, res) => {
  const {
    applicationId,
    scheduled_at,
    location,
    interview_type,
    title,
    description,
    duration,
    meeting_link,
    notes,
  } = req.body;

  if (!applicationId || !scheduled_at) {
    return res.status(400).json({ error: "applicationId and scheduled_at are required" });
  }

  // Fetch recruiter record
  const recruiter = await Recruiter.findOne({ where: { user_id: req.user.id } });
  if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

  // Fetch job application with candidate and job
  const application = await JobApplication.findByPk(applicationId, {
    include: [
      {
        model: Candidate,
        as: "candidate",
        include: {
          model: Profile,
          as: "profile",
          include: { model: User, as: "user" },
        },
      },
      { model: JobPosting, as: "job" },
    ],
  });

  if (!application) return res.status(404).json({ error: "Application not found" });

  // Authorization: only recruiter who posted the job
  if (application.job.postedBy !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  // Create interview
  const interview = await InterviewSchedule.create({
    application_id: applicationId,
    scheduled_by: recruiter.id, 
    scheduled_at,
    location,
    interview_type,
    title,
    description,
    duration,
    meeting_link,
    notes,
    status: INTERVIEW_STATUS.SCHEDULED,
  });

  // Workflow
  await ApplicationWorkflow.create({
    application_id: applicationId,
    step: WORKFLOW_STEP.INTERVIEW,
    performed_by: recruiter.id,
  });

  // Update application status and save history
  const oldStatus = application.status;
  await application.update({ status: APPLICATION_STATUS.INTERVIEW });

  await ApplicationStatusHistory.create({
    application_id: applicationId,
    old_status: oldStatus,
    new_status: APPLICATION_STATUS.INTERVIEW,
    changed_by: recruiter.id,
    notes: "Interview scheduled",
  });

  // Notify candidate
  const candidateUser = application.candidate.profile.user;

  await createNotification({
    senderId: recruiter.id,
    recipient: candidateUser,
    type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
    content: `Your interview "${title}" has been scheduled.`,
    application,
  });

  await sendInterviewScheduledEmail(candidateUser, interview);

  res.status(201).json({
    message: "Interview scheduled successfully",
    data: interview,
  });
});


// UPDATE INTERVIEW STATUS

export const updateInterviewStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  if (!Object.values(INTERVIEW_STATUS).includes(status)) {
    return res.status(400).json({ error: "Invalid interview status" });
  }

  const recruiter = await Recruiter.findOne({ where: { user_id: req.user.id } });
  if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

  const interview = await InterviewSchedule.findByPk(req.params.id, {
    include: [
      {
        model: JobApplication,
        as: "application",
        include: [
          {
            model: Candidate,
            as: "candidate",
            include: {
              model: Profile,
              as: "profile",
              include: { model: User, as: "user" },
            },
          },
          { model: JobPosting, as: "job" },
        ],
      },
    ],
  });

  if (!interview) return res.status(404).json({ error: "Interview not found" });

  // Authorization: only recruiter who posted the job
  if (interview.application.job.postedBy !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  interview.status = status;
  if (notes) interview.notes = notes;
  await interview.save();

  const candidateUser = interview.application.candidate.profile.user;

  await createNotification({
    senderId: recruiter.id,
    recipient: candidateUser,
    type: NOTIFICATION_TYPES.INTERVIEW_UPDATED,
    content: `Your interview "${interview.title}" status is now "${status}".`,
    application: interview.application,
  });

  await sendInterviewStatusUpdateEmail(candidateUser, interview);

  res.status(200).json({
    message: "Interview status updated successfully",
    data: interview,
  });
});


// ADD INTERVIEW FEEDBACK

export const addInterviewFeedback = asyncHandler(async (req, res) => {
  const { interviewId, comments, rating, recommendation, shared_with_candidate } = req.body;

  if (!interviewId) return res.status(400).json({ error: "interviewId is required" });

  const recruiter = await Recruiter.findOne({ where: { user_id: req.user.id } });
  if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

  const interview = await InterviewSchedule.findByPk(interviewId, {
    include: [
      {
        model: JobApplication,
        as: "application",
        include: [{ model: JobPosting, as: "job" }],
      },
    ],
  });

  if (!interview) return res.status(404).json({ error: "Interview not found" });

  // Authorization: only recruiter who posted the job
  if (interview.application.job.postedBy !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const feedback = await InterviewFeedback.create({
    interview_id: interviewId,
    given_by: recruiter.id,
    comments,
    rating,
    recommendation,
    shared_with_candidate: shared_with_candidate || false,
  });

  await ApplicationWorkflow.create({
    application_id: interview.application_id,
    step: WORKFLOW_STEP.FEEDBACK_PROVIDED,
    performed_by: recruiter.id,
  });

  res.status(201).json({
    message: "Feedback added successfully",
    data: feedback,
  });
});


// GET CANDIDATE INTERVIEWS

export const getCandidateInterviews = asyncHandler(async (req, res) => {
  const candidate = await Candidate.findOne({
    include: {
      model: Profile,
      as: "profile",
      where: { user_id: req.user.id },
    },
  });

  if (!candidate) return res.status(404).json({ error: "Candidate not found" });

  const interviews = await InterviewSchedule.findAll({
    include: [
      {
        model: JobApplication,
        as: "application",
        where: { candidate_id: candidate.id },
        include: [{ model: JobPosting, as: "job" }],
      },
    ],
    order: [["scheduled_at", "DESC"]],
  });

  res.status(200).json({ data: interviews });
});


// GET RECRUITER INTERVIEWS

export const getRecruiterInterviews = asyncHandler(async (req, res) => {
  const recruiter = await Recruiter.findOne({ where: { user_id: req.user.id } });
  if (!recruiter) return res.status(404).json({ error: "Recruiter not found" });

  const interviews = await InterviewSchedule.findAll({
    where: { scheduled_by: recruiter.id }, // <-- Use Recruiters.id
    include: [
      {
        model: JobApplication,
        as: "application",
        include: [
          {
            model: Candidate,
            as: "candidate",
            include: {
              model: Profile,
              as: "profile",
              include: { model: User, as: "user" },
            },
          },
          { model: JobPosting, as: "job" },
        ],
      },
    ],
    order: [["scheduled_at", "DESC"]],
  });

  res.status(200).json({ data: interviews });
});
