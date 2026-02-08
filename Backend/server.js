import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { sequelize } from "./config/database.js";

// Routes imports
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import jobpostingRoutes from "./routes/jobpostingRoutes.js"
import jobapplicationRoutes from "./routes/jobapplicationRoutes.js"
import interviewRoutes from "./routes/interviewRoutes.js"
//  update routes
import applicationstatushistoryRoutes from "./routes/applicationstatushistoryRoutes.js";
import applicationworkflowRoutes from "./routes/applicationworkflowRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import matrixscoreRoutes from "./routes/matrixscoreRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import userskillRoutes from "./routes/userskillRoutes.js";
// added new routes

import scoreattributeRoutes from "./routes/scoreattributeRoutes.js";
import scoretemplateRoutes from "./routes/scoretemplateRoutes.js";
// Middleware imports
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestValidator } from "./middlewares/requestValidator.js";

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

// --------------------
// Security Middleware
// --------------------
app.use(helmet()); // Adds HTTP headers to secure your app
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })   
);

// --------------------
// Logging & Compression
// --------------------
app.use(morgan(ENV === "development" ? "dev" : "combined")); // Detailed logging in dev
app.use(compression()); // Gzip compression for responses

// --------------------
// Body Parser
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// --------------------
// Request Validation
// --------------------
app.use(requestValidator);

// --------------------
// Health Check Endpoint
// --------------------
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// --------------------
// API Routes
// --------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/profiles", profileRoutes);
app.use("/api/jobpostings", jobpostingRoutes);
app.use("/api/jobapplications", jobapplicationRoutes);
app.use("/api/interviews", interviewRoutes);

// Updated new 
app.use("/api/workflows", applicationworkflowRoutes);
app.use("/api/status-history", applicationstatushistoryRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/user-skills", userskillRoutes);
app.use("/api/matrix-scores", matrixscoreRoutes);
// update 2 
app.use("/api/attributes", scoreattributeRoutes);
app.use("/api/templates", scoretemplateRoutes);

// --------------------
// 404 Handler
// --------------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --------------------
// Error Handler (last middleware)
// --------------------
app.use(errorHandler);

// --------------------
// Database Connection & Server Start
// --------------------
(async () => {
  try {
    // Check DB connection
    await sequelize.authenticate();
    console.log(`Database connection established (${ENV}).`);

    if (ENV === "development") {
      // In development, auto-sync models (alter tables if needed)
      await sequelize.sync({ alter: true });
      console.log("Database synchronized (alter).");
    } else {
      // In production, never auto-sync. Use migrations instead.
      console.log(
        "Production mode: Make sure you run migrations with `npx sequelize-cli db:migrate --env production`"
      );
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} [${ENV}]`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nShutting down gracefully...");
      await sequelize.close();
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("\nShutting down gracefully...");
      await sequelize.close();
      server.close(() => {
        console.log("Server closed.");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Unable to connect to database:", error);
    process.exit(1);
  }
})();
