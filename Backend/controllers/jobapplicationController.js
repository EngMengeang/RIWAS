import { createRequire } from "module";
const require = createRequire(import.meta.url);

import axios from "axios";
import FormData from "form-data";

import { JobApplication } from "../models/JobApplication.js";
import { JobPosting } from "../models/JobPosting.js";
import { Candidate } from "../models/Candidate.js";
import { Profile } from "../models/Profile.js";
import { User } from "../models/User.js";
import { Recruiter} from "../models/Recruiter.js";
import { ApplicationStatusHistory } from "../models/ApplicationStatusHistory.js";
import { ApplicationWorkflow } from "../models/ApplicationWorkflow.js";

import { asyncHandler } from "../middlewares/errorHandler.js";
import { uploadImage, cloudinary, uploadPDF } from "../utils/cloudinary.js";
import { APPLICATION_STATUS, WORKFLOW_STEP, NOTIFICATION_TYPES, USER_ROLES } from "../config/constants.js";
import { createNotification } from "../services/notificationService.js";
import { sendApplicationStatusEmail } from "../services/emailService.js";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";


// Function to call Python service for multiple PDFs

async function extractTextWithPython(files) {
  const form = new FormData();
  for (const key in files) {
    form.append(key, files[key].buffer, files[key].originalname);
  }

  const response = await axios.post("http://127.0.0.1:5001/extract", form, {
    headers: form.getHeaders(),
    maxBodyLength: Infinity,
  });

  return response.data || {};
}


// Submit Application

