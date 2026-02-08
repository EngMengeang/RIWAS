import { ScoreAttribute } from "../models/ScoreAttribute.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// Create a new attribute
export const createScoreAttribute = asyncHandler(async (req, res) => {
  const attribute = await ScoreAttribute.create(req.body);
  res.status(201).json({ data: attribute });
});

// Get attributes by template
export const getAttributesByTemplate = asyncHandler(async (req, res) => {
  const { templateId } = req.params;
  const attributes = await ScoreAttribute.findAll({ where: { template_id: templateId } });
  res.json({ data: attributes });
});

// Update active attributes (best practice)
export const updateActiveAttributes = asyncHandler(async (req, res) => {
  const { template_id, activeIds } = req.body;

  const attributes = await ScoreAttribute.findAll({ where: { template_id } });
  if (!attributes.length) {
    return res.status(404).json({ message: "No attributes found for this template" });
  }

  // Deactivate attributes that are currently active but not in activeIds
  await ScoreAttribute.update(
    { is_active: false },
    { where: { template_id, id: attributes.map(a => a.id).filter(id => !activeIds.includes(id)) } }
  );

  // Activate the selected attributes that are not already active
  await ScoreAttribute.update(
    { is_active: true },
    { where: { id: activeIds, is_active: false } }
  );

  const updatedAttributes = await ScoreAttribute.findAll({ where: { template_id } });
  res.json({ message: "Scoring template updated", data: updatedAttributes });
});
