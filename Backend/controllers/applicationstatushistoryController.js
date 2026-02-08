import { ApplicationStatusHistory } from "../models/ApplicationStatusHistory.js";
import { JobApplication } from "../models/JobApplication.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const createStatusHistory = async ({
  applicationId,
  oldStatus,
  newStatus,
  recruiterId,
  notes = null,
}) => {
  return ApplicationStatusHistory.create({
    application_id: applicationId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: recruiterId,
    notes,
  });
};

export const getStatusHistoryByApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const history = await ApplicationStatusHistory.findAll({
    where: { application_id: applicationId },
    order: [["changed_at", "DESC"]],
  });

  res.status(200).json({ data: history });
});
