import express from 'express';
import { AuthController } from '../controllers/authcontroller.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Protected routes
router.get('/session', protect, AuthController.getSession);
router.post('/logout', protect, AuthController.logout);

export default router;