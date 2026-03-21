import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Op } from "sequelize";
export const WorkflowDefinition = sequelize.define(
  "WorkflowDefinition",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order: {
     
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    color: {
     
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "#6ee7b7",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "WorkflowDefinitions",
    underscored: false,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);