import { MatrixScore } from "../models/MatrixScore.js";
import { ScoreAttribute } from "../models/ScoreAttribute.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { JobApplication } from "../models/JobApplication.js"; 

// Add a new matrix score
export const addMatrixScore = asyncHandler(async (req, res) => {
  const { application_id, attribute_id, score, interview_note, stage_name } = req.body;

  // Validate that the job application exists
  const application = await JobApplication.findByPk(application_id);
  if (!application) {
    return res.status(404).json({ message: "Job application not found" });
  }

  // Validate that the attribute exists
  const attribute = await ScoreAttribute.findByPk(attribute_id);
  if (!attribute) {
    return res.status(404).json({ message: "Score attribute not found" });
  }

  // Optional: validate score is between 1–5
  if (score < 1 || score > 5) {
    return res.status(400).json({ message: "Score must be between 1 and 5" });
  }

  // Create the matrix score
  const matrixScore = await MatrixScore.create({
    application_id,
    attribute_id,
    score,
    interview_note,
    stage_name,
  });

  res.status(201).json({ message: "Matrix score created", data: matrixScore });
});

// Get all matrix scores for a specific application
export const getMatrixScoresByApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  const scores = await MatrixScore.findAll({
    where: { application_id: applicationId },
    include: {
      model: ScoreAttribute,
      as: "attribute",
    },
    order: [["stage_name", "ASC"]], 
  });

  if (!scores.length) {
    return res.json({ message: "No scores found for this application", data: [] });
  }

  res.json({ data: scores });
});
