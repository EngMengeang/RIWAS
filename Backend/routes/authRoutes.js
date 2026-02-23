import express from "express"
import * as authController from "../controllers/authController.js"
import { validateRequest, signUpSchema, signInSchema } from "../middlewares/validation.js"

const router = express.Router()

router.post("/sign-up", validateRequest(signUpSchema), authController.signUp)
router.post("/sign-in", validateRequest(signInSchema), authController.signIn)
router.post("/refresh-token", authController.refreshToken)
router.post("/logout", authController.logout)

export default router
