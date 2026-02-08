import { Skill } from "../models/Skill.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const createSkill = asyncHandler(async (req, res) => {
  const { name, category_id } = req.body;

  const skill = await Skill.create({ name, category_id });
  res.status(201).json({ data: skill });
});

export const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.findAll({
    include: { model: Category, as: "category" },
  });
  res.status(200).json({ data: skills });
});

export const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findByPk(req.params.id);
  if (!skill) return res.status(404).json({ error: "Skill not found" });

  await skill.destroy();
  res.status(200).json({ message: "Skill deleted" });
});


// pg fix not finished yet 