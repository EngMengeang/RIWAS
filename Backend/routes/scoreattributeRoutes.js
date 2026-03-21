import express from "express";
import {
  createScoreAttribute,
  getAttributesByTemplate,
  updateActiveAttributes,
  updateScoreAttribute,
  deleteScoreAttribute,

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

// Update attribute
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  updateScoreAttribute
);

// Delete attribute
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  deleteScoreAttribute
);

export default router;
