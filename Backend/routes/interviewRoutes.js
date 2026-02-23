import express from "express";
import {
  createInterview,
  updateInterviewStatus,
  addInterviewFeedback,
  getCandidateInterviews,
  getRecruiterInterviews,
} from "../controllers/interviewController.js";
import { authenticate } from "../middlewares/auth.js";
import { validateInterview, validateInterviewStatus } from "../middlewares/validateInterview.js";

const router = express.Router();

// Recruiter Route

router.post( "/schedule",authenticate,validateInterview,createInterview );
 
router.put("/status/:id",authenticate,validateInterviewStatus,updateInterviewStatus);

router.post("/feedback",authenticate,addInterviewFeedback);

router.get("/recruiter",authenticate,getRecruiterInterviews);

// CANDIDATE ROUTES
router.get("/candidate",authenticate,getCandidateInterviews);

export default router;
