import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  createCategory
);

router.get("/", authenticate, getCategories);

router.put(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize(USER_ROLES.RECRUITER),
  deleteCategory
);

export default router;
