import express from "express";
import * as userresumeController from "../controllers/userresumeController.js";
import { authenticate } from "../middlewares/auth.js";
import upload from "../middlewares/uploadFiles.js"; 

const router = express.Router();

// Upload a new resume
router.post(
  "/upload",
  authenticate,
  upload.single("resume"), 
  userresumeController.uploadUserResume
);

// Update an existing resume
router.put(
  "/:id",
  authenticate,
  upload.single("resume"), 
  userresumeController.updateUserResume
);

// Get all resumes of the current user
router.get("/", authenticate, userresumeController.getUserResumes);

// Get a specific resume URL
router.get("/:id", authenticate, userresumeController.getUserResumeUrl);

// Delete a resume
router.delete("/:id", authenticate, userresumeController.deleteUserResume);

export default router;
