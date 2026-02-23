import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ScoreTemplate = sequelize.define("ScoreTemplate", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "ScoreTemplates",
  timestamps: true,
  underscored: true,
});
