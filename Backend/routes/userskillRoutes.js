import express from "express";
import {
  addUserSkill,
  removeUserSkill,
} from "../controllers/userskillController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  addUserSkill
);

router.delete(
  "/:skill_id",
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  removeUserSkill
);

export default router;
