import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import bcryptjs from "bcryptjs"
import { USER_ROLES } from "../config/constants.js"

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Cloudinary URL for profile picture",
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Cloudinary URL for cover image",
    },
    profilePicturePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverImagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      defaultValue: USER_ROLES.CANDIDATE,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10)
          user.password = await bcryptjs.hash(user.password, salt)
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcryptjs.genSalt(10)
          user.password = await bcryptjs.hash(user.password, salt)
        }
      },
    },
  },
)

User.prototype.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

User.prototype.toJSON = function () {
  const { password, ...userWithoutPassword } = this.dataValues
  return userWithoutPassword
}
