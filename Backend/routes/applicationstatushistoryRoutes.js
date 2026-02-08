import express from "express";
import { getStatusHistoryByApplication } from "../controllers/applicationstatushistoryController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.get(
  "/:applicationId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  getStatusHistoryByApplication
);

export default router;
