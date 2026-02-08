import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const ScoreAttribute = sequelize.define("ScoreAttribute", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  template_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "ScoreTemplates",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: "ScoreAttributes",
  timestamps: true,
  underscored: true,
});
