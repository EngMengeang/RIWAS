import express from "express";
import {getWorkflowDefinitions,createWorkflowDefinition,updateWorkflowDefinition,deleteWorkflowDefinition,} from "../controllers/workflowdefinitionController.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { USER_ROLES } from "../config/constants.js";

const router = express.Router();

// Any authenticated user can read workflow stages
router.get("/", authenticate, getWorkflowDefinitions);

// HR only: create, update, delete
router.post("/", authenticate,authorize(USER_ROLES.RECRUITER), createWorkflowDefinition);

router.put("/:id",authenticate,authorize(USER_ROLES.RECRUITER),updateWorkflowDefinition);

router.delete("/:id", authenticate,authorize(USER_ROLES.RECRUITER),deleteWorkflowDefinition );

export default router;