import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, getDashboardData);

export default router;
