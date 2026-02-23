import { JobPosting } from "../models/JobPosting.js";
import { User } from "../models/User.js";
import { JobApplication } from "../models/JobApplication.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { deleteImage } from "../utils/cloudinary.js";
import { Op } from "sequelize";
import { JOB_TYPE, JOB_STATUS , NOTIFICATION_TYPES} from "../config/constants.js";
import { createNotification } from "../services/notificationService.js";

// CREATE JOB POSTING

export const createJob = asyncHandler(async (req, res) => {
  const { jobType, status } = req.validatedData;

  // Validate job type
  if (jobType && !Object.values(JOB_TYPE).includes(jobType)) {
    return res.status(400).json({
      error: `Invalid job type. Must be one of: ${Object.values(JOB_TYPE).join(", ")}`
    });
  }

  // Validate status (optional on create)
  if (status && !Object.values(JOB_STATUS).includes(status)) {
    return res.status(400).json({
      error: `Invalid job status. Must be one of: ${Object.values(JOB_STATUS).join(", ")}`
    });
  }

  const jobData = {
    ...req.validatedData,
    postedBy: req.user.id,
    status: status || JOB_STATUS.DRAFT,
  };

  // Image
  if (req.uploadedImage) {
    jobData.coverImage = req.uploadedImage.url;
    jobData.coverImagePublicId = req.uploadedImage.publicId;
  }

  // Deadline
  if (jobData.applicationDeadline) {
    jobData.applicationDeadline = new Date(jobData.applicationDeadline);
  }

  // Auto publish timestamp
  if (jobData.status === JOB_STATUS.PUBLISHED) {
    jobData.publishedAt = new Date();
  }

  const job = await JobPosting.create(jobData);

  // Notification (Publish only)

   if (job.status === JOB_STATUS.PUBLISHED) {
    await createNotification({
      senderId: req.user.profile.id,
      recipientId: req.user.profile.id,
      type: NOTIFICATION_TYPES.JOB_PUBLISHED,
      content: `Your job "${job.title}" has been published.`,
    });
  }
  
  res.status(201).json({
    message: "Job created successfully",
    data: job
  });
});

// Get all Job Posting
export const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, location, jobType } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  if (status) where.status = status;
  if (jobType) where.jobType = jobType;
  if (location) where.location = { [Op.iLike]: `%${location}%` };

  const { count, rows } = await JobPosting.findAndCountAll({
    where,
    limit: Number(limit),
    offset,
    include: [
      {
        model: User,
        as: "recruiter",
        attributes: { exclude: ["password"] }
      }
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    data: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
    },
  });
});

// Get Job by ID 
export const getJobById = asyncHandler(async (req, res) => {
  const job = await JobPosting.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "recruiter",
        attributes: { exclude: ["password"] }
      },
      {
        model: JobApplication,
        as: "applications"
      }
    ],
  });

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.status(200).json({ data: job });
});


// Update Job Posting 
export const updateJob = asyncHandler(async (req, res) => {
  const job = await JobPosting.findByPk(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  // Authorization
  if (job.postedBy !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const data = req.validatedData || req.body;

  // Validate job type
  if (data.jobType && !Object.values(JOB_TYPE).includes(data.jobType)) {
    return res.status(400).json({
      error: `Invalid job type. Must be one of: ${Object.values(JOB_TYPE).join(", ")}`
    });
  }

  // Validate status
  if (data.status && !Object.values(JOB_STATUS).includes(data.status)) {
    return res.status(400).json({
      error: `Invalid job status. Must be one of: ${Object.values(JOB_STATUS).join(", ")}`
    });
  }

  // Image replace
  if (req.uploadedImage) {
    if (job.coverImagePublicId) {
      await deleteImage(job.coverImagePublicId);
    }
    data.coverImage = req.uploadedImage.url;
    data.coverImagePublicId = req.uploadedImage.publicId;
  }

  // Deadline
  if (data.applicationDeadline) {
    data.applicationDeadline = new Date(data.applicationDeadline);
  }

  // Status transitions
  if (data.status === JOB_STATUS.PUBLISHED && !job.publishedAt) {
    data.publishedAt = new Date();

    await createNotification({
      senderId: req.user.profile.id,
      recipientId: req.user.profile.id,
      type: NOTIFICATION_TYPES.JOB_PUBLISHED,
      content: `Your job "${job.title}" has been published.`,
    });
  }

  if (data.status === JOB_STATUS.CLOSED) {
    await createNotification({
      senderId: req.user.profile.id,
      recipientId: req.user.profile.id,
      type: NOTIFICATION_TYPES.JOB_CLOSED,
      content: `Your job "${job.title}" has been closed.`,
    });
  }


  await job.update(data);

  res.status(200).json({
    message: "Job updated successfully",
    data: job
  });
});

// Delete Job Posting 
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await JobPosting.findByPk(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.postedBy !== req.user.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  if (job.coverImagePublicId) {
    await deleteImage(job.coverImagePublicId);
  }

  await job.destroy();

  res.status(200).json({
    message: "Job deleted successfully"
  });
});
