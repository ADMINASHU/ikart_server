import mongoose from "mongoose";

//user schema
const userSchema = new mongoose.Schema({
  uname: String,
  password: String,
  email: String,
  role: String,
  token: String,
  seller: {
    gstin: String,
    address: {
      line1: String,
      line2: String,
      line3: String,
      city: String,
      state: String,
      pincode: Number,
    },
  },
  cart: [
    {
      item: String,
      count: Number,
    },
  ],
});


const userModel = new mongoose.model("users", userSchema);

export default userModel;