export const submitApplication = asyncHandler(async (req, res) => {
  const { jobId } = req.body;

  const job = await JobPosting.findByPk(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const candidateProfile = await Profile.findOne({
    where: { user_id: req.user.id, role: USER_ROLES.CANDIDATE },
    include: [{ model: Candidate, as: "candidateInfo" }],
  });

  if (!candidateProfile) return res.status(403).json({ error: "Only candidates can apply" });
  const candidate = candidateProfile.candidateInfo;
  if (!candidate) return res.status(400).json({ error: "Candidate profile missing" });

  const exists = await JobApplication.findOne({
    where: { job_id: jobId, candidate_id: candidate.id },
  });
  if (exists) return res.status(409).json({ error: "Already applied" });

  const resumeFile = req.files?.resume?.[0];
  if (!resumeFile) return res.status(400).json({ error: "Resume is required" });

  // Upload resume
  const resumeUpload = await uploadPDF(resumeFile.buffer, "applications");
  const resumeUrl = resumeUpload.secure_url;
  const resumePublicId = resumeUpload.public_id;

  // Optional cover letter
  let coverLetterUrl = null;
  let coverLetterPublicId = null;
  const coverLetterFile = req.files?.coverLetter?.[0];
  if (coverLetterFile) {
    const upload = await uploadPDF(coverLetterFile.buffer, "cover-letters");
    coverLetterUrl = upload.secure_url;
    coverLetterPublicId = upload.public_id;
  }
  console.log("Cover Letter File:", coverLetterFile);
  // Extract text from Python service
  let extractedTexts = {};
  try {
    extractedTexts = await extractTextWithPython({
      resume: resumeFile,
      ...(coverLetterFile ? { coverLetter: coverLetterFile } : {}),
    });
  } catch (err) {
    console.warn("Text extraction failed:", err.message);
  }

  const resumeText = extractedTexts.resume || "";
  const coverLetterText = extractedTexts.coverLetter || "";

  // Gemini AI analysis

  let aiResult = {};
  try {
    const prompt = `
      You are analyzing a candidate's CV and cover letter for a job posting.
      Extract the candidate's skills, experience, and match score with the following job description:
      Job Description: ${job.description}
      Resume Text: ${resumeText}
      Cover Letter Text: ${coverLetterText}
      Return a JSON object:
      {
        "skills": ["list of skills from resume"],
        "experience": "years of experience related to job",
        "matchScore": 0-1,
        "missingSkills": ["skills required by job but not in resume"],
        "coverLetterScore": 0-1,
        "raw": "original text analysis"
      }
    `;

    const response = await axios.post(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const geminiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (geminiText) {
      try {
        aiResult = JSON.parse(geminiText);
      } catch {
        aiResult = { raw: geminiText };
      }
    }
  } catch (err) {
    console.error("Gemini AI analysis failed:", err.message);
    aiResult = { raw: "AI analysis failed" };
  }

  // Create application
  const application = await JobApplication.create({
    user_id: req.user.id,
    job_id: jobId,
    candidate_id: candidate.id,
    resume: resumeUrl,
    resumePublicId,
    cover_letter: coverLetterUrl,
    coverLetterPublicId,
    extracted_text: resumeText,
    cover_letter_text: coverLetterText,
    ai_analysis: aiResult,
    cover_letter_score: aiResult.coverLetterScore || null,
    missing_skills: aiResult.missingSkills || null,
    status: APPLICATION_STATUS.APPLIED,
    applied_at: new Date(),
  });

  await application.reload({
    include: [
      { model: JobPosting, as: "job" },
      {
        model: Candidate,
        as: "candidate",
        include: { model: Profile, as: "profile", include: { model: User, as: "user" } },
      },
    ],
  });

  // Notify candidate
  try {
    await createNotification({
      senderId: req.user.id,
      recipient: req.user,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      content: `Your application for "${job.title}" has been received.`,
      application,
    });
  } catch (err) {
    console.warn("Failed to send application status notification:", err.message);
  }

  res.status(201).json({ message: "Application submitted successfully", data: application });
});


// Update Application Status (Recruiter)
// Map each application status to a workflow step
const STATUS_TO_WORKFLOW_STEP = {
  applied: WORKFLOW_STEP.SCREENING,
  review: WORKFLOW_STEP.SCREENING,
  interview: WORKFLOW_STEP.INTERVIEW,
  offer: WORKFLOW_STEP.JOB_OFFER,
  rejected: WORKFLOW_STEP.DECISION,
  hired: WORKFLOW_STEP.DECISION,
};

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, rejection_reason, notes } = req.body;

  // Load application + job + candidate
  const application = await JobApplication.findByPk(req.params.id, {
    include: [
      { model: JobPosting, as: "job" },
      {
        model: Candidate,
        as: "candidate",
        include: { model: Profile, as: "profile", include: { model: User, as: "user" } },
      },
    ],
  });

  if (!application) return res.status(404).json({ error: "Application not found" });

  // Authorization: only job owner (recruiter)
  if (application.job.postedBy !== req.user.id)
    return res.status(403).json({ error: "Not authorized" });

  // Validate status
  if (!Object.values(APPLICATION_STATUS).includes(status))
    return res.status(400).json({ error: "Invalid status" });

  // Check if status is already set
  if (application.status === status)
    return res.status(400).json({ error: "Status already set" });

  const oldStatus = application.status;

  // Prepare update payload
  const updates = { status };
  if (status === APPLICATION_STATUS.REJECTED) {
    updates.rejected_at = new Date();
    updates.rejection_reason = rejection_reason || null;
  }

  // Update JobApplication
  await application.update(updates);

  // Log status history
  const recruiter = await Recruiter.findOne({ where: { user_id: req.user.id } });
  if (!recruiter)
    return res.status(400).json({ error: "Recruiter record not found. Cannot log history." });

  await ApplicationStatusHistory.create({
    application_id: application.id,
    old_status: oldStatus,
    new_status: status,
    changed_by: recruiter.id,
    notes: notes || rejection_reason || null,
  });

  // Log workflow step automatically based on status
  const workflowStep = STATUS_TO_WORKFLOW_STEP[status] || WORKFLOW_STEP.DECISION;

  await ApplicationWorkflow.create({
    application_id: application.id,
    step: workflowStep,
    performed_by: recruiter.id,
  });

  // Notify candidate & send email
  const candidateUser = application.candidate?.profile?.user;
  if (candidateUser) {
    await createNotification({
      senderId: req.user.id,
      recipient: candidateUser,
      type: NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED,
      content: `Your application for "${application.job.title}" is now "${status}".`,
      application,
    });

    await sendApplicationStatusEmail(candidateUser, application, status);
  }

  // Response
  res.status(200).json({
    message: "Application status updated successfully",
    data: application,
  });
});

