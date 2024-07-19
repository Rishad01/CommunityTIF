import express from 'express';
import { addMember,deleteMember } from '../controller/memberController.js';
import { verifyToken } from '../controller/jwt.js';

const router = express.Router();

router.post('/',verifyToken,addMember);
router.post('/:id',verifyToken,deleteMember);

export default router;