import { UserSkill } from "../models/UserSkill.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const addUserSkill = asyncHandler(async (req, res) => {
  const { skill_id } = req.body;

  await UserSkill.create({
    user_id: req.user.id,
    skill_id,
  });

  res.status(201).json({ message: "Skill added to user" });
});

export const removeUserSkill = asyncHandler(async (req, res) => {
  const { skill_id } = req.params;

  await UserSkill.destroy({
    where: { user_id: req.user.id, skill_id },
  });

  res.status(200).json({ message: "Skill removed" });
});


// pg fix too 