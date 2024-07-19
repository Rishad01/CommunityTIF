import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const roleSchema = new mongoose.Schema({
  id: {type: String,unique:true,default: () => Snowflake.generate()},
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
