import express from 'express';
import { createCommunity,getAllCommunities,getMyOwnedCommunities,getMyJoinedCommunities } from "../controller/communityController.js";
import { getAllMembers } from '../controller/memberController.js';
import { verifyToken } from '../controller/jwt.js';

const router = express.Router();

router.post('/',verifyToken,createCommunity);
router.get('/',getAllCommunities);
router.get('/:id/members',getAllMembers);
router.get('/me/owner',verifyToken,getMyOwnedCommunities);
router.get('/me/member',verifyToken,getMyJoinedCommunities);

export default router;