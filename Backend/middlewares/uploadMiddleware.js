import multer from "multer"
import { uploadImage } from "../utils/cloudinary.js"
import { asyncHandler } from "./errorHandler.js"

// Use memory storage for direct upload to Cloudinary
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

export const handleImageUpload = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next()
  }

  const folder = req.body.folder || "RIWAS"
  const result = await uploadImage(req.file.buffer, folder)

  req.uploadedImage = {
    url: result.secure_url,
    publicId: result.public_id,
    size: result.bytes,
  }

  next()
})
