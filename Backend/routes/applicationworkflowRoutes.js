import express from "express";
import {
  addWorkflowStep,
  getWorkflowByApplication,
} from "../controllers/applicationworkflowController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  addWorkflowStep
);

router.get(
  "/:applicationId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  getWorkflowByApplication
);
// need delete workflow one more 

export default router;
