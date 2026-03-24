import { Op } from "sequelize";
import { WorkflowDefinition } from "../models/WorkflowDefinition.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

// GET /api/workflow-definitions
export const getWorkflowDefinitions = asyncHandler(async (req, res) => {
  const stages = await WorkflowDefinition.findAll({
    where: { is_active: true },
    order: [["order", "ASC"]],
  });
  res.status(200).json({ data: stages });
});

// POST /api/workflow-definitions
export const createWorkflowDefinition = asyncHandler(async (req, res) => {
  const { name, description, order, color } = req.body;

  if (!name || order === undefined) {
    return res.status(400).json({ error: "name and order are required" });
  }

  // Shift existing stages down if inserting in the middle
  await WorkflowDefinition.increment("order", {
    by: 1,
    where: { order: { [Op.gte]: order } }, 
  });

  const stage = await WorkflowDefinition.create({
    name,
    description: description || null,
    order,
    color: color || "#6ee7b7",
  });

  res.status(201).json({ message: "Workflow stage created", data: stage });
});

// PUT /api/workflow-definitions/:id
export const updateWorkflowDefinition = asyncHandler(async (req, res) => {
  const stage = await WorkflowDefinition.findByPk(req.params.id);
  if (!stage) return res.status(404).json({ error: "Workflow stage not found" });

  const { name, description, order, color, is_active } = req.body;

  await stage.update({
    ...(name        !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(order       !== undefined && { order }),
    ...(color       !== undefined && { color }),
    ...(is_active   !== undefined && { is_active }),
  });

  res.status(200).json({ message: "Workflow stage updated", data: stage });
});

// DELETE /api/workflow-definitions/:id
export const deleteWorkflowDefinition = asyncHandler(async (req, res) => {
  const stage = await WorkflowDefinition.findByPk(req.params.id);
  if (!stage) return res.status(404).json({ error: "Workflow stage not found" });

  await stage.update({ is_active: false });

  res.status(200).json({ message: "Workflow stage removed" });
});