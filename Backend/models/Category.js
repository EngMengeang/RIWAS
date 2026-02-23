import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Category = sequelize.define("Category", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
