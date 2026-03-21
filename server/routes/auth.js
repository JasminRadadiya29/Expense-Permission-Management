import express from 'express';
import * as authController from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { validateSignup, validateLogin, validateForgotPassword, validateChangePassword } from '../middleware/validation.js';

const router = express.Router();

router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/change-password', auth, validateChangePassword, authController.changePassword);
router.get('/me', auth, authController.getMe);

export default router;