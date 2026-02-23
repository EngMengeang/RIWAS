import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { authenticate } from '../middlewares/auth.js';
import upload from '../middlewares/uploadProfileImage.js';

const router = express.Router();

// Create profile with image
router.post('/',authenticate,upload.single('avatar'),profileController.createProfile);

// Get Profile by User ID
router.get('/:userId', profileController.getProfile);

// Update Profile

router.put('/',authenticate,upload.single('avatar'),profileController.updateProfile);

// Increment Profile Views

router.post('/:userId/view', profileController.incrementProfileViews);

export default router;

