import express from "express"
import * as userController from "../controllers/userController.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { upload, handleImageUpload } from "../middlewares/uploadMiddleware.js"

const router = express.Router()

router.get("/", authenticate, userController.getAllUsers)
router.get("/:id", authenticate, userController.getUserById)
router.put("/profile", authenticate, upload.single("image"), handleImageUpload, userController.updateProfile)
router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser)

export default router
