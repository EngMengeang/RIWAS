import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const MatrixScore = sequelize.define("MatrixScore", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  application_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "JobApplications",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  stage_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  attribute_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "ScoreAttributes",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  interview_note: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "MatrixScores",
  timestamps: true,
  underscored: true,
});
