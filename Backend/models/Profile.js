import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./User.js";
import { USER_ROLES } from "../config/constants.js";

export const Profile = sequelize.define("Profile", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false, unique: true, references: { model: User, key: "id" }, onDelete: "CASCADE" , onUpdate: "CASCADE"},
  bio: { type: DataTypes.TEXT, allowNull: true },
  avatarUrl: { type: DataTypes.STRING, allowNull: true },
  headline: { type: DataTypes.STRING, allowNull: true },
  about: { type: DataTypes.TEXT, allowNull: true },
  experience: { type: DataTypes.INTEGER, allowNull: true },
  websiteUrl: { type: DataTypes.STRING, allowNull: true },
  github: { type: DataTypes.STRING, allowNull: true },
  linkedin: { type: DataTypes.STRING, allowNull: true },
  twitter: { type: DataTypes.STRING, allowNull: true },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  role: { type: DataTypes.ENUM(...Object.values(USER_ROLES)), allowNull: false, defaultValue: USER_ROLES.CANDIDATE },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});
