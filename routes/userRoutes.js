import express from 'express';
import { signup, login, getMe } from '../controller/userController.js';
import { verifyToken } from '../controller/jwt.js';
const router = express.Router();

router.post('/signup', signup);
router.post('/signin', login);
router.get('/me',verifyToken,getMe);

export default router;