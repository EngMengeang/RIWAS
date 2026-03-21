import express from "express";
import {
  createTemplate,
  setActiveTemplate,
  getActiveTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/scoretemplateController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Create a new template
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  createTemplate
);

// Set a template as active
router.put(
  "/activate/:templateId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  setActiveTemplate
);

// Get the currently active template
router.get(
  "/active",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  getActiveTemplate
);

//Update template
router.put(
  "/:templateId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  updateTemplate
);

// Delete template
router.delete(
  "/:templateId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  deleteTemplate
);

export default router;
