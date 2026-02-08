import { ApplicationWorkflow } from "../models/ApplicationWorkflow.js";
import { JobApplication } from "../models/JobApplication.js";
import { Recruiter } from "../models/Recruiter.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { WORKFLOW_STEP } from "../config/constants.js";


// Add workflow step to an application

export const addWorkflowStep = asyncHandler(async (req, res) => {
  const { applicationId, step } = req.body;

  // Validate step
  if (!Object.values(WORKFLOW_STEP).includes(step)) {
    return res.status(400).json({
      error: "Invalid workflow step",
    });
  }

  // Validate application
  const application = await JobApplication.findByPk(applicationId);
  if (!application) {
    return res.status(404).json({
      error: "Application not found",
    });
  }

  // Get recruiter from logged-in user
  const recruiter = await Recruiter.findOne({
    where: { user_id: req.user.id },
  });

  if (!recruiter) {
    return res.status(404).json({
      error: "Recruiter record not found. Cannot add workflow step.",
    });
  }

  // Prevent duplicate workflow step
  const existingStep = await ApplicationWorkflow.findOne({
    where: {
      application_id: applicationId,
      step,
    },
  });

  if (existingStep) {
    return res.status(400).json({
      error: "This workflow step already exists for this application",
    });
  }

  // Create workflow step
  const workflow = await ApplicationWorkflow.create({
    application_id: applicationId,
    step,
    performed_by: recruiter.id, 
  });

  res.status(201).json({
    message: "Workflow step added successfully",
    data: workflow,
  });
});


// Get workflow steps by application

export const getWorkflowByApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const workflows = await ApplicationWorkflow.findAll({
    where: { application_id: applicationId },
    order: [["created_at", "ASC"]],
  });

  res.status(200).json({
    data: workflows,
  });
});
