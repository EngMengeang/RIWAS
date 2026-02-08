import express from "express";
import {
  createSkill,
  getSkills,
  deleteSkill,
} from "../controllers/skillController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  createSkill
);

router.get("/", authenticate, getSkills);

router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  deleteSkill
);

export default router;
