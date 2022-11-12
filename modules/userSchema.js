import mongoose from "mongoose";
import bcrypt from "bcryptjs";
//user schema
const userSchema = new mongoose.Schema({
  uname: {
    type: String,
    match: [/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/, "Please enter a valid username"],
    required: [true, "Please add a username"],
  },
  gender: {
    type: String,
    match: [/^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/, "Please enter a valid gender"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
    required: [true, "Please add a email"],
  },
  role: {
    type: String,
    default: "User",
  },
  token: String,
  image: {
    type: String,
    default:
      "https://res.cloudinary.com/dc1zhz2bg/image/upload/v1667140385/Users/user_xv7hft.png",
  },
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

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  const HashPassword = await bcrypt.hash(this.password, salt);
  this.password = HashPassword;
  next();
});

const userModel = new mongoose.model("users", userSchema);

export default userModel;
