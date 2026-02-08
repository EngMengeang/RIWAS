import express from "express";
import {
  addMatrixScore,
  getMatrixScoresByApplication,
} from "../controllers/matrixscoreController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  addMatrixScore
);

router.get(
  "/:applicationId",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  getMatrixScoresByApplication
);

export default router;
