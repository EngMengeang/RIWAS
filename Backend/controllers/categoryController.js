import { Category } from "../models/Category.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ name: req.body.name });
  res.status(201).json({ data: category });
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [["created_at", "DESC"]] });
  res.status(200).json({ data: categories });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  await category.update({ name: req.body.name });
  res.status(200).json({ data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  await category.destroy();
  res.status(200).json({ message: "Category deleted" });
});

// pg fix too 