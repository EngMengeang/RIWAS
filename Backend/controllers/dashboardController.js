import { Op, fn, col, literal } from "sequelize";
import { sequelize } from "../config/database.js";

import { User } from "../models/User.js";
import { Candidate } from "../models/Candidate.js";
import { JobPosting } from "../models/JobPosting.js";
import { JobApplication } from "../models/JobApplication.js";
import { APPLICATION_STATUS, JOB_STATUS } from "../config/constants.js";

// ================= DATE RANGE =================
const buildDateRange = (month, year) => {
  const now = new Date();
  const y = year ? parseInt(year) : now.getFullYear();
  const m = month ? parseInt(month) - 1 : now.getMonth();

  return {
    startDate: new Date(y, m, 1),
    endDate: new Date(y, m + 1, 1),
  };
};

// ================= DASHBOARD =================
export const getDashboardData = async (req, res) => {
  try {
    const { month, year } = req.query;
    const { startDate, endDate } = buildDateRange(month, year);

    // ================= SUMMARY =================
    const [totalCandidates, openPositions, hiresThisMonth, avgTimeToHire] =
      await Promise.all([
        // Total candidates
        Candidate.count(),

        // Open job postings
        JobPosting.count({
          where: { status: JOB_STATUS.PUBLISHED },
        }),

        // Hired applications this month
        JobApplication.count({
          where: {
            status: APPLICATION_STATUS.HIRED,
            updatedAt: { [Op.gte]: startDate, [Op.lt]: endDate },
          },
        }),

        // Average time to hire (days)
        JobApplication.findOne({
          attributes: [
            [
              fn(
                "AVG",
                literal(`DATE_PART('day', "updatedAt" - "applied_at")`)
              ),
              "avg_days",
            ],
          ],
          where: literal(
            `"status" = '${APPLICATION_STATUS.HIRED}' AND "updatedAt" >= '${startDate.toISOString()}' AND "updatedAt" < '${endDate.toISOString()}'`
          ),
          raw: true,
        }),
      ]);

    // ================= APPLICATION STATUS PIE =================
    const applicationStatusStats = await JobApplication.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      where: literal(
        `"applied_at" >= '${startDate.toISOString()}' AND "applied_at" < '${endDate.toISOString()}'`
      ),
      group: ["status"],
      raw: true,
    });

    // ================= APPLICATIONS BY JOB =================
    const applicationsByPosition = await JobApplication.findAll({
      attributes: [
        [col("job.title"), "position"],
        [fn("COUNT", col("JobApplication.id")), "count"],
      ],
      include: [{ model: JobPosting, as: "job", attributes: [] }],
      group: ["job.title"],
      raw: true,
    });

    // ================= HIRES BY MONTH =================
    const yearValue = year || new Date().getFullYear();
    const hiresByMonth = await JobApplication.findAll({
      attributes: [
        [fn("TO_CHAR", col("updatedAt"), "Mon"), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: literal(
        `"status" = '${APPLICATION_STATUS.HIRED}' AND "updatedAt" >= '${yearValue}-01-01' AND "updatedAt" < '${yearValue + 1}-01-01'`
      ),
      group: [fn("TO_CHAR", col("updatedAt"), "Mon")],
      raw: true,
    });

    // ================= RECENT APPLICATIONS =================
    const recentApplications = await JobApplication.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "status", "applied_at"],
      include: [
        {
          model: Candidate,
          as: "candidate",
          attributes: ["id"],
          include: [
            { model: User, as: "user", attributes: ["firstName", "lastName"] },
          ],
        },
        { model: JobPosting, as: "job", attributes: ["title"] },
      ],
    });

    // ================= JOB OPENINGS WITH COUNT =================
    const jobOpenings = await JobPosting.findAll({
      where: { status: JOB_STATUS.PUBLISHED },
      attributes: [
        "id",
        "title",
        [
          literal(`(
            SELECT COUNT(*) 
            FROM "JobApplications" ja 
            WHERE ja.job_id = "JobPosting".id
          )`),
          "applications",
        ],
      ],
      limit: 5,
    });

    // ================= RESPONSE =================
    res.json({
      filters: {
        month: month || new Date().getMonth() + 1,
        year: year || new Date().getFullYear(),
      },

      summary: {
        totalCandidates,
        openPositions,
        hiresThisMonth,
        avgTimeToHire: avgTimeToHire?.avg_days
          ? Math.round(avgTimeToHire.avg_days)
          : 0,
      },

      applicationStatusStats,
      applicationsByPosition,
      hiresByMonth,

      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        candidateName: app.candidate?.user
          ? `${app.candidate.user.firstName} ${app.candidate.user.lastName}`
          : "Unknown",
        position: app.job?.title,
        status: app.status,
        appliedDate: app.applied_at,
      })),

      jobOpenings,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};
