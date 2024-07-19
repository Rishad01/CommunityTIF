import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const memberSchema = new mongoose.Schema({
  id: {type: String,unique:true,default: () => Snowflake.generate()},
  community: { type: String, ref: 'Community', required: true },
  user: { type: String, ref: 'User', required: true },
  role: { type: String, ref: 'Role', required: true },
  created_at: { type: Date, default: Date.now },
});

const Member = mongoose.model('Member', memberSchema);
export default Member;