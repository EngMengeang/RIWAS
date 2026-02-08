import { User } from "../models/User.js"
import { asyncHandler } from "../middlewares/errorHandler.js"
import { Profile } from "../models/Profile.js"
import { sequelize } from "../models/index.js" // Import sequelize
import { deleteImage } from "../utils/cloudinary.js"


// Get all users 
// with pagination, filtering by role and searching by name
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query
  const offset = (page - 1) * limit

  const where = {}
  if (role) where.role = role
  if (search) {
    where[sequelize.Op.or] = [
      sequelize.where(
        sequelize.fn("concat", sequelize.col("firstName"), " ", sequelize.col("lastName")),
        sequelize.Op.iLike,
        `%${search}%`,
      ),
    ]
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit: Number.parseInt(limit),
    offset,
    attributes: { exclude: ["password"] },
    include: [{ model: Profile, as: "profile" }],
  })

  res.status(200).json({
    data: rows,
    pagination: { total: count, page: Number.parseInt(page), limit: Number.parseInt(limit) },
  })
})

// Get user by ID 

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Profile, as: "profile" }],
  })

  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  res.status(200).json({ data: user.toJSON() })
})


// Update user profile including profile and cover images

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id)

  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  if (req.uploadedImage && req.body.imageType === "profile") {
    if (user.profilePicturePublicId) {
      await deleteImage(user.profilePicturePublicId)
    }
    req.validatedData.profilePicture = req.uploadedImage.url
    req.validatedData.profilePicturePublicId = req.uploadedImage.publicId
  }

  if (req.uploadedImage && req.body.imageType === "cover") {
    if (user.coverImagePublicId) {
      await deleteImage(user.coverImagePublicId)
    }
    req.validatedData.coverImage = req.uploadedImage.url
    req.validatedData.coverImagePublicId = req.uploadedImage.publicId
  }

  await user.update(req.validatedData)

  res.status(200).json({
    message: "Profile updated successfully",
    data: user.toJSON(),
  })
})


// Delete user by ID along with their images from Cloudinary

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id)

  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  if (user.profilePicturePublicId) {
    await deleteImage(user.profilePicturePublicId)
  }
  if (user.coverImagePublicId) {
    await deleteImage(user.coverImagePublicId)
  }

  await user.destroy()

  res.status(200).json({ message: "User deleted successfully" })
})
