import express from "express"
import * as jobpostingController from "../controllers/jobpostingController.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest, createJobSchema, updateJobSchema } from "../middlewares/validation.js"
import { upload, handleImageUpload } from "../middlewares/uploadMiddleware.js"
import { USER_ROLES } from "../config/constants.js"
const router = express.Router()

// Post Job 

router.post("/",authenticate,authorize(USER_ROLES.RECRUITER),upload.single("image"),handleImageUpload,validateRequest(createJobSchema),jobpostingController.createJob)

// Get all Job

router.get("/", authenticate, jobpostingController.getAllJobs)

// Get Job by ID 

router.get("/:id", authenticate, jobpostingController.getJobById)

// Update Job

router.put("/:id",authenticate,authorize(USER_ROLES.RECRUITER),upload.single("image"),handleImageUpload,validateRequest(updateJobSchema),jobpostingController.updateJob,)

// Delete Job 

router.delete("/:id", authenticate, authorize(USER_ROLES.RECRUITER), jobpostingController.deleteJob)

export default router
