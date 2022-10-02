import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from 'bcryptjs';

//user schema
const userSchema = new Schema({
  uname: String,
  password: String,
  email: String,
});


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});


const userModel = new mongoose.model("users", userSchema);

export default userModel;
