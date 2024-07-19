import Role from "../models/role.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import Joi from 'joi';

// Joi schema for validation
const roleSchema = Joi.object({
  name: Joi.string().min(2).required(),
});

const createRole=async (req,res)=>{

const { error } = roleSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
    const id=Snowflake.generate();
    const {name}=req.body;

    try{
         const role= new Role({id:id,name});
         await role.save();
         res.json({
            "status": true,
            "content": {
              "data": {
                "id": role.id,
                "name": role.name,
                "created_at": role.created_at.toISOString(),
                "updated_at": role.updated_at.toISOString()
              }
            }
          })
    }catch (error) {
        res.status(500).json({ message: error });
      }
};

const getAllRoles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    try {
      const roles = await Role.find().skip(skip).limit(limit);
      const total = await Role.countDocuments();
  
      res.json({
        data: roles,
        meta: {
          total,
          pages: Math.ceil(total / limit),
          page,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };

export {createRole,getAllRoles};