// Get Candidate Applications

export const getApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const offset = (page - 1) * limit;

  const candidateProfile = await Profile.findOne({
    where: { user_id: req.user.id, role: USER_ROLES.CANDIDATE },
    include: [{ model: Candidate, as: "candidateInfo" }],
  });

  if (!candidateProfile) return res.status(403).json({ error: "Only candidates can access applications" });
  const candidate = candidateProfile.candidateInfo;

  const where = { candidate_id: candidate.id };
  if (status) where.status = status;

  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    include: [
      { model: JobPosting, as: "job" },
      {
        model: Candidate,
        as: "candidate",
        include: { model: Profile, as: "profile", include: { model: User, as: "user" } },
      },
    ],
    order: [["applied_at", "DESC"]],
  });

  res.status(200).json({ data: rows, pagination: { total: count, page: Number(page), limit: Number(limit) } });
});


// Get Application by ID

export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id, {
    include: [
      { model: JobPosting, as: "job" },
      {
        model: Candidate,
        as: "candidate",
        include: { model: Profile, as: "profile", include: { model: User, as: "user" } },
      },
    ],
  });

  if (!application) return res.status(404).json({ error: "Application not found" });

  const candidateUserId = application.candidate?.profile?.user?.id;
  if (req.user.id !== candidateUserId && req.user.id !== application.job.postedBy)
    return res.status(403).json({ error: "Not authorized" });

  res.status(200).json({ data: application });
});


// Delete Application

export const deleteApplication = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id, {
    include: { model: JobPosting, as: "job" },
  });

  if (!application) return res.status(404).json({ error: "Application not found" });

  const candidateProfile = await Profile.findOne({
    where: { user_id: req.user.id, role: USER_ROLES.CANDIDATE },
    include: [{ model: Candidate, as: "candidateInfo" }],
  });
  const candidateId = candidateProfile?.candidateInfo?.id;

  if (application.candidate_id !== candidateId && application.job.postedBy !== req.user.id)
    return res.status(403).json({ error: "Not authorized" });

  await application.destroy();
  res.status(200).json({ message: "Application deleted successfully" });
});


export const getResume = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found" });

  const job = await JobPosting.findByPk(application.job_id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  if (req.user.id !== application.user_id && req.user.id !== job.postedBy)
    return res.status(403).json({ error: "Not authorized" });

  if (!application.resumePublicId) return res.status(404).json({ error: "Resume not uploaded" });

  try {
    const url = cloudinary.url(application.resumePublicId, {
      resource_type: "raw", // for PDF
    });

    res.json({ url }); // return URL to frontend
  } catch (err) {
    console.error("Failed to get resume URL:", err.message);
    res.status(500).json({ error: "Failed to load resume" });
  }
});

export const getCoverLetter = asyncHandler(async (req, res) => {
  const application = await JobApplication.findByPk(req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found" });

  const job = await JobPosting.findByPk(application.job_id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  if (req.user.id !== application.user_id && req.user.id !== job.postedBy)
    return res.status(403).json({ error: "Not authorized" });

  if (!application.coverLetterPublicId) return res.status(404).json({ error: "Cover letter not uploaded" });

  try {
    const url = cloudinary.url(application.coverLetterPublicId, {
      resource_type: "raw",
    });

    res.json({ url });
  } catch (err) {
    console.error("Failed to get cover letter URL:", err.message);
    res.status(500).json({ error: "Failed to load cover letter" });
  }
});
