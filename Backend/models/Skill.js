import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Category } from "./Category.js";

export const Skill = sequelize.define("Skill", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  category_id: { type: DataTypes.UUID, references: { model: Category, key: "id" } },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
