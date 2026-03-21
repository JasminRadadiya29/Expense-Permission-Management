import express from 'express';
import * as userController from '../controllers/userController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, authorize('Admin', 'Manager'), userController.getUsers);
router.post('/', auth, authorize('Admin'), userController.createUser);
router.put('/:userId', auth, authorize('Admin'), userController.updateUser);
router.post('/:userId/reset-password', auth, authorize('Admin'), userController.resetUserPassword);
router.get('/managers', auth, userController.getManagers);

export default router;