import { JobPosting } from "../models/JobPosting.js";
import { User } from "../models/User.js";
import { JobApplication } from "../models/JobApplication.js";
import { Candidate } from "../models/Candidate.js";
import { Profile } from "../models/Profile.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { deleteImage } from "../utils/cloudinary.js";
import { sequelize } from "../config/database.js";
import { Op, literal, fn, col } from "sequelize";
import { JOB_TYPE, JOB_STATUS, APPLICATION_STATUS, NOTIFICATION_TYPES } from "../config/constants.js";
import { createNotification } from "../services/notificationService.js";

// ── DASHBOARD DATA ──
export const getDashboardData = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const now = new Date();
  const m = month ? Number(month) : now.getMonth() + 1;
  const y = year ? Number(year) : now.getFullYear();

  // Today range
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  // Month range for hires
  const monthStart = new Date(y, m - 1, 1);
  const monthEnd = new Date(y, m, 1);

  // Total applicants today
  const totalApplicantsToday = await JobApplication.count({
    where: { applied_at: { [Op.gte]: todayStart, [Op.lt]: todayEnd } },
  });

  // Open positions (published jobs)
  const openPositions = await JobPosting.count({
    where: { status: JOB_STATUS.PUBLISHED },
  });

  // Hires this month
  const hiresThisMonth = await JobApplication.count({
    where: {
      status: APPLICATION_STATUS.HIRED,
      updatedAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
    },
  });

  // Avg time to hire (days between applied_at and updatedAt for hired apps)
  const [avgResult] = await sequelize.query(
    `SELECT AVG(EXTRACT(EPOCH FROM ("updatedAt" - "applied_at")) / 86400)::numeric(10,1) AS avg_days
     FROM "JobApplications" WHERE status = 'hired'`,
    { type: sequelize.QueryTypes.SELECT }
  );
  const avgTimeToHire = avgResult?.avg_days ? Number(avgResult.avg_days) : 0;

  // Total unique candidates
  const totalCandidates = await JobApplication.count({
    distinct: true,
    col: "user_id",
  });

  // Application status stats
  const applicationStatusStats = await JobApplication.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });

  // Applications by position (job title)
  const applicationsByPosition = await JobApplication.findAll({
    attributes: [[fn("COUNT", col("JobApplication.id")), "count"]],
    include: [{ model: JobPosting, as: "job", attributes: ["title"] }],
    group: ["job.id", "job.title"],
    raw: true,
    nest: true,
  });
  const byPosition = applicationsByPosition.map((r) => ({
    position: r.job?.title || "Unknown",
    count: Number(r.count),
  }));

  // Hires by month (for the given year)
  const hiresByMonthRaw = await sequelize.query(
    `SELECT TO_CHAR("updatedAt", 'Mon') AS month,
            EXTRACT(MONTH FROM "updatedAt")::int AS month_num,
            COUNT(*)::int AS count
     FROM "JobApplications"
     WHERE status = 'hired' AND EXTRACT(YEAR FROM "updatedAt") = :year
     GROUP BY month, month_num ORDER BY month_num`,
    { replacements: { year: y }, type: sequelize.QueryTypes.SELECT }
  );

  // Recent applications (last 20)
  const recentApps = await JobApplication.findAll({
    order: [["applied_at", "DESC"]],
    limit: 20,
    include: [
      {
        model: JobPosting,
        as: "job",
        attributes: ["title"],
      },
      {
        model: Candidate,
        as: "candidate",
        include: [
          {
            model: Profile,
            as: "profile",
            include: [{ model: User, as: "user", attributes: ["id", "firstName", "lastName"] }],
          },
        ],
      },
    ],
  });

  const recentApplications = recentApps.map((app) => {
    const plain = app.get({ plain: true });
    const user = plain.candidate?.profile?.user;
    return {
      id: plain.id,
      candidateName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
      position: plain.job?.title || "Unknown",
      status: plain.status,
      appliedDate: plain.applied_at,
      updatedAt: plain.updatedAt,
      candidate: {
        profile: {
          headline: plain.candidate?.profile?.headline || "",
          avatarUrl: plain.candidate?.profile?.avatarUrl || null,
        },
      },
    };
  });

  res.status(200).json({
    summary: {
      totalApplicantsToday,
      openPositions,
      hiresThisMonth,
      avgTimeToHire,
      totalCandidates,
    },
    applicationStatusStats,
    applicationsByPosition: byPosition,
    hiresByMonth: hiresByMonthRaw,
    recentApplications,
  });
});

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
      senderId: req.user.id,
      recipientId: req.user.id,
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
    attributes: {
      include: [
        [
          literal(`(SELECT COUNT(*) FROM "JobApplications" ja WHERE ja.job_id = "JobPosting".id)`),
          "totalApplications",
        ],
        [
          literal(`(SELECT COUNT(*) FROM "JobApplications" ja WHERE ja.job_id = "JobPosting".id AND ja.status = 'hired')`),
          "hiredCount",
        ],
      ],
    },
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
      senderId: req.user.id,
      recipientId: req.user.id,
      type: NOTIFICATION_TYPES.JOB_PUBLISHED,
      content: `Your job "${job.title}" has been published.`,
    });
  }

  if (data.status === JOB_STATUS.CLOSED) {
    await createNotification({
      senderId: req.user.id,
      recipientId: req.user.id,
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
