import express from "express";
import {
  addMatrixScore,
  getMatrixScoresByApplication,
  updateMatrixScore,
  deleteMatrixScore,
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

//updated 
// Update score
router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  updateMatrixScore
);

// Delete score
router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  deleteMatrixScore
);

export default router;
