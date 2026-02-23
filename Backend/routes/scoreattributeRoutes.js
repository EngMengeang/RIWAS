import express from "express";
import {
  createScoreAttribute,
  getAttributesByTemplate,
  updateActiveAttributes,
} from "../controllers/scoreattributeController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Create a new attribute
router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  createScoreAttribute
);

// Get attributes by template ID
router.get(
  "/template/:templateId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  getAttributesByTemplate
);

// Update which attributes are active for a template
router.put(
  "/activate",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  updateActiveAttributes
);

export default router;
