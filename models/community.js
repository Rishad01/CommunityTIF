import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const communitySchema = new mongoose.Schema({
  id: {type: String,unique:true,default: () => Snowflake.generate()},
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  owner: { type: String, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Community = mongoose.model('Community', communitySchema);
export default Community;