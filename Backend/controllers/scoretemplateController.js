import { ScoreTemplate } from "../models/Scoretemplate.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Create a new template
export const createTemplate = asyncHandler(async (req, res) => {
  const template = await ScoreTemplate.create(req.body);
  res.status(201).json({ data: template });
});

// Activate a template (best practice)
export const setActiveTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;

  const template = await ScoreTemplate.findByPk(templateId);
  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  if (template.is_active) {
    return res.json({ message: "Template already active", data: template });
  }

  // Deactivate all templates
  await ScoreTemplate.update({ is_active: false }, { where: {} });

  // Activate the selected template
  await ScoreTemplate.update({ is_active: true }, { where: { id: templateId } });

  const updatedTemplate = await ScoreTemplate.findByPk(templateId);
  res.json({ message: "Template activated", data: updatedTemplate });
});

// Get the currently active template
export const getActiveTemplate = asyncHandler(async (req, res) => {
  const template = await ScoreTemplate.findOne({ where: { is_active: true } });
  res.json({ data: template });
});
