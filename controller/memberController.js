import Member from '../models/member.js';
import Community from '../models/community.js';
import Role from '../models/role.js';
import User from '../models/user.js';

const getAllMembers = async (req, res) => {
    try {
        const communityId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const members = await Member.find({ community: communityId })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'role', // Expand role details
                select: 'id name' // Only select id and name fields
            })
            .populate({
                path: 'user', // Expand user details
                select: 'id name' // Only select id and name fields
            })
            .exec();

        const total = await Member.countDocuments({ community: communityId });

        const response = {
            data: members,
            meta: {
                total,
                pages: Math.ceil(total / limit),
                page
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addMember = async (req, res) => {
    try {
        const { community, user, role } = req.body;
        const currentUser = req.userId;

        // Check if the user has the admin role
        const member = await Member.findOne({ user: currentUser, community });
        const memberRole= await Role.findOne({id: member.role});
        if (!member || memberRole.name !== 'Community Admin') {
            return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
        }

        // Check if community exists
        const communityExists = await Community.findOne({id: community});
        if (!communityExists) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user exists
        const userExists = await User.findOne({id: user});
        if (!userExists) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if role exists
        const roleExists = await Role.findOne({id: role});
        if (!roleExists) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Create new member
        const newMember = new Member({
            community,
            user,
            role
        });

        await newMember.save();

        res.status(201).json({ message: 'Member added successfully', data: newMember });
    } catch (error) {
        console.error('Error adding member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteMember=async (req,res)=>{
    try{
        const currentUser = req.userId;
        const {id}= req.params.id;

        const memberToRemove = await Member.findOne({id: id});
        if (!memberToRemove) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = await Member.findOne({ user: currentUser});
        const currentUserRole = await Role.findOne({id: member.role});
        if (!currentUserRole || (currentUserRole.name !== 'Community Admin' && currentUserRole.name !== 'Community Moderator')) {
            return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
     }

     const currentUserCommunity=member.community;
     const memberToRemoveCommunity=memberToRemove.community;
     if(currentUserCommunity  !==  memberToRemoveCommunity){
        return res.status(403).json({ error: 'NOT_ALLOWED_ACCESS' });
     }

     await Member.findOneAndDelete({ id: id });

    }catch (error) {
        console.error('Error removing member:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export {getAllMembers,addMember,deleteMember};