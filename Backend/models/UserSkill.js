import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const UserSkill = sequelize.define("UserSkill", {
  user_id: { type: DataTypes.UUID, references: { model: "Users", key: "id" }, primaryKey: true },
  skill_id: { type: DataTypes.UUID, references: { model: "Skills", key: "id" }, primaryKey: true },
});
