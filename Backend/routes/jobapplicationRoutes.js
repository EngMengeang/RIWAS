import express from "express";
import * as jobapplicationController from "../controllers/jobapplicationController.js";
import { authenticate } from "../middlewares/auth.js";
import uploadApplicationFiles from "../middlewares/uploadApplicationFiles.js";

const router = express.Router();

router.post(
  "/submit",
  authenticate,
  uploadApplicationFiles.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  jobapplicationController.submitApplication
);

router.get("/", authenticate, jobapplicationController.getApplications);

router.get("/:id", authenticate, jobapplicationController.getApplicationById);

router.put("/:id", authenticate, jobapplicationController.updateApplicationStatus);

router.delete("/:id", authenticate, jobapplicationController.deleteApplication);

router.get("/:id/resume", authenticate, jobapplicationController.getResume);

router.get("/:id/coverLetter", authenticate, jobapplicationController.getCoverLetter);

export default router;
