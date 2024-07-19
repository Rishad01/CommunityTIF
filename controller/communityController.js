import Community from "../models/community.js";
import Member from "../models/member.js";
import axios from 'axios';
import { Snowflake } from "@theinternetfolks/snowflake";
import Joi from 'joi';
import slugify from 'slugify';

// Joi schema for validation
const communitySchema = Joi.object({
  name: Joi.string().min(2).required(),
});

const createCommunity = async (req, res) => {
  const { error } = communitySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name } = req.body;
  const ownerId = req.userId;

  if (!ownerId) {
    return res.status(400).json({ message: 'Owner ID is required' });
  }

  try {
    // Generate a slug and ensure it's unique
    let slug = slugify(name, { replacement: '-' });
    let communityExists = await Community.findOne({ slug });

    while (communityExists) {
      slug = slugify(name + '-' + Snowflake.generate(), { replacement: '-' });
      communityExists = await Community.findOne({ slug });
    }

    const newCommunity = new Community({
      name,
      slug,
      owner: ownerId
    });

    await newCommunity.save();

    // Call the role API to create the "Community Admin" role
    const roleResponse = await axios.post('http://localhost:3000/v1/role', {
      name: 'Community Admin'
    });

    const roleId = roleResponse.data.content.data.id;

    const newMember = new Member({
      community: newCommunity.id,
      user: ownerId,
      role: roleId
    });

    await newMember.save();

    res.json({
      status: true,
      content: {
        data: {
          id: newCommunity.id,
          name: newCommunity.name,
          slug: newCommunity.slug,
          owner: newCommunity.owner,
          created_at: newCommunity.created_at.toISOString(),
          updated_at: newCommunity.updated_at.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Error creating community:', error);

    if (error.isAxiosError) {
      // Axios specific error handling
      console.error('Axios error details:', error.response?.data || error.message);
    } else {
      // General error handling
      console.error('General error details:', error.message);
    }

    res.status(500).json({ message: 'Error creating community' });
  }
};

const getAllCommunities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Calculate the number of documents to skip for pagination
        const skip = (page - 1) * limit;

        // Query for communities with pagination and populate the owner
        const communities = await Community.find()
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'owner', // Assuming 'owner' is the field that references User
                select: 'id name' // Select only 'id' and 'name' fields
            })
            .exec();

        // Count total number of documents for meta information
        const total = await Community.countDocuments();

        // Format the response
        const response = {
            data: communities,
            meta: {
                total,
                pages: Math.ceil(total / limit),
                page
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting communities:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getMyOwnedCommunities = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const communities = await Community.find({ owner: userId })
            .skip(skip)
            .limit(limit)
            .exec();

        const total = await Community.countDocuments({ owner: userId });

        const response = {
            data: communities,
            meta: {
                total,
                pages: Math.ceil(total / limit),
                page
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting owned communities:', error);
        res.status(500).json({ error: 'Internal Server Error',message: 'You may not be the owner of any community' });
    }
};

const getMyJoinedCommunities = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Find all memberships of the current user
        const memberships = await Member.find({ user: userId })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'community',
                select: 'id name slug owner created_at updated_at',
                populate: {
                    path: 'owner',
                    select: 'id name'
                }
            })
            .exec();
console.log(memberships);
        const total = await Member.countDocuments({ user: userId });

        const response = {
            data: memberships.map(membership => ({
                id: membership.community.id,
                name: membership.community.name,
                slug: membership.community.slug,
                owner: membership.community.owner,
                created_at: membership.community.created_at.toISOString(),
                updated_at: membership.community.updated_at.toISOString()
            })),
            meta: {
                total,
                pages: Math.ceil(total / limit),
                page
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting joined communities:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { createCommunity, getAllCommunities, getMyOwnedCommunities, getMyJoinedCommunities